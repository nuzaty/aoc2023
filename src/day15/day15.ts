
import { readLines, spiltWith } from "../utils";


function getHashVal(str: string) {
    let hashVal = 0;
    for (const char of str) {
        const asciiVal: number = char.charCodeAt(0);
        hashVal += asciiVal;
        hashVal *= 17;
        hashVal %= 256;
    }
    return hashVal;
}

export default async function () {

    // step 1 : read input into array
    let initSeq: string[] = [];
    for await (const line of readLines('./src/day15/input.txt')) {
        initSeq = [...initSeq, ...spiltWith(',', line)];
    }

    // step 2: find sum of HASH algorithm
    let sum = 0;
    for (const seq of initSeq) {
        sum += getHashVal(seq);
    }
    console.log('sum', sum);
}