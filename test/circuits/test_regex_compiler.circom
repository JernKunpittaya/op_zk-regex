pragma circom 2.0.2;

include "../../build/compiled.circom";

component main { 
    public [ 
        msg,
        substr
    ] 
} = RegexWithPlain(50, 20,4);
