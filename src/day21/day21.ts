import {readLines} from '../utils';

type Position = [number, number];

export default async function () {
    const isPart1 = true;

    // step 1 read puzzle input
    const [tiles, startPosition] = await readPuzzleInput();

    // step 2: start walking at the start position
    if (isPart1) {
        const maxStep = 64;
        const plotReached = new Set<string>();
        const visited = new Set<string>();
        const queue: [Position, number][] = [[startPosition, 0]];

        while (queue.length > 0) {
            const [pos, steps] = queue.shift()!;

            if (steps > maxStep) break;

            const posStr = positionToString(pos);
            if (visited.has(posStr)) continue;
            visited.add(posStr);

            if (steps % 2 === maxStep % 2) {
                plotReached.add(posStr);
            }

            const neighbors = findNeighbors(pos, tiles);
            for (const neighbor of neighbors) {
                queue.push([neighbor, steps + 1]);
            }
        }

        console.log('total reached', plotReached.size);
    }
}

async function readPuzzleInput(): Promise<[string[][], Position]> {
    const tiles: string[][] = [];
    let startPosition: Position = [-1, -1];
    let rowIndex = 0;
    for await (const line of readLines('./src/day21/input.txt')) {
        const row: string[] = [];
        let colIndex = 0;
        for (const charCol of line) {
            row.push(charCol);
            if (charCol === 'S') {
                startPosition = [rowIndex, colIndex];
            }
            colIndex++;
        }
        tiles.push(row);
        rowIndex++;
    }
    return [tiles, startPosition];
}

function renderMap(tiles: string[][], plotReached: Set<string>) {
    let rowIndex = 0;
    for (const row of tiles) {
        let colIndex = 0;
        for (const colChar of row) {
            if (plotReached.has(positionToString([rowIndex, colIndex])))
                process.stdout.write('O');
            else process.stdout.write(colChar);
            colIndex++;
        }
        process.stdout.write('\n');
        rowIndex++;
    }
}

function findNeighbors([row, col]: Position, tiles: string[][]): Position[] {
    const neighbors: Position[] = [];

    // Check top neighbor (above)
    if (row > 0 && tiles[row - 1][col] !== '#') {
        neighbors.push([row - 1, col]);
    }
    // Check bottom neighbor (below)
    if (row < tiles.length - 1 && tiles[row + 1][col] !== '#') {
        neighbors.push([row + 1, col]);
    }

    // Check left neighbor (left)
    if (col > 0 && tiles[row][col - 1] !== '#') {
        neighbors.push([row, col - 1]);
    }

    // Check right neighbor (right)
    if (col < tiles[0].length - 1 && tiles[row][col + 1] !== '#') {
        neighbors.push([row, col + 1]);
    }

    return neighbors;
}

function positionToString([row, col]: Position): string {
    return `${row},${col}`;
}
