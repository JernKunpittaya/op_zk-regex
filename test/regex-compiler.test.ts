import { expect } from "chai";
const path = require("path");
const circom_tester = require("circom_tester");
// const generator = require("../compiler/gen");
const wasm_tester = circom_tester.wasm;
import * as fs from "fs";
const word_char =
  "(a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z|A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z|0|1|2|3|4|5|6|7|8|9|_)";
describe("regex compiler tests", function () {
  //TOFIX regex discrepancy in group ()
  const email_file = path.join(__dirname, "/test.eml");
  const padded_email_body = fs.readFileSync(email_file, "utf8");
  //   const padded_email_body = `padded email was meant for @katat body padded email was meant for @katat body`;
  let in_body_padded = padded_email_body
    .split("")
    .map((x: any) => x.charCodeAt(0));
  while (in_body_padded.length < 50) {
    in_body_padded.push(0);
  }
  in_body_padded = in_body_padded.map((x: any) => `${x}`);
  console.log("inbody: ", in_body_padded);
  let preselector_padded = ">&lt".split("").map((x: any) => x.charCodeAt(0));
  preselector_padded = preselector_padded.map((x: any) => `${x}`);
  console.log("preselector: ", preselector_padded);

  [
    [
      "1st match in the middle",
      // regex not important
      [`>&lt;(${word_char}+)`, 1],
      (signals: any) => {
        const to_reveal = "Jern/repo1"
          .split("")
          .map((x: any) => BigInt(x.charCodeAt(0)));
        for (let m in signals.main.reveal_shifted) {
          const index = signals.main.reveal_shifted[m];
          //   const last_pos = index.length - 1;
          if (to_reveal[m as any]) {
            console.log("digit", m, to_reveal[m as any]);
            console.log("index", index);
            // expect(index[last_pos]).to.equal(to_reveal[m as any]);
          }
        }
        // expect(signals.main.out).to.equal(1n);
        // expect(signals.main.start_idx).to.equal(3n);
      },
    ],
  ].forEach((test) => {
    //@ts-ignore
    const name: string = test[0];
    //@ts-ignore
    const regex: string = test[1][0];
    //@ts-ignore
    const match_idx: number = test[1][1];
    //@ts-ignore
    const checkSignals: Function = test[2];

    describe(name, () => {
      let circuit: any;
      before(async function () {
        // compile again
        // await generator.generateCircuit(regex, "../circuits");
        circuit = await wasm_tester(
          path.join(__dirname, "circuits", "test_regex_compiler.circom"),
          { recompile: true, output: `${__dirname}/../build/`, O: 0 }
        );
      });

      it("checks witness", async function () {
        let witness = await circuit.calculateWitness({
          msg: in_body_padded,
          substr: preselector_padded,
        });
        const signals = await circuit.getJSONOutput("main", witness);
        checkSignals(signals);
        await circuit.checkConstraints(witness);
      });
    });
  });
});
