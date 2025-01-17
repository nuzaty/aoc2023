import {Colors, getColorText, readLines} from '../utils';

type Position = [number, number];

type MapProp = {
    tiles: string[][];
    mapWidth: number;
    halfMapWidth: number;
    lastTileWidth: number;
    mapRepeatOneDirection: number;
};

export default async function (isPart1: boolean): Promise<number> {
    // step 1 read puzzle input
    const [tiles, startPosition] = await readPuzzleInput();
    console.log(startPosition);

    // step 2: start walking at the start position
    if (isPart1) {
        const plotReached = findReached(64, startPosition, tiles, false);
        console.log('total reached', plotReached.size);
        return plotReached.size;
    } else {
        const maxStep = 26501365;
        const mapWidth = tiles[0].length;
        const halfMapWidth = (mapWidth - 1) / 2;
        const mapProp: MapProp = {
            tiles,
            mapWidth,
            halfMapWidth, // only odd map width
            mapRepeatOneDirection: Math.ceil(
                (maxStep - halfMapWidth) / mapWidth,
            ),
            lastTileWidth: getLastTileWidth(maxStep, mapWidth, halfMapWidth),
        };

        const stepsToAns = [
            halfMapWidth + mapWidth * 1 + mapProp.lastTileWidth,
            halfMapWidth + mapWidth * 2 + mapProp.lastTileWidth,
            halfMapWidth + mapWidth * 3 + mapProp.lastTileWidth,
            halfMapWidth + mapWidth * 4 + mapProp.lastTileWidth,
        ];

        const mapRepeats: number[] = []; // x
        const allAns: number[] = []; // y

        for (const step of stepsToAns) {
            const newMapProp: MapProp = {
                tiles,
                mapWidth,
                halfMapWidth, // only odd map width
                mapRepeatOneDirection: Math.ceil(
                    (step - halfMapWidth) / mapWidth,
                ),
                lastTileWidth: getLastTileWidth(step, mapWidth, halfMapWidth),
            };
            mapRepeats.push(newMapProp.mapRepeatOneDirection);

            // old fashion
            const reached = findReachedInfinite(
                step,
                startPosition,
                newMapProp,
                false,
            );
            allAns.push(reached);
        }

        const data: DataPoint[] = [];
        for (let i = 0; i < mapRepeats.length; i++) {
            const mapRepeat = mapRepeats[i];
            const ans = allAns[i];
            data.push({x: mapRepeat, y: ans});
        }
        console.log('data to fit', data);

        const result = quadraticRegression(data);
        console.log(
            `Quadratic regression coefficients: a=${result.a}, b=${result.b}, c=${result.c}`,
        );

        const problemX = mapProp.mapRepeatOneDirection;
        const {a, b, c} = result;
        const reached =
            Math.round(a) * problemX * problemX +
            Math.round(b) * problemX +
            Math.round(c);

        console.log('part 2 reached', reached);
        return reached;
    }
}

function findReachedInfinite(
    step: number,
    startPos: Position,
    {tiles, mapRepeatOneDirection}: MapProp,
    debug = false,
): number {
    const plotReached = findReached(step, startPos, tiles, true);
    console.log('maxStep', step);
    if (debug)
        renderMap(
            tiles,
            plotReached,
            mapRepeatOneDirection + 1,
            startPos,
            true,
        );

    console.log('total reached', plotReached.size);
    return plotReached.size;
}

function findReached(
    maxStep: number,
    startPosition: Position,
    tiles: string[][],
    infinite: boolean,
    canOutOfBound = false,
): Set<string> {
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

        const wrapAround = infinite || canOutOfBound;
        const neighbors = findNeighbors(pos, tiles, wrapAround);
        for (const neighbor of neighbors) {
            queue.push([neighbor, steps + 1]);
        }
    }

    // remove out of bound answer if not infinite and canOutOfBound is true
    if (!infinite && canOutOfBound) {
        const toRemoved = new Set<string>();
        plotReached.forEach(posStr => {
            const [row, col] = stringToPosition(posStr);
            if (
                row >= tiles.length ||
                row < 0 ||
                col >= tiles[0].length ||
                col < 0
            ) {
                toRemoved.add(posStr);
            }
        });
        toRemoved.forEach(posStr => plotReached.delete(posStr));
    }

    return plotReached;
}

const tiles: string[][] = [];
async function readPuzzleInput(): Promise<[string[][], Position]> {
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

// mapSize: total map from starting point (include itself)
function renderMap(
    tiles: string[][],
    plotReached: Set<string>,
    mapSize: number,
    startPos: Position,
    infinite: boolean,
) {
    const width = tiles[0].length;
    const height = tiles.length;

    const minMapNum = -(mapSize - 1);
    const maxMapNum = mapSize - 1;

    const inboundStartPos: Position = [...startPos];
    const outOfBound = isOutOfBound(startPos, tiles);
    if (outOfBound) {
        if (infinite) {
            // handle case start pos is out of bound
            inboundStartPos[0] = ((startPos[0] % height) + height) % height;
            inboundStartPos[1] = ((startPos[1] % width) + width) % width;
        }
    }

    for (let mapRow = minMapNum; mapRow <= maxMapNum; mapRow++) {
        const rowOffset = mapRow * height;
        for (let rowIndex = 0; rowIndex < height; rowIndex++) {
            const row = rowIndex + rowOffset;
            for (let mapCol = minMapNum; mapCol <= maxMapNum; mapCol++) {
                const colOffset = mapCol * width;
                for (let colIndex = 0; colIndex < width; colIndex++) {
                    const col = colIndex + colOffset;
                    const startPosInCurrMap: Position = [
                        inboundStartPos[0] + rowOffset,
                        inboundStartPos[1] + colOffset,
                    ];
                    const distanceToStartPos = getManhattanDistance(
                        startPosInCurrMap,
                        [row, col],
                    );
                    const oddDistance = distanceToStartPos % 2 !== 0;

                    const charCol = getTile(row, col, tiles) ?? '?';
                    if (plotReached.has(positionToString([row, col]))) {
                        process.stdout.write(
                            getColorText(
                                oddDistance ? 'O' : 'E',
                                oddDistance ? Colors.Red : Colors.Blue,
                            ),
                        );
                    } else {
                        if (
                            distanceToStartPos === 0 &&
                            (inboundStartPos[0] !== row ||
                                inboundStartPos[1] !== col)
                        ) {
                            // start outside the orginal map
                            process.stdout.write('.');
                        } else {
                            process.stdout.write(charCol);
                        }
                    }
                }
                process.stdout.write(' ');
            }
            process.stdout.write('\n');
        }
        process.stdout.write('\n');
    }
}

function findNeighbors(
    [row, col]: Position,
    tiles: string[][],
    wrapAround: boolean,
): Position[] {
    const neighbors: Position[] = [];

    // Check top neighbor (above)
    const topTile = getTile(row - 1, col, tiles, wrapAround);
    if (topTile !== undefined && topTile !== '#') {
        neighbors.push([row - 1, col]);
    }
    // Check bottom neighbor (below)
    const bottomTile = getTile(row + 1, col, tiles, wrapAround);
    if (bottomTile !== undefined && bottomTile !== '#') {
        neighbors.push([row + 1, col]);
    }

    // Check left neighbor (left)
    const leftTile = getTile(row, col - 1, tiles, wrapAround);
    if (leftTile !== undefined && leftTile !== '#') {
        neighbors.push([row, col - 1]);
    }

    // Check right neighbor (right)
    const rightTile = getTile(row, col + 1, tiles, wrapAround);
    if (rightTile !== undefined && rightTile !== '#') {
        neighbors.push([row, col + 1]);
    }

    return neighbors;
}

function positionToString([row, col]: Position): string {
    return `${row},${col}`;
}

function stringToPosition(position: string): Position {
    const [row, col] = position.split(',').map(Number);
    return [row, col];
}

export function getTile(
    row: number,
    col: number,
    tiles: string[][],
    wrapAround = true,
): string | undefined {
    if (wrapAround) {
        // Handle negative rows by wrapping around
        const wrapRow = ((row % tiles.length) + tiles.length) % tiles.length;

        // Handle negative columns by wrapping around
        const wrapCol =
            ((col % tiles[wrapRow].length) + tiles[wrapRow].length) %
            tiles[wrapRow].length;

        return tiles[wrapRow][wrapCol];
    } else {
        // Return the tile at the specified position without wrapping around
        if (
            row < 0 ||
            row >= tiles.length ||
            col < 0 ||
            col >= tiles[row].length
        ) {
            return undefined;
        }
        return tiles[row][col];
    }
}

function getManhattanDistance(pos1: Position, pos2: Position): number {
    return Math.abs(pos1[0] - pos2[0]) + Math.abs(pos1[1] - pos2[1]);
}

function isOutOfBound(pos: Position, tiles: string[][]): boolean {
    return (
        pos[0] < 0 ||
        pos[0] >= tiles.length ||
        pos[1] < 0 ||
        pos[1] >= tiles[0].length
    );
}

function getLastTileWidth(
    step: number,
    mapWidth: number,
    halfMapWidth: number,
): number {
    if (step < halfMapWidth) throw new Error('step is too low!');

    // assume start position is center of the map
    const stepExcludeFirstMap = step - halfMapWidth;
    let lastTileWidth = stepExcludeFirstMap % mapWidth;
    if (lastTileWidth === 0) lastTileWidth = mapWidth;

    return lastTileWidth;
}

type DataPoint = {x: number; y: number};

function quadraticRegression(data: DataPoint[]): {
    a: number;
    b: number;
    c: number;
} {
    if (data.length < 3) {
        throw new Error(
            'At least three data points are required for quadratic regression.',
        );
    }

    let sumX = 0,
        sumY = 0;
    let sumXX = 0,
        sumXY = 0;
    let sumXXX = 0,
        sumXXXX = 0;
    let sumXYY = 0;

    for (const point of data) {
        const x = point.x;
        const y = point.y;
        sumX += x;
        sumY += y;
        sumXX += x * x;
        sumXY += x * y;
        sumXXX += x * x * x;
        sumXXXX += x * x * x * x;
        sumXYY += x * x * y;
    }

    const n = data.length;

    // Create the matrix and vector for solving the system of equations
    const A = [
        [sumXXXX, sumXXX, sumXX],
        [sumXXX, sumXX, sumX],
        [sumXX, sumX, n],
    ];

    const B = [sumXYY, sumXY, sumY];

    // Solve the system of linear equations using Gaussian elimination
    const coefficients = solveLinearSystem(A, B);

    return {
        a: coefficients[0],
        b: coefficients[1],
        c: coefficients[2],
    };
}

function solveLinearSystem(A: number[][], B: number[]): number[] {
    const n = A.length;

    // Augment matrix A with vector B
    for (let i = 0; i < n; i++) {
        A[i].push(B[i]);
    }

    // Forward elimination
    for (let i = 0; i < n; i++) {
        if (A[i][i] === 0) {
            throw new Error('Matrix is singular or nearly singular.');
        }
        for (let j = i + 1; j < n; j++) {
            const factor = A[j][i] / A[i][i];
            for (let k = i; k <= n; k++) {
                A[j][k] -= factor * A[i][k];
            }
        }
    }

    // Back substitution
    const x: number[] = new Array(n);
    for (let i = n - 1; i >= 0; i--) {
        let sum = 0;
        for (let j = i + 1; j < n; j++) {
            sum += A[i][j] * x[j];
        }
        x[i] = (A[i][n] - sum) / A[i][i];
    }

    return x;
}
