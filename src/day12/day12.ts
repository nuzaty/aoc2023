import { readLines, spiltWith, spiltWithSpace } from "../utils";

type InputData = [
    inputSpringArr: string,
    damagedGroupSize: number[]
]

type Step2Data = [
    inputData: InputData,
    possibleGroupSizes: number[][]
]

type Step3Data = [
    inputSpringArr: string,
    possibleArr: string[],
    possibleArrLength: number,
]

const readPuzzleInput = async (): Promise<InputData[]> => {
    const input: InputData[] = [];
    for await (const line of readLines('./src/day12/input.txt')) {
        const token = spiltWithSpace(line);
        const springArr = token[0];
        const damagedGroupSize: number[] = spiltWith(',', token[1]).map(el => Number(el));
        // console.log('springArr', springArr, 'damagedSize', damagedSize);
        input.push([springArr, damagedGroupSize]);
    }
    return input;
}

const buildSpringArr = (goodGroupSize: number[], damagedGroupSize: number[]): string => {
    let inputArr = '';
    for (let i = 0; i < goodGroupSize.length; i++) {
        const goodSize = goodGroupSize[i];
        inputArr += '.'.repeat(goodSize);
        if (damagedGroupSize.length > i) {
            const damagedSize = damagedGroupSize[i];
            inputArr += '#'.repeat(damagedSize);
        }
    }
    return inputArr;
}

const isArrMatch = (arr: string, inputArr: string) => {
    if (arr.length !== inputArr.length)
        return false;

    for (let i = 0; i < inputArr.length; i++) {
        const inputChar = inputArr[i];
        if ((inputChar === '#' || inputChar === '.') && inputChar !== arr[i]) {
            return false;
        }
    }

    return true;
}

const combinationCountToGoodGroupCount = (combinationCount: number, maxSizePerGroup: number, totalGroup: number): number[] => {
    const base = (maxSizePerGroup + 1);
    let num = combinationCount;
    let combination: number[] = [];

    while (num > 0) {
        const digit = num % base;
        num = Math.floor(num / base);
        combination.push(digit);
    }


    if (combination.length > totalGroup) {
        throw new Error('combination length exceed limit!: [' + combination + '], ' + combinationCount + ', ' + maxSizePerGroup + ', ' + totalGroup);
    }

    if (combination.length < totalGroup) {
        combination = [...combination, ...Array(totalGroup - combination.length).fill(0)]
    }

    return combination.reverse();
}

export async function day12() {
    // step 1 : read puzzle input
    const input = await readPuzzleInput();
    console.log(input);

    // step 2 : find all possible good group size without consider input arrangement
    const allGoodPossibleGroupSize: Step2Data[] = []
    for (const [inputSpringArr, damagedGroupSize] of input) {
        const rowSize = inputSpringArr.length;
        const damagedCount = damagedGroupSize.reduce((prev, el) => Number(prev) + Number(el), 0);
        const nonDamagedCount = rowSize - damagedCount;
        const possbileGoodGroupCount = damagedGroupSize.length + 1;

        const goodSpringContraints: number[][] = Array(possbileGoodGroupCount).fill([1, nonDamagedCount]);

        // min constriant of first & last group can be zero;
        const firstOrLastContraint = [0, nonDamagedCount];
        goodSpringContraints[0] = firstOrLastContraint;
        goodSpringContraints[possbileGoodGroupCount - 1] = firstOrLastContraint;

        // console.log('rowSize', rowSize, 'damagedCount', damagedCount, 'nonDamagedCount', nonDamagedCount, 'possbileGoodGroupCount', possbileGoodGroupCount);
        // console.log('goodSpringContraints', goodSpringContraints);

        // find possible combination with constain
        const possibleArr: number[][] = [];
        let combination: number[] = [];
        let combinationCount = -1;
        while (combination.length !== possbileGoodGroupCount || !combination.every(el => el === nonDamagedCount)) {
            combinationCount++;
            combination = combinationCountToGoodGroupCount(combinationCount, nonDamagedCount, possbileGoodGroupCount);

            const sumOfCombination = combination.reduce((prev, el) => prev + el, 0);
            if (sumOfCombination !== nonDamagedCount)
                continue;

            let isMatchContraints = true;
            for (let i = 0; i < goodSpringContraints.length; i++) {
                const [min, max] = goodSpringContraints[i];
                if (i < combination.length) {
                    if (combination[i] < min || combination[i] > max) {
                        isMatchContraints = false;
                        break;
                    }
                }
            }
            if (!isMatchContraints)
                continue;

            possibleArr.push(combination);

            if (combination.every(el => el === nonDamagedCount))
                break;
        }

        allGoodPossibleGroupSize.push([[inputSpringArr, damagedGroupSize], possibleArr]);
    }

    // step 3 : filter out good group size that not match with puzzle input
    const filteredArrData: Step3Data[] = [];
    for (const [[inputSpringArr, damagedGroupSize], goodGroupSizes] of allGoodPossibleGroupSize) {
        const filteredArr = goodGroupSizes
            .map(goodGroupSize => buildSpringArr(goodGroupSize, damagedGroupSize))
            .filter(springArr => isArrMatch(springArr, inputSpringArr));

        filteredArrData.push([inputSpringArr, filteredArr, filteredArr.length]);
    }
    // console.log('filteredArrData', filteredArrData);

    // step 4 : calculate the sum of arrangement counts
    const sumOfArrCount = filteredArrData.reduce((prev, el) => prev + el[2], 0);
    console.log('sumOfArrCount', sumOfArrCount);
}