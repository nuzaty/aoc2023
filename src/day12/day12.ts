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

const generateNumsArray = (maxNum: number, arrLength: number): number[][] => {
    let numsArray: number[][] = [];

    for (let i = 0; i < arrLength; i++) {
        let newNumsArray: number[][] = [];

        for (let num = 0; num <= maxNum; num++) {
            if (numsArray.length === 0) {
                newNumsArray.push([num]);
            } else {
                newNumsArray.push(...numsArray.map(el => [num].concat(el)));
            }
        }
        numsArray = newNumsArray;
    }

    return numsArray;
}

// numContraints - [min,max] of each generated num
const generateNumsFromSum = (sum: number, numCount: number, numContraints: number[][]): number[][] => {
    const allNumsArray = generateNumsArray(sum, numCount);
    const possibleNumsArray = [];
    for (const nums of allNumsArray) {
        const sumOfNums = nums.reduce((prev, el) => prev + el, 0);
        if (sumOfNums === sum) {
            let isMatchContraints = true;
            for (let i = 0; i < numContraints.length; i++) {
                const [min, max] = numContraints[i];
                if (i < nums.length) {
                    if (nums[i] < min || nums[i] > max) {
                        isMatchContraints = false;
                        break;
                    }
                }
            }
            if (isMatchContraints)
                possibleNumsArray.push(nums);
        }
    }
    return possibleNumsArray;
}

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

export async function day12() {
    // const numsFromSum: number[][] = generateNumsFromSum(6, 4, [[0, 6], [1, 6], [1, 6], [0, 6]]);
    // console.log('numsFromSum', numsFromSum, numsFromSum.length);

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

        console.log('rowSize', rowSize, 'damagedCount', damagedCount, 'nonDamagedCount', nonDamagedCount, 'possbileGoodGroupCount', possbileGoodGroupCount);
        console.log('goodSpringContraints', goodSpringContraints);

        allGoodPossibleGroupSize.push([[inputSpringArr, damagedGroupSize], generateNumsFromSum(nonDamagedCount, possbileGoodGroupCount, goodSpringContraints)]);


    }

    // step 3 : filter out good group size that not match with puzzle input
    const filteredArrData: Step3Data[] = [];
    for (const [[inputSpringArr, damagedGroupSize], goodGroupSizes] of allGoodPossibleGroupSize) {
        const filteredArr = goodGroupSizes
            .map(goodGroupSize => buildSpringArr(goodGroupSize, damagedGroupSize))
            .filter(springArr => isArrMatch(springArr, inputSpringArr));

        filteredArrData.push([inputSpringArr, filteredArr, filteredArr.length]);
    }
    console.log('filteredArrData', filteredArrData);

    // step 4 : calculate the sum of arrangement counts
    const sumOfArrCount = filteredArrData.reduce((prev, el) => prev + el[2], 0);
    console.log('sumOfArrCount', sumOfArrCount);
}