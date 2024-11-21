import {Colors, getColorText, readLines} from '../utils';

type Position = [number, number];

type MapProp = {
    tiles: string[][];
    mapWidth: number;
    halfMapWidth: number;
    lastTileWidth: number;
    mapRepeatOneDirection: number;
};

type PartialReached = {
    largeArea: number; // A
    smallArea: number; // B
};

export default async function () {
    const isPart1 = false;

    // step 1 read puzzle input
    const [tiles, startPosition] = await readPuzzleInput();
    console.log(startPosition);

    // step 2: start walking at the start position
    if (isPart1) {
        const plotReached = findReached(64, startPosition, tiles, false);
        console.log('total reached', plotReached.size);
    } else {
        const maxStep = 100;
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
        console.log('mapProp', mapProp);

        const {mapRepeatOneDirection, lastTileWidth} = mapProp;
        if (mapRepeatOneDirection < 2) {
            // old fashion
            const reached = findReachedInfinite(
                maxStep,
                startPosition,
                mapProp,
            );
            console.log('part 2 - step', maxStep, 'reached', reached);
        } else {
            if (lastTileWidth < halfMapWidth) {
                throw new Error(
                    'not support case last tile is less than half map width!',
                );
                // TODO handle this case in some days :P
            }

            // total Odd/Even Map
            let totalEvenMap = 0;
            let totalOddMap = 0;

            if (maxStep % 2 === 1) {
                if (mapRepeatOneDirection % 2 === 1) {
                    totalOddMap = mapRepeatOneDirection * mapRepeatOneDirection;
                    totalEvenMap =
                        (mapRepeatOneDirection - 1) *
                        (mapRepeatOneDirection - 1);
                } else {
                    totalOddMap =
                        (mapRepeatOneDirection - 1) *
                        (mapRepeatOneDirection - 1);
                    totalEvenMap =
                        mapRepeatOneDirection * mapRepeatOneDirection;
                }
            } else {
                if (mapRepeatOneDirection % 2 === 1) {
                    totalOddMap =
                        (mapRepeatOneDirection - 1) *
                        (mapRepeatOneDirection - 1);
                    totalEvenMap =
                        mapRepeatOneDirection * mapRepeatOneDirection;
                } else {
                    totalOddMap = mapRepeatOneDirection * mapRepeatOneDirection;
                    totalEvenMap =
                        (mapRepeatOneDirection - 1) *
                        (mapRepeatOneDirection - 1);
                }
            }

            // total A,B
            const totalLargePartialMap = mapRepeatOneDirection - 1;
            const totalSmallPartialMap = mapRepeatOneDirection;

            console.log(
                'totalOddMap',
                totalOddMap,
                'totalEvenMap',
                totalEvenMap,
                'totalLargePartialMap',
                totalLargePartialMap,
                'totalSmallPartialMap',
                totalSmallPartialMap,
            );

            // old fashion
            const oldFashionReached = findReachedInfinite(
                maxStep,
                startPosition,
                mapProp,
                true,
            );

            // Find O
            const oddReached = findOddMapReached(startPosition, mapProp);
            // Find E
            const evenReached = findEvenMapReached(startPosition, mapProp);
            // Find A, B
            const {smallArea: smallAreaReached, largeArea: largeAreaReached} =
                findPartialMapReached(mapProp);

            // Find C
            const connerReached = findConnerPartialMapReached(mapProp);

            const totalReachedExcludedC =
                oddReached * totalOddMap +
                evenReached * totalEvenMap +
                smallAreaReached * totalSmallPartialMap +
                largeAreaReached * totalLargePartialMap;

            console.log(
                'part 2 - step',
                maxStep,
                'totalReachedExcludedC',
                totalReachedExcludedC,
            );
        }
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

function findReachedFinite(
    step: number,
    startPos: Position,
    {tiles}: MapProp,
    canOutOfBound = false,
    label = '',
    debug = false,
): number {
    const plotReached = findReached(
        step,
        startPos,
        tiles,
        false,
        canOutOfBound,
    );
    if (debug) {
        console.log(label, 'start at', startPos);
        renderMap(tiles, plotReached, 1, startPos, false, debug);
        console.log('total reached', plotReached.size);
    }

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

// mapSize: total map from starting point (include itself)
function renderMap(
    tiles: string[][],
    plotReached: Set<string>,
    mapSize: number,
    startPos: Position,
    infinite: boolean,
    debug = false,
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

// E = evenMap
function findEvenMapReached(startPosition: Position, mapProp: MapProp): number {
    const {mapWidth} = mapProp;
    let step = 3 * mapWidth;
    if (step % 2 !== 0) step += 1;

    return findReachedFinite(step, startPosition, mapProp);
}

// O = oddMap
function findOddMapReached(startPosition: Position, mapProp: MapProp): number {
    const {mapWidth} = mapProp;
    let step = 3 * mapWidth;
    if (step % 2 === 0) step += 1;
    return findReachedFinite(step, startPosition, mapProp);
}

// A = largePartialMap
// B = smallPartialMap
// find partialMap reached only map width is odd
function findPartialMapReached(mapProp: MapProp): PartialReached {
    const {mapWidth, halfMapWidth, lastTileWidth} = mapProp;
    if (mapWidth % 2 === 0) throw new Error('Not support even map width');

    const startPos1: Position = [
        mapWidth + halfMapWidth,
        mapWidth + halfMapWidth,
    ];
    const startPos2: Position = [mapWidth + halfMapWidth, -halfMapWidth - 1];
    const startPos3: Position = [-halfMapWidth - 1, -halfMapWidth - 1];
    const startPos4: Position = [-halfMapWidth - 1, mapWidth + halfMapWidth];

    if (lastTileWidth < halfMapWidth + 1) {
        const aStep = halfMapWidth + 2 * mapWidth + lastTileWidth;
        const a1 = findReachedFinite(aStep, startPos1, mapProp, true, 'a1');
        const a2 = findReachedFinite(aStep, startPos2, mapProp, true, 'a2');
        const a3 = findReachedFinite(aStep, startPos3, mapProp, true, 'a3');
        const a4 = findReachedFinite(aStep, startPos4, mapProp, true, 'a4');

        const bStep = halfMapWidth + mapWidth + lastTileWidth;
        const b1 = findReachedFinite(bStep, startPos1, mapProp, true, 'b1');
        const b2 = findReachedFinite(bStep, startPos2, mapProp, true, 'b2');
        const b3 = findReachedFinite(bStep, startPos3, mapProp, true, 'b3');
        const b4 = findReachedFinite(bStep, startPos4, mapProp, true, 'b4');

        console.log('case1');
        return {
            largeArea: a1 + a2 + a3 + a4,
            smallArea: b1 + b2 + b3 + b4,
        };
    } else if (lastTileWidth === halfMapWidth + 1) {
        const aStep = halfMapWidth + mapWidth + lastTileWidth;
        const a1 = findReachedFinite(aStep, startPos1, mapProp, true, 'a1');
        const a2 = findReachedFinite(aStep, startPos2, mapProp, true, 'a2');
        const a3 = findReachedFinite(aStep, startPos3, mapProp, true, 'a3');
        const a4 = findReachedFinite(aStep, startPos4, mapProp, true, 'a4');

        console.log('case2');
        return {
            largeArea: a1 + a2 + a3 + a4,
            smallArea: 0,
        };
    } else {
        // TODO
        const aStep = halfMapWidth + mapWidth + lastTileWidth;
        const a1 = findReachedFinite(
            aStep,
            startPos1,
            mapProp,
            true,
            'a1',
            true,
        );
        const a2 = findReachedFinite(
            aStep,
            startPos2,
            mapProp,
            true,
            'a2',
            true,
        );
        const a3 = findReachedFinite(
            aStep,
            startPos3,
            mapProp,
            true,
            'a3',
            true,
        );
        const a4 = findReachedFinite(
            aStep,
            startPos4,
            mapProp,
            true,
            'a4',
            true,
        );

        const bStep = halfMapWidth + lastTileWidth;
        const b1 = findReachedFinite(
            bStep,
            startPos1,
            mapProp,
            true,
            'b1',
            false,
        );
        const b2 = findReachedFinite(
            bStep,
            startPos2,
            mapProp,
            true,
            'b2',
            false,
        );
        const b3 = findReachedFinite(
            bStep,
            startPos3,
            mapProp,
            true,
            'b3',
            false,
        );
        const b4 = findReachedFinite(
            bStep,
            startPos4,
            mapProp,
            true,
            'b4',
            false,
        );

        console.log('case3');
        return {
            largeArea: a1 + a2 + a3 + a4,
            smallArea: b1 + b2 + b3 + b4,
        };
    }
}
// C = connerPartialMap

function findConnerPartialMapReached(mapProp: MapProp): number {
    const {mapWidth, halfMapWidth, lastTileWidth} = mapProp;
    const cStep = halfMapWidth + lastTileWidth;

    const startPos1: Position = [halfMapWidth, mapWidth + halfMapWidth];
    const c1 = findReachedFinite(cStep, startPos1, mapProp, true, 'c1', false);

    const startPos2: Position = [halfMapWidth + mapWidth, halfMapWidth];
    const c2 = findReachedFinite(cStep, startPos2, mapProp, true, 'c2', false);

    const startPos3: Position = [halfMapWidth, -1 - halfMapWidth];
    const c3 = findReachedFinite(cStep, startPos3, mapProp, true, 'c3', false);

    const startPos4: Position = [-1 - halfMapWidth, halfMapWidth];
    const c4 = findReachedFinite(cStep, startPos4, mapProp, true, 'c4', false);

    return c1 + c2 + c3 + c4;
}

function mapRepeatOneDirection(
    step: number,
    halfMapWidth: number,
    mapWidth: number,
): number {
    return Math.ceil((step - halfMapWidth) / mapWidth);
}
