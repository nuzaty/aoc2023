import { readLines, spiltWith, spiltWithSpace } from "../utils";

type PermutationData = {
    group: number,
    badAmount: number,
    permutation: number
}

type SpringPermutationData = {
    permutationData: PermutationData,
    currSpring: string,
    currIndex: number,
    remainingSpring: number
}

function calculateRemainingBad(group: number, badAmount: number, badAmountRecord: number[]) {
    let totalBad = 0;
    for (let i = group; i < badAmountRecord.length; i++) {
        totalBad += badAmountRecord[i];
    }
    return totalBad - badAmount;
}

function addBadSpringData(nextPermutaions: SpringPermutationData[], currData: SpringPermutationData, badAmountRecord: number[]) {
    const { group, badAmount } = currData.permutationData

    // case no remaining space
    if (calculateRemainingBad(group, badAmount, badAmountRecord) > currData.remainingSpring + 1) {
        return;
    }

    const newBadAmount = badAmount + 1;

    if (newBadAmount <= badAmountRecord[group]) {
        nextPermutaions.push({
            ...currData,
            currSpring: '#',
            permutationData: {
                ...currData.permutationData,
                badAmount: newBadAmount
            }
        });
    }
}

function newGoodSpringData(nextPermutaions: SpringPermutationData[], currData: SpringPermutationData, badAmountRecord: number[]) {
    const { group, badAmount, permutation } = currData.permutationData;

    // case no remaining space
    if (calculateRemainingBad(group, badAmount, badAmountRecord) > currData.remainingSpring + 1) {
        return;
    }

    // case next group
    if (badAmount > 0) {
        if (badAmount === badAmountRecord[group]) {  // check case invalid next group (the amount must be match with record data)
            const newGroup = group + 1;
            const existing = nextPermutaions
                .find(el => el.permutationData.group === newGroup
                    && el.permutationData.badAmount === 0);

            if (existing) {
                existing.permutationData.permutation += permutation;
            } else {
                nextPermutaions.push({
                    ...currData,
                    currSpring: '.',
                    permutationData: {
                        ...currData.permutationData,
                        group: newGroup,
                        badAmount: 0
                    }
                });
            }
        }
    }
    else {
        const existing = nextPermutaions
            .find(el => el.permutationData.group === group
                && el.permutationData.badAmount === 0);

        if (existing) {
            existing.permutationData.permutation += permutation;
        } else {
            nextPermutaions.push({
                ...currData,
                currSpring: '.'
            });
        }
    }
}

export async function day12() {
    let possibleArrangementCount = 0;

    // read puzzle input
    for await (const line of readLines('./src/day12/input.txt')) {
        const token = spiltWithSpace(line);
        const springRecord = Array(5).fill(token[0]).join('?');
        const badAmountRecord: number[] = spiltWith(',', Array(5).fill(token[1]).join(',')).map(el => Number(el));

        console.log(springRecord);
        console.log(badAmountRecord);

        let currentPermutaions: SpringPermutationData[] = [];

        for (let i = 0; i < springRecord.length; i++) {
            const currSpring = springRecord[i];
            const nextPermutaions: SpringPermutationData[] = [];

            // initital permutaion data & process for first time
            if (i === 0) {
                const permutationData: PermutationData = {
                    group: 0,
                    badAmount: 0,
                    permutation: 1,
                };
                const initData: SpringPermutationData = {
                    permutationData: permutationData,
                    currSpring: '',
                    currIndex: i,
                    remainingSpring: springRecord.length - 1 - i
                };

                if (currSpring === '?') {
                    nextPermutaions.push({ ...initData, permutationData: { ...permutationData, badAmount: 1 }, currSpring: '#' });
                    nextPermutaions.push({ ...initData, currSpring: '.' });
                } else if (currSpring === '#') {
                    nextPermutaions.push({ ...initData, permutationData: { ...permutationData, badAmount: 1 }, currSpring: currSpring });
                } else if (currSpring === '.') {
                    nextPermutaions.push({ ...initData, currSpring: currSpring });
                }
            } else {
                for (const currentPermutaion of currentPermutaions) {
                    const { permutationData } = currentPermutaion;

                    const currData: SpringPermutationData = {
                        permutationData: permutationData,
                        currSpring: currSpring,
                        currIndex: i,
                        remainingSpring: springRecord.length - 1 - i
                    };

                    if (currSpring === '?') {
                        // case good spring (.)
                        newGoodSpringData(nextPermutaions, currData, badAmountRecord)
                        // case bad spring (#)
                        addBadSpringData(nextPermutaions, currData, badAmountRecord);
                    } else if (currSpring === '#') {
                        addBadSpringData(nextPermutaions, currData, badAmountRecord);
                    } else if (currSpring === '.') {
                        newGoodSpringData(nextPermutaions, currData, badAmountRecord)
                    }
                }
            }

            currentPermutaions = nextPermutaions;
        }

        // select Permutaions that match with record
        const matchGroup1 = badAmountRecord.length - 1;
        const matchAmount1 = badAmountRecord[matchGroup1];
        const matchGroup2 = badAmountRecord.length;
        const matchAmount2 = 0;

        const sumSelectedPermutaions = currentPermutaions
            .filter(({ permutationData }) =>
                (permutationData.group === matchGroup1 && permutationData.badAmount === matchAmount1)
                || (permutationData.group === matchGroup2 && permutationData.badAmount === matchAmount2))
            .reduce((prev, el) => prev + el.permutationData.permutation, 0);

        possibleArrangementCount += sumSelectedPermutaions;
    }

    console.log('possibleArrangementCount', possibleArrangementCount);
}