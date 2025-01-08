import {readLines} from '../utils';

type CycleData = {
    cycle: number[];
};

function renderTiles(tiles: string[][]) {
    for (const row of tiles) {
        for (const colChar of row) {
            process.stdout.write(colChar);
        }
        process.stdout.write('\n');
    }
}

function findTotalLoad(tiles: string[][]) {
    let totalLoad = 0;
    for (let col = 0; col < tiles[0].length; col++) {
        for (let row = 0; row < tiles.length; row++) {
            const tile = tiles[row][col];
            if (tile === 'O') {
                totalLoad += tiles.length - row;
            }
        }
    }
    return totalLoad;
}

function tiltNorth(tiles: string[][]) {
    const colCount = tiles[0].length;
    const rowCount = tiles.length;

    for (let col = 0; col < colCount; col++) {
        let nextStoneRow = 0;
        for (let row = 0; row < rowCount; row++) {
            const tile = tiles[row][col];
            if (tile === 'O') {
                const nextStoneTile = tiles[nextStoneRow][col];
                // swap stone if tile is empty (.)
                if (nextStoneTile === '.') {
                    tiles[nextStoneRow][col] = 'O';
                    tiles[row][col] = '.';
                }
                nextStoneRow++;
            } else if (tile === '#') {
                nextStoneRow = row + 1;
            }
        }
    }
}

function tiltWest(tiles: string[][]) {
    const colCount = tiles[0].length;
    const rowCount = tiles.length;

    for (let row = 0; row < rowCount; row++) {
        let nextStoneCol = 0;
        for (let col = 0; col < colCount; col++) {
            const tile = tiles[row][col];
            if (tile === 'O') {
                const nextStoneTile = tiles[row][nextStoneCol];
                if (nextStoneTile === '.') {
                    tiles[row][nextStoneCol] = 'O';
                    tiles[row][col] = '.';
                }
                nextStoneCol++;
            } else if (tile === '#') {
                nextStoneCol = col + 1;
            }
        }
    }
}

function tiltSouth(tiles: string[][]) {
    const colCount = tiles[0].length;
    const rowCount = tiles.length;

    for (let col = 0; col < colCount; col++) {
        let nextStoneRow = rowCount - 1;
        for (let row = rowCount - 1; row >= 0; row--) {
            const tile = tiles[row][col];
            if (tile === 'O') {
                const nextStoneTile = tiles[nextStoneRow][col];
                // swap stone if tile is empty (.)
                if (nextStoneTile === '.') {
                    tiles[nextStoneRow][col] = 'O';
                    tiles[row][col] = '.';
                }
                nextStoneRow--;
            } else if (tile === '#') {
                nextStoneRow = row - 1;
            }
        }
    }
}

function tiltEast(tiles: string[][]) {
    const colCount = tiles[0].length;
    const rowCount = tiles.length;

    for (let row = 0; row < rowCount; row++) {
        let nextStoneCol = colCount - 1;
        for (let col = colCount - 1; col >= 0; col--) {
            const tile = tiles[row][col];
            if (tile === 'O') {
                const nextStoneTile = tiles[row][nextStoneCol];
                if (nextStoneTile === '.') {
                    tiles[row][nextStoneCol] = 'O';
                    tiles[row][col] = '.';
                }
                nextStoneCol--;
            } else if (tile === '#') {
                nextStoneCol = col - 1;
            }
        }
    }
}

function findRepeatPattern(arr: number[], minPatternLength = 1): CycleData {
    const cycleData: CycleData = {cycle: []};
    for (
        let patternLength = minPatternLength;
        patternLength <= Math.floor(arr.length / 2);
        patternLength++
    ) {
        const potentialPattern = arr.slice(-patternLength);

        let validPattern = true;
        for (let i = 0; i < potentialPattern.length; i++) {
            const indexToCompare = arr.length - potentialPattern.length * 2 + i;

            if (indexToCompare < 0) {
                validPattern = false;
                break;
            }
            if (arr[indexToCompare] !== potentialPattern[i]) {
                validPattern = false;
                break;
            }
        }

        if (validPattern) {
            cycleData.cycle = potentialPattern;
            break;
        }
    }

    return cycleData;
}

export default async function (isPart1: boolean): Promise<number> {
    // step 1 : read input into array
    const tiles: string[][] = []; // access arr with [row][col]
    for await (const line of readLines('./src/day14/input.txt')) {
        const row: string[] = [];
        for (const colChar of line) {
            row.push(colChar);
        }
        tiles.push(row);
    }

    // step 2 : tilted the platform
    if (isPart1) {
        // PART 1
        tiltNorth(tiles);

        console.log('after tilted:');
        console.log('');
        renderTiles(tiles);
        console.log('');

        // step 3 : find the total load caused by all of the rounded rocks
        const totalLoad = findTotalLoad(tiles);
        console.log('totalLoad', totalLoad);
        return totalLoad;
    } else {
        // PART 2
        const cycleCount = 1000000000;
        const cycleCheckRepeat = 100;

        const platformLoads: number[] = [];
        for (let i = 1; i <= cycleCount; i++) {
            tiltNorth(tiles);
            tiltWest(tiles);
            tiltSouth(tiles);
            tiltEast(tiles);

            platformLoads.push(findTotalLoad(tiles));

            if (i % cycleCheckRepeat === 0) {
                const {cycle: pattern} = findRepeatPattern(platformLoads, 10);
                if (pattern.length > 0) {
                    const remainingCycle = cycleCount - platformLoads.length;
                    const patternIndex = (remainingCycle % pattern.length) - 1;
                    console.log(
                        'pattern',
                        pattern,
                        platformLoads.length,
                        'platformLoads.length',
                    );
                    console.log('totalLoad part 2', pattern[patternIndex]);
                    return pattern[patternIndex];
                }
            }
        }
    }

    return 0;
}
