import { readLines, spiltWith, spiltWithSpace } from "../utils";


type ReflectData = {
    count: number,
    reflectType: string
}

function findReflection(grid: string[][]): ReflectData {
    const rowCount = grid.length;
    const colCount = grid[0].length;
    const midColPos = Math.floor((colCount - 1) / 2);
    const midRowPos = Math.floor((rowCount - 1) / 2);

    // check veritcal relect
    const allRowReflectPos: number[][] = [];

    for (const row of grid) {
        const rowReflectPos: number[] = [];

        for (let lStart = 0; lStart < colCount - 1; lStart++) {
            let lCursor = lStart;
            let rCursor = lStart + 1;
            let reflect = true;

            while (lCursor >= 0 && rCursor < colCount) {
                let left = row[lCursor];
                let right = row[rCursor];
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
        const diffIntersectPos = allRowReflectPos.reduce((prev, curr) => {
            return curr.filter(el => prev.some(item => item === el));
        }).map(el => {
            return { pos: el, diff: el - midColPos };
        })

        if (diffIntersectPos.length > 0) {
            let lastDiff: number = Infinity;
            let selectedPos = -1;
            for (const { pos, diff } of diffIntersectPos) {
                if (diff < lastDiff) {
                    lastDiff = diff;
                    selectedPos = pos;
                }
            }
            return { count: selectedPos + 1, reflectType: 'vert' };

        }
    }
    // console.log('no vertical reflect');

    // if not vertical relect then check horizontal relect
    const allColReflectPos: number[][] = [];

    for (let colIndex = 0; colIndex < colCount; colIndex++) {
        const colReflectPos: number[] = [];

        for (let topStart = 0; topStart < rowCount - 1; topStart++) {
            let topCursor = topStart;
            let bottomCursor = topStart + 1;
            let reflect = true;

            while (topCursor >= 0 && bottomCursor < rowCount) {
                let top = grid[topCursor][colIndex];
                let bottom = grid[bottomCursor][colIndex];
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
        const diffIntersectPos = allColReflectPos.reduce((prev, curr) => {
            return curr.filter(el => prev.some(item => item === el));
        }).map(el => {
            return { pos: el, diff: el - midRowPos };
        })
        if (diffIntersectPos.length > 0) {
            let lastDiff: number = Infinity;
            let selectedPos = -1;
            for (const { pos, diff } of diffIntersectPos) {
                if (diff < lastDiff) {
                    lastDiff = diff;
                    selectedPos = pos;
                }
            }
            return { count: selectedPos + 1, reflectType: 'horiz' };
        }
    }

    throw new Error('wtf no reflection! grid: ' + grid);
}

export async function day13() {
    let grid: string[][] = [];
    let grids: string[][][] = [];

    const part1 = true;

    // step 1 : read puzzle input
    for await (const line of readLines('./src/day13/input.txt')) {
        if (line) {
            const row: string[] = [];
            for (let columnIndex = 0; columnIndex < line.length; columnIndex++) {
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
    grids.forEach((grid, gridIndex) => {
        const { count, reflectType } = findReflection(grid);
        if (reflectType === 'horiz') summarizeResult += count * 100;
        else summarizeResult += count;
    });

    console.log('summarizeResult', summarizeResult);
}