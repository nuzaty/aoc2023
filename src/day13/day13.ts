import {readLines} from '../utils';

type ReflectData = {
    count: number;
    reflectType: string;
};

function findReflection(
    grid: string[][],
    throwError: boolean,
    onlyOne: boolean,
): ReflectData[] {
    const rowCount = grid.length;
    const colCount = grid[0].length;
    const midColPos = Math.floor((colCount - 1) / 2);
    const midRowPos = Math.floor((rowCount - 1) / 2);

    const reflectData: ReflectData[] = [];
    // check veritcal relect
    const allRowReflectPos: number[][] = [];

    for (const row of grid) {
        const rowReflectPos: number[] = [];

        for (let lStart = 0; lStart < colCount - 1; lStart++) {
            let lCursor = lStart;
            let rCursor = lStart + 1;
            let reflect = true;

            while (lCursor >= 0 && rCursor < colCount) {
                const left = row[lCursor];
                const right = row[rCursor];
                if (left !== right) {
                    reflect = false;
                    break;
                }
                lCursor--;
                rCursor++;
            }

            if (reflect) {
                rowReflectPos.push(lStart);
            }
        }

        if (rowReflectPos.length === -1) {
            break;
        } else {
            allRowReflectPos.push(rowReflectPos);
        }
    }
    // if all row has reflection, then it is vertical relect
    if (allRowReflectPos.length === rowCount) {
        // select reflection by min diff from mid
        const diffIntersectPos = allRowReflectPos
            .reduce((prev, curr) => {
                return curr.filter(el => prev.some(item => item === el));
            })
            .map(el => {
                return {pos: el, diff: el - midColPos};
            });

        if (onlyOne) {
            if (diffIntersectPos.length > 0) {
                let lastDiff = Infinity;
                let selectedPos = -1;
                for (const {pos, diff} of diffIntersectPos) {
                    if (diff < lastDiff) {
                        lastDiff = diff;
                        selectedPos = pos;
                    }
                }
                reflectData.push({count: selectedPos + 1, reflectType: 'vert'});
            }
        } else {
            // ADD ALL!
            for (const {pos} of diffIntersectPos) {
                reflectData.push({count: pos + 1, reflectType: 'vert'});
            }
        }
    }

    // if not vertical relect then check horizontal relect
    const allColReflectPos: number[][] = [];

    for (let colIndex = 0; colIndex < colCount; colIndex++) {
        const colReflectPos: number[] = [];

        for (let topStart = 0; topStart < rowCount - 1; topStart++) {
            let topCursor = topStart;
            let bottomCursor = topStart + 1;
            let reflect = true;

            while (topCursor >= 0 && bottomCursor < rowCount) {
                const top = grid[topCursor][colIndex];
                const bottom = grid[bottomCursor][colIndex];
                if (top !== bottom) {
                    reflect = false;
                    break;
                }
                topCursor--;
                bottomCursor++;
            }

            if (reflect) {
                colReflectPos.push(topStart);
            }
        }

        if (colReflectPos.length === 0) {
            break;
        } else {
            allColReflectPos.push(colReflectPos);
        }
    }

    // if all column has reflection, then it is horizontal relect
    if (allColReflectPos.length === colCount) {
        // select reflection by min diff from mid
        const diffIntersectPos = allColReflectPos
            .reduce((prev, curr) => {
                return curr.filter(el => prev.some(item => item === el));
            })
            .map(el => {
                return {pos: el, diff: el - midRowPos};
            });

        if (onlyOne) {
            if (diffIntersectPos.length > 0) {
                let lastDiff = Infinity;
                let selectedPos = -1;
                for (const {pos, diff} of diffIntersectPos) {
                    if (diff < lastDiff) {
                        lastDiff = diff;
                        selectedPos = pos;
                    }
                }
                reflectData.push({
                    count: selectedPos + 1,
                    reflectType: 'horiz',
                });
            }
        } else {
            // ADD ALL!
            for (const {pos} of diffIntersectPos) {
                reflectData.push({count: pos + 1, reflectType: 'horiz'});
            }
        }
    }

    if (throwError && reflectData.length === 0)
        throw new Error('wtf no reflection! grid: ' + grid);
    else return reflectData;
}

export default async function (isPart1: boolean): Promise<number> {
    let grid: string[][] = [];
    const grids: string[][][] = [];

    // step 1 : read puzzle input
    for await (const line of readLines('./src/day13/input.txt')) {
        if (line) {
            const row: string[] = [];
            for (
                let columnIndex = 0;
                columnIndex < line.length;
                columnIndex++
            ) {
                row[columnIndex] = line[columnIndex];
            }
            grid.push(row);
        } else {
            grids.push(grid);
            grid = [];
        }
    }
    if (grid.length > 0) {
        grids.push(grid);
    }

    // step 2 : check reflection
    let summarizeResult = 0;
    const allReflectionData = new Map<number, ReflectData>();
    grids.forEach((grid, gridIndex) => {
        const reflectData = findReflection(grid, true, false);
        const {count, reflectType} = reflectData[0];
        if (reflectType === 'horiz') summarizeResult += count * 100;
        else summarizeResult += count;

        // Save info to use in PART 2
        allReflectionData.set(gridIndex, reflectData[0]);
    });

    console.log('summarizeResult', summarizeResult);
    if (isPart1) return summarizeResult;

    // PART 2
    // Find smudge and calculate new summarize result

    let newSummarizeResult = 0;
    grids.forEach(async (grid, gridIndex) => {
        // Try to swap each mirror data and calculate new relection line
        for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
            for (let colIndex = 0; colIndex < grid[0].length; colIndex++) {
                const newGrid = grid.map(row => [...row]);
                // Try to fix the smudge
                if (grid[rowIndex][colIndex] === '#') {
                    newGrid[rowIndex][colIndex] = '.';
                } else {
                    newGrid[rowIndex][colIndex] = '#';
                }

                const {count: oldCount, reflectType: oldType} =
                    allReflectionData.get(gridIndex)!;
                const newReflectionData = findReflection(newGrid, false, false);

                if (newReflectionData.length === 0) continue;

                // Check if reflection change, then calculate new summarize result
                let foundNewReflection = false;
                newReflectionData.forEach(
                    ({count: newCount, reflectType: newType}) => {
                        if (oldCount !== newCount || oldType !== newType) {
                            if (newType === 'horiz')
                                newSummarizeResult += newCount * 100;
                            else newSummarizeResult += newCount;

                            foundNewReflection = true;
                            return;
                        }
                    },
                );

                if (foundNewReflection) return;
            }
        }

        console.log('warning no new relection line!', 'gridIndex', gridIndex);
        // throw new Error('cannot find the smudge. gridIndex: ' + gridIndex);
    });

    console.log('newSummarizeResult', newSummarizeResult);
    return newSummarizeResult;
}
