
import { readLines } from "../utils";


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

export default async function () {
    // step 1 : read input into array
    const tiles: string[][] = [];  // access arr with [row][col]
    for await (const line of readLines('./src/day14/input.txt')) {
        const row: string[] = [];
        for (const colChar of line) {
            row.push(colChar);
        }
        tiles.push(row);
    }

    console.log('before tilted:');
    console.log('');
    renderTiles(tiles);
    console.log('');

    // step 2
    const colCount = tiles[0].length;
    const rowCount = tiles.length;
    let totalLoad = 0;

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

                // find the total load caused by all of the rounded rocks
                totalLoad += rowCount - nextStoneRow;
                nextStoneRow++;
            } else if (tile === '#') {
                nextStoneRow = row + 1;
            }
        }
    }

    console.log('after tilted:');
    console.log('');
    renderTiles(tiles);
    console.log('');

    // step 3 : find the total load caused by all of the rounded rocks
    console.log('totalLoad', findTotalLoad(tiles));
}