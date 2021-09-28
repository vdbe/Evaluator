module.exports = class BrainFuck {
    constructor() {
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
                    if (this.data[this.pointer] == 127) {
                        throw new Error("ASCII value too high");
                    } else {
                        this.data[this.pointer] += 1;
                    }
                    break;
                case "-":
                    if (this.data[this.pointer] == 0) {
                        throw new Error("ASCII value too low");
                    } else {
                        this.data[this.pointer] -= 1;
                    }
                    break;
                case ".":
                    this.result += String.fromCharCode(this.data[this.pointer]);
                    break;
                case "[":
                    if (this.data[this.pointer] == 0) {
                        while (string[i] != "]") {
                            i++;
                        }
                    }
                    break;
                case "]":
                    if (this.data[this.pointer] != 0) {
                        while (string[i] != "[") {
                            i--;
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