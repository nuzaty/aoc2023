import {readLines, spiltWith} from '../utils';

const findGcd = (a: number, b: number): number => {
    let divider: number;
    let remainder: number;

    if (a > b) {
        divider = b;
        remainder = a % divider;
    } else {
        divider = a;
        remainder = b % divider;
    }

    if (remainder === 0) return divider;

    return findGcd(divider, remainder);
};

const findLcm = (a: number, b: number): number => {
    return (a / findGcd(a, b)) * b;
};

const findLcmAll = (nums: number[]): number => {
    if (nums.length === 0) {
        throw new Error('nums is empty!');
    }
    if (nums.length === 1) {
        return nums[0];
    }

    let lastLcm = nums[0];
    for (let i = 1; i < nums.length; i++) {
        const num = nums[i];
        lastLcm = findLcm(lastLcm, num);
    }

    return lastLcm;
};

export default async function (isPart1: boolean): Promise<number> {
    let lineNum = 1;

    let instructions = '';
    const navigationMapPart1 = new Map<string, Map<string, string>>();
    const navigationMap = new Map<string, string>();
    const currLocations: string[] = [];

    for await (const line of readLines('./src/day8/input.txt')) {
        if (lineNum === 1) {
            instructions = line;
        } else if (lineNum !== 2) {
            let token: string[] = spiltWith('=', line);
            const location = token[0];
            const pathToSelect = token[1].slice(1, -1);
            token = spiltWith(',', pathToSelect);
            const leftPath = token[0];
            const rightPath = token[1];

            const pathToSelectMap = new Map<string, string>();
            pathToSelectMap.set('L', leftPath);
            pathToSelectMap.set('R', rightPath);
            navigationMapPart1.set(location, pathToSelectMap);

            navigationMap.set(location + 'L', leftPath);
            navigationMap.set(location + 'R', rightPath);

            if (location.endsWith('A')) {
                currLocations.push(location);
            }
        }

        lineNum++;
    }

    console.log('instructions', instructions);
    console.log('navigationMapPart1', navigationMapPart1);
    console.log('navigationMap', navigationMap);
    console.log('currLocations', currLocations);

    if (isPart1) {
        let stepCount = 0;
        let currLocation = 'AAA';

        do {
            const cursorIndex = stepCount % instructions.length;
            const currInstruction = instructions.charAt(cursorIndex);

            console.log('currInstruction', currInstruction);

            currLocation = navigationMapPart1
                .get(currLocation)!
                .get(currInstruction)!;

            stepCount++;

            console.log('new currInstruction', currLocation);
        } while (currLocation !== 'ZZZ');

        console.log('stepCount', stepCount);
        return stepCount;
    }

    const zFoundPeriods: number[] = [];

    for (let i = 0; i < currLocations.length; i++) {
        const firstLocaiton = currLocations[i];

        let stepCount = 0;
        let cursorIndex = 0;
        let firstZFound = 0;
        let secondZFound = 0;
        do {
            cursorIndex = stepCount % instructions.length;
            const currInstuction = instructions[cursorIndex];
            currLocations[i] = navigationMap.get(
                currLocations[i] + currInstuction,
            )!;
            stepCount++;

            if (currLocations[i].endsWith('Z')) {
                if (firstZFound === 0) {
                    firstZFound = stepCount;
                } else if (secondZFound === 0) {
                    secondZFound = stepCount;
                }
            }
        } while (secondZFound === 0);

        const zFoundPeriod = secondZFound - firstZFound;

        console.log(
            firstLocaiton,
            'firstZFound at:',
            firstZFound,
            'secondZFound at:',
            secondZFound,
            'zFoundPeriod:',
            zFoundPeriod,
        );

        if (firstZFound !== zFoundPeriod)
            throw new Error("it's not start at zero");

        zFoundPeriods.push(zFoundPeriod);
    }

    const result = findLcmAll(zFoundPeriods);
    console.log('lcm of all zFoundPeriod: ', result);
    return result;
}
