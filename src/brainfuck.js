
module.exports = class BrainFuck {
    constructor() {
        //init
        this.pointer = 0;
        this.data = new Array(1000).fill(0);
        this.result = "";
        this.user = 0;
    }
    evaluate(string, userinput) {
        for (let i = 0; i < string.length; i++) {
            let command = string[i];
            switch (command) {
                case ">":
                    if (this.pointer == 999) {
                        throw new Error("Pointer too big");
                    } else {
                        this.pointer += 1;
                    }
                    break;
                case "<":
                    if (this.pointer == 0) {
                        throw new Error("Negative pointer");
                    } else {
                        this.pointer -= 1;
                    }
                    break;
                case "+":
                    this.data[this.pointer] += 1;
                    if(this.data[this.pointer] == 128){
                        this.data[this.pointer] = -128
                    }
                    break;
                case "-":
                    this.data[this.pointer] -= 1;
                    if(this.data[this.pointer] == -129){
                        this.data[this.pointer] = 127
                    }
                
                    break;
                case ".":
                    if (this.data[this.pointer] == 0) {
                        throw new Error("ASCII value too low");
                    }
                    if (this.data[this.pointer] == 127) {
                        throw new Error("ASCII value too high");
                    }
                    this.result += String.fromCharCode(this.data[this.pointer]);
                    break;
                case "[":
                    this.opened += 1;
                    if (this.data[this.pointer] == 0) {
                        let countclosed = 0;
                        let countopened = 1;
                        while (countclosed != countopened) {
                            i++;
                            if(string[i] == "["){
                                countopened += 1;
                            }
                            if(string[i] == "]"){
                                countclosed +=1 ;
                            }
                        }
                    }
                    break;
                case "]":
                    this.closed += 1;
                    if (this.data[this.pointer] != 0) {
                        let countclosed = 1;
                        let countopened = 0;
                        while (countopened != countclosed) {
                            i--;
                            if(string[i] == "["){
                                countopened+=1;
                            }
                            if(string[i] == "]"){
                                countclosed +=1 ;
                            }
                        }
                    }
                    break;
                case ",":
                    this.data[this.pointer] = userinput[this.user];
                    this.user += 1;
                default:
                    break;
            }
        }
        return this.result;
    }
};
