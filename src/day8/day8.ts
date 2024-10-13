import { readLines, spiltWith } from "../utils";


export async function day8() {

    let lineNum = 1;

    let instructions = '';
    const navigationMap = new Map<string, Map<string, string>>();

    for await (const line of readLines('./src/day8/input.txt')) {
        if (lineNum === 1) {
            instructions = line
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

            navigationMap.set(location, pathToSelectMap);

        }

        lineNum++;
    }

    console.log('instructions', instructions);
    console.log('navigationMap', navigationMap);

    let stepCount = 0;
    let currLocation = 'AAA';

    do {
        const cursorIndex = stepCount % instructions.length;
        const currInstruction = instructions.charAt(cursorIndex);

        console.log('currInstruction', currInstruction);


        currLocation = navigationMap
            .get(currLocation)
            ?.get(currInstruction)!;

        stepCount++;

        console.log('new currInstruction', currLocation);
    } while (currLocation !== 'ZZZ')

    console.log('stepCount', stepCount);
}
