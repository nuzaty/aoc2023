import {readLines, spiltWith} from '../utils';

type LensInfo = {
    label: string;
    focusLength: number;
};

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

export default async function (isPart1: boolean): Promise<number> {
    // step 1 : read input into array
    let initSeq: string[] = [];
    for await (const line of readLines('./src/day15/input.txt')) {
        initSeq = [...initSeq, ...spiltWith(',', line)];
    }

    if (isPart1) {
        // step 2: find sum of HASH algorithm
        let sum = 0;
        for (const seq of initSeq) {
            sum += getHashVal(seq);
        }
        console.log('sum', sum);
        return sum;
    } else {
        // step 2: arrange lens into each box
        const lensBoxes = new Map<number, LensInfo[]>();
        for (const seq of initSeq) {
            if (seq.indexOf('-') !== -1) {
                // dash operator
                const label = seq.slice(0, -1);
                const boxNum = getHashVal(label);
                const box = lensBoxes.get(boxNum);
                if (box) {
                    const newBox = box.filter(lens => lens.label !== label);
                    lensBoxes.set(boxNum, newBox);
                }
            } else {
                // equals sign operator
                const [label, focusLength] = spiltWith('=', seq);
                const boxNum = getHashVal(label);
                const box = lensBoxes.get(boxNum);
                if (box) {
                    // case has the box
                    const elIndex = box.findIndex(el => el.label === label);
                    if (elIndex !== -1) {
                        // case 1: If there is already a lens
                        box[elIndex] = {
                            ...box[elIndex],
                            focusLength: Number(focusLength),
                        };
                    } else {
                        // case 2: If there is not already a lens
                        box.push({label, focusLength: Number(focusLength)});
                    }
                } else {
                    // case no box
                    const newBox: LensInfo[] = [];
                    newBox.push({label, focusLength: Number(focusLength)});
                    lensBoxes.set(boxNum, newBox);
                }
            }
        }

        // step 3: calculate the focusing power
        let focusingPower = 0;
        for (const [boxNum, box] of lensBoxes) {
            for (let i = 0; i < box.length; i++) {
                const slotNum = i + 1;
                const {focusLength} = box[i];
                focusingPower += (1 + boxNum) * slotNum * focusLength;
            }
        }

        console.log('focusingPower', focusingPower);
        return focusingPower;
    }
}
