import { readLines, waitKeyInput } from "../utils";


const renderTiles = (tiles: string[][]) => {
    for (const row of tiles) {
        for (const colChar of row) {
            process.stdout.write(colChar);
        }
        process.stdout.write('\n');
    }
}
export async function day11() {

    const isPart1 = false;

    let rowIndex: number = 0;
    let colIndex: number = 0;
    let tiles: string[][] = [];

    // step 1 : read puzzle input
    for await (const line of readLines('./src/day11/input.txt')) {
        const row: string[] = [];
        colIndex = 0;
        for (const char of line) {
            row.push(char);
            colIndex++;
        }
        tiles.push(row);
        rowIndex++;
    }

    console.log('puzzle input:');
    renderTiles(tiles);

    // step 2 : scan empty row
    rowIndex = 0;
    const emptyRowIndices: number[] = [];
    for (const row of tiles) {
        colIndex = 0;
        let rowIsEmpty: boolean = true;
        for (const colChar of row) {
            if (colChar === '#') {
                rowIsEmpty = false;
                break;
            }
            colIndex++;
        }
        if (rowIsEmpty)
            emptyRowIndices.push(rowIndex);

        rowIndex++;
    }
    console.log('emptyRowIndices', emptyRowIndices);

    // step 3 : scan empty column
    const emptyColIndices: number[] = [];
    const totalCol = tiles[0].length; // tiles[0] because every row has same column count!
    for (let colIndex = 0; colIndex < totalCol; colIndex++) {
        let colIsEmpty: boolean = true;
        for (let rowIndex = 0; rowIndex < tiles.length; rowIndex++) {
            const rowChar = tiles[rowIndex][colIndex];
            if (rowChar === '#') {
                colIsEmpty = false;
                break;
            }
        }
        if (colIsEmpty)
            emptyColIndices.push(colIndex);
    }
    console.log('emptyColIndices', emptyColIndices);

    // step 4 : expand empty row (cosmic expansion: row)
    let rowExpandType = 'A'; // virtual expand replacement symbol

    for (const emptyRowIndex of emptyRowIndices) {
        tiles.splice(emptyRowIndex, 1, Array(totalCol).fill(rowExpandType));
    }

    // step 5 : expand empty column (cosmic expansion: column)
    let colExpandType = 'B'; // virtual expand replacement symbol
    let stackExpandType = 'C'; // symbol in case expand both (row & column)

    for (const emptyColIndex of emptyColIndices) {
        for (const row of tiles) {
            const char = row[emptyColIndex];
            row.splice(emptyColIndex, 1, char === rowExpandType ? stackExpandType : colExpandType);
        }
    }

    console.log('expanded tiles:');
    renderTiles(tiles);

    // step 6 : assign galaxy number & save galaxy location
    let galaxyNum = 1;
    let galaxyLocations = new Map<number, number[]>();
    rowIndex = 0;
    let rowPositionOffset = 0;
    for (const row of tiles) {
        colIndex = 0;
        let isExpandedRow = false;
        let colPositionOffset = 0;
        for (const colChar of row) {
            if (colChar === '#') {
                tiles[rowIndex][colIndex] = galaxyNum.toString();
                galaxyLocations.set(galaxyNum, [rowIndex + rowPositionOffset, colIndex + colPositionOffset]);
                galaxyNum++;
            } else {
                if (colChar === 'A') {
                    isExpandedRow = true;
                    break;
                }
                if (colChar === 'B') {
                    if (isPart1)
                        colPositionOffset += 1;
                    else
                        colPositionOffset += 999999;
                }
            }
            colIndex++;
        }
        if (isExpandedRow) {
            if (isPart1) {
                rowPositionOffset += 1;
            } else {
                rowPositionOffset += 999999;
            }
        }
        rowIndex++;
    }

    console.log('assigned galaxy num tiles:');
    renderTiles(tiles);
    console.log('galaxyLocations:', galaxyLocations);

    // step 7 : pair galaxy
    const galaxyPairs: number[][] = [];
    const totalGalaxies = galaxyNum - 1;

    for (let firstGalaxyNum = 1; firstGalaxyNum <= totalGalaxies - 1; firstGalaxyNum++) {
        for (let secondGalaxyNum = firstGalaxyNum + 1; secondGalaxyNum <= totalGalaxies; secondGalaxyNum++) {
            galaxyPairs.push([firstGalaxyNum, secondGalaxyNum]);
        }
    }

    console.log('galaxyPairs:', galaxyPairs, 'total pairs', galaxyPairs.length);

    // step 8 : find all pair length & sum all length (PART 1 & 2 Answer!)
    const galaxyPairLengths = new Map<string, number>();
    let sumOfGalaxyPairLengths = 0;
    for (const galaxyPair of galaxyPairs) {
        const firstGalaxyLocation: number[] = galaxyLocations.get(galaxyPair[0])!;
        const secondGalaxyLocation: number[] = galaxyLocations.get(galaxyPair[1])!;
        const [targetRow, targetCol] = firstGalaxyLocation;
        let [currRow, currCol] = secondGalaxyLocation;
        let stepCount = 0;

        while (currRow !== targetRow || currCol !== targetCol) {
            let diffStep = 0;
            if (currRow > targetRow) {
                // go UP
                diffStep = currRow - targetRow;
                currRow -= diffStep;
            } else if (currRow < targetRow) {
                // go DOWN
                diffStep = targetRow - currRow;
                currRow += diffStep;
            } else if (currCol > targetCol) {
                // go LEFT
                diffStep = currCol - targetCol;
                currCol -= diffStep;
            } else if (currCol < targetCol) {
                // go RIGHT
                diffStep = targetCol - currCol;
                currCol += diffStep;
            }
            stepCount += diffStep;

            // console.log(galaxyPair, 'currRow', currRow, 'currCol', currCol, 'targetRow', targetRow, 'targetCol', targetCol);
            // await waitKeyInput();
        }

        sumOfGalaxyPairLengths += stepCount;
        galaxyPairLengths.set(galaxyPair.toString(), stepCount);
        // console.log('galaxyPairLengths', galaxyPairLengths);
        // await waitKeyInput();
    }

    console.log('galaxyPairLengths', galaxyPairLengths);
    console.log('sumOfGalaxyPairLengths', sumOfGalaxyPairLengths);
}