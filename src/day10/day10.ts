import {readLines, spiltWith} from '../utils';

const Directions = Object.freeze({
    NONE: Symbol('none'),
    UP: Symbol('up'),
    DOWN: Symbol('down'),
    LEFT: Symbol('left'),
    RIGHT: Symbol('right'),
});

const Colors = Object.freeze({
    RED: Symbol('red'),
    BLUE: Symbol('blue'),
    YELLOW: Symbol('yellow'),
    GREEN: Symbol('green'),
    MAGENTA: Symbol('magenta'),
});

type AdjacentTile = {
    pipeType?: string;
    row: number;
    col: number;
    direction?: Symbol;
};
type Coordinate = {
    row: number;
    col: number;
};

type ScanDetail = {
    directionLeftTiles: Coordinate[] | undefined;
    directionRightTiles: Coordinate[] | undefined;
    walkDirection: Symbol;
    prevTile: Coordinate;
};

const coordToString = (coord: Coordinate): string => {
    return `(${coord.row},${coord.col})`;
};

const stringToCoord = (str: string): Coordinate => {
    const token = spiltWith(',', str.slice(1, -1));
    return {
        row: Number(token[0]),
        col: Number(token[1]),
    };
};

const getAdjacentTiles = (
    tiles: string[][],
    tile: AdjacentTile,
): AdjacentTile[] => {
    const adjacentTiles: AdjacentTile[] = [];
    const col = tile.col;
    const row = tile.row;
    if (col - 1 >= 0) {
        adjacentTiles.push({
            pipeType: tiles[row][col - 1],
            row: row,
            col: col - 1,
            direction: Directions.LEFT,
        });
    }
    if (col + 1 < tiles[row].length) {
        adjacentTiles.push({
            pipeType: tiles[row][col + 1],
            row: row,
            col: col + 1,
            direction: Directions.RIGHT,
        });
    }
    if (row - 1 >= 0) {
        adjacentTiles.push({
            pipeType: tiles[row - 1][col],
            row: row - 1,
            col: col,
            direction: Directions.UP,
        });
    }
    if (row + 1 < tiles.length) {
        adjacentTiles.push({
            pipeType: tiles[row + 1][col],
            row: row + 1,
            col: col,
            direction: Directions.DOWN,
        });
    }
    return adjacentTiles;
};

const isWalkable = (src: AdjacentTile, dest: AdjacentTile): boolean => {
    if (src.pipeType === 'S') {
        if (dest.pipeType === '|') {
            return (
                dest.direction === Directions.UP ||
                dest.direction === Directions.DOWN
            );
        }
        if (dest.pipeType === '-') {
            return (
                dest.direction === Directions.LEFT ||
                dest.direction === Directions.RIGHT
            );
        }
        if (dest.pipeType === 'L') {
            return (
                dest.direction === Directions.DOWN ||
                dest.direction === Directions.LEFT
            );
        }
        if (dest.pipeType === 'J') {
            return (
                dest.direction === Directions.DOWN ||
                dest.direction === Directions.RIGHT
            );
        }
        if (dest.pipeType === '7') {
            return (
                dest.direction === Directions.UP ||
                dest.direction === Directions.RIGHT
            );
        }
        if (dest.pipeType === 'F') {
            return (
                dest.direction === Directions.UP ||
                dest.direction === Directions.LEFT
            );
        }
    } else if (src.pipeType === '|') {
        if (dest.pipeType === '|') {
            return (
                dest.direction === Directions.UP ||
                dest.direction === Directions.DOWN
            );
        }
        if (dest.pipeType === '-') {
            return false;
        }
        if (dest.pipeType === 'L') {
            return dest.direction === Directions.DOWN;
        }
        if (dest.pipeType === 'J') {
            return dest.direction === Directions.DOWN;
        }
        if (dest.pipeType === '7') {
            return dest.direction === Directions.UP;
        }
        if (dest.pipeType === 'F') {
            return dest.direction === Directions.UP;
        }
    } else if (src.pipeType === '-') {
        if (dest.pipeType === '|') {
            return false;
        }
        if (dest.pipeType === '-') {
            return (
                dest.direction === Directions.LEFT ||
                dest.direction === Directions.RIGHT
            );
        }
        if (dest.pipeType === 'L') {
            return dest.direction === Directions.LEFT;
        }
        if (dest.pipeType === 'J') {
            return dest.direction === Directions.RIGHT;
        }
        if (dest.pipeType === '7') {
            return dest.direction === Directions.RIGHT;
        }
        if (dest.pipeType === 'F') {
            return dest.direction === Directions.LEFT;
        }
    } else if (src.pipeType === 'L') {
        if (dest.pipeType === '|') {
            return dest.direction === Directions.UP;
        }
        if (dest.pipeType === '-') {
            return dest.direction === Directions.RIGHT;
        }
        if (dest.pipeType === 'L') {
            return false;
        }
        if (dest.pipeType === 'J') {
            return dest.direction === Directions.RIGHT;
        }
        if (dest.pipeType === '7') {
            return (
                dest.direction === Directions.UP ||
                dest.direction === Directions.RIGHT
            );
        }
        if (dest.pipeType === 'F') {
            return dest.direction === Directions.UP;
        }
    } else if (src.pipeType === 'J') {
        if (dest.pipeType === '|') {
            return dest.direction === Directions.UP;
        }
        if (dest.pipeType === '-') {
            return dest.direction === Directions.LEFT;
        }
        if (dest.pipeType === 'L') {
            return dest.direction === Directions.LEFT;
        }
        if (dest.pipeType === 'J') {
            return false;
        }
        if (dest.pipeType === '7') {
            return dest.direction === Directions.UP;
        }
        if (dest.pipeType === 'F') {
            return (
                dest.direction === Directions.UP ||
                dest.direction === Directions.LEFT
            );
        }
    } else if (src.pipeType === '7') {
        if (dest.pipeType === '|') {
            return dest.direction === Directions.DOWN;
        }
        if (dest.pipeType === '-') {
            return dest.direction === Directions.LEFT;
        }
        if (dest.pipeType === 'L') {
            return (
                dest.direction === Directions.LEFT ||
                dest.direction === Directions.DOWN
            );
        }
        if (dest.pipeType === 'J') {
            return dest.direction === Directions.DOWN;
        }
        if (dest.pipeType === '7') {
            return false;
        }
        if (dest.pipeType === 'F') {
            return dest.direction === Directions.LEFT;
        }
    } else if (src.pipeType === 'F') {
        if (dest.pipeType === '|') {
            return dest.direction === Directions.DOWN;
        }
        if (dest.pipeType === '-') {
            return dest.direction === Directions.RIGHT;
        }
        if (dest.pipeType === 'L') {
            return dest.direction === Directions.DOWN;
        }
        if (dest.pipeType === 'J') {
            return (
                dest.direction === Directions.DOWN ||
                dest.direction === Directions.RIGHT
            );
        }
        if (dest.pipeType === '7') {
            return dest.direction === Directions.RIGHT;
        }
        if (dest.pipeType === 'F') {
            return false;
        }
    }

    if (dest.pipeType === '.' || dest.pipeType === 'S') return false;

    throw new Error('invalid pipe type: ' + src + ', ' + dest);
};

const getSideTileByDirection = (
    tiles: string[][],
    coord: Coordinate,
    direction: Symbol,
    pipeLoopMap: Map<string, string>,
): Coordinate[][] => {
    const maxRow = tiles.length - 1;
    const maxCol = tiles[0].length - 1;

    const leftSideTiles = [];
    const rightSideTiles = [];

    let pipeType = tiles[coord.row][coord.col];

    if (pipeType === 'S') {
        pipeType = getStartTilePipeType(coord, pipeLoopMap);
    }

    if (direction === Directions.RIGHT) {
        if (coord.row - 1 >= 0)
            leftSideTiles.push({row: coord.row - 1, col: coord.col});
        if (coord.row + 1 <= maxRow)
            rightSideTiles.push({row: coord.row + 1, col: coord.col});

        if (pipeType === '7') {
            if (coord.row - 1 >= 0 && coord.col + 1 <= maxCol)
                leftSideTiles.push({row: coord.row - 1, col: coord.col + 1});
            if (coord.col + 1 <= maxCol)
                leftSideTiles.push({row: coord.row, col: coord.col + 1});
        }
        if (pipeType === 'J') {
            if (coord.row + 1 <= maxRow && coord.col + 1 <= maxCol)
                rightSideTiles.push({row: coord.row + 1, col: coord.col + 1});
            if (coord.col + 1 <= maxCol)
                rightSideTiles.push({row: coord.row, col: coord.col + 1});
        }
    } else if (direction === Directions.LEFT) {
        if (coord.row + 1 <= maxRow)
            leftSideTiles.push({row: coord.row + 1, col: coord.col});
        if (coord.row - 1 >= 0)
            rightSideTiles.push({row: coord.row - 1, col: coord.col});

        if (pipeType === 'L') {
            if (coord.col - 1 >= 0)
                leftSideTiles.push({row: coord.row, col: coord.col - 1});
            if (coord.row + 1 <= maxRow && coord.col - 1 >= 0)
                leftSideTiles.push({row: coord.row + 1, col: coord.col - 1});
        }
        if (pipeType === 'F') {
            if (coord.row - 1 >= 0 && coord.col - 1 >= 0)
                rightSideTiles.push({row: coord.row - 1, col: coord.col - 1});
            if (coord.col - 1 >= 0)
                rightSideTiles.push({row: coord.row, col: coord.col - 1});
        }
    } else if (direction === Directions.UP) {
        if (coord.col - 1 >= 0)
            leftSideTiles.push({row: coord.row, col: coord.col - 1});
        if (coord.col + 1 <= maxCol)
            rightSideTiles.push({row: coord.row, col: coord.col + 1});

        if (pipeType === 'F') {
            if (coord.row - 1 >= 0 && coord.col - 1 >= 0)
                leftSideTiles.push({row: coord.row - 1, col: coord.col - 1});
            if (coord.row - 1 >= 0)
                leftSideTiles.push({row: coord.row - 1, col: coord.col});
        }
        if (pipeType === '7') {
            if (coord.row - 1 >= 0)
                rightSideTiles.push({row: coord.row - 1, col: coord.col});
            if (coord.row - 1 >= 0 && coord.col + 1 <= maxCol)
                rightSideTiles.push({row: coord.row - 1, col: coord.col + 1});
        }
    } else if (direction === Directions.DOWN) {
        if (coord.col + 1 <= maxCol)
            leftSideTiles.push({row: coord.row, col: coord.col + 1});
        if (coord.col - 1 >= 0)
            rightSideTiles.push({row: coord.row, col: coord.col - 1});

        if (pipeType === 'J') {
            if (coord.row + 1 <= maxRow && coord.col + 1 <= maxCol)
                leftSideTiles.push({row: coord.row + 1, col: coord.col + 1});
            if (coord.row + 1 <= maxRow)
                leftSideTiles.push({row: coord.row + 1, col: coord.col});
        }
        if (pipeType === 'L') {
            if (coord.row + 1 <= maxRow && coord.col - 1 >= 0)
                rightSideTiles.push({row: coord.row + 1, col: coord.col - 1});
            if (coord.row + 1 <= maxRow)
                rightSideTiles.push({row: coord.row + 1, col: coord.col});
        }
    } else {
        throw new Error('Unknown direciton' + direction);
    }
    return [leftSideTiles, rightSideTiles];
};

const getStartTilePipeType = (
    startTile: Coordinate,
    pipeLoopMap: Map<string, string>,
): string => {
    const [firstDest, firstSrc] = pipeLoopMap.entries().next().value!;
    const [lastDest, lastSrc] = Array.from(pipeLoopMap)[pipeLoopMap.size - 1];

    const incomingDireciton = findDirection(
        stringToCoord(lastSrc),
        stringToCoord(lastDest),
    );
    const outgoingDireciton = findDirection(
        stringToCoord(firstSrc),
        stringToCoord(firstDest),
    );

    if (incomingDireciton === Directions.UP) {
        if (outgoingDireciton === Directions.RIGHT) return 'F';
        if (outgoingDireciton === Directions.LEFT) return '7';
        if (outgoingDireciton === Directions.UP) return '|';
    }
    if (incomingDireciton === Directions.LEFT) {
        if (outgoingDireciton === Directions.LEFT) return '-';
        if (outgoingDireciton === Directions.UP) return 'L';
        if (outgoingDireciton === Directions.DOWN) return 'F';
    }
    if (incomingDireciton === Directions.DOWN) {
        if (outgoingDireciton === Directions.DOWN) return '|';
        if (outgoingDireciton === Directions.RIGHT) return 'L';
        if (outgoingDireciton === Directions.LEFT) return 'J';
    }
    if (incomingDireciton === Directions.RIGHT) {
        if (outgoingDireciton === Directions.RIGHT) return '-';
        if (outgoingDireciton === Directions.UP) return 'J';
        if (outgoingDireciton === Directions.DOWN) return '7';
    }

    throw new Error(
        'invalid direction: ' + incomingDireciton + ', ' + outgoingDireciton,
    );
};

const renderMap = (tiles: string[][], newConsole?: boolean) => {
    if (newConsole) {
        let mapText = '';
        for (const tileRow of tiles) {
            for (const tile of tileRow) {
                mapText += tile;
            }
            mapText += '\n';
        }
        console.log(mapText);
    } else {
        for (const tileRow of tiles) {
            for (const tile of tileRow) {
                process.stdout.write(tile);
            }
            process.stdout.write('\n');
        }
    }
};

const colorToConsoleCode = (color: Symbol): string[] => {
    let codes: number[] = [];

    if (color === Colors.BLUE) {
        codes = [94, 39];
    } else if (color === Colors.RED) {
        codes = [91, 39];
    } else if (color === Colors.YELLOW) {
        codes = [93, 39];
    } else if (color === Colors.GREEN) {
        codes = [92, 39];
    } else if (color === Colors.MAGENTA) {
        codes = [95, 39];
    } else {
        throw new Error('Unknown color: ' + color);
    }

    return ['\x1b[' + codes[0] + 'm', '\x1b[' + codes[1] + 'm'];
};

const getColorText = (text: string, color: Symbol): string => {
    const codes = colorToConsoleCode(color);
    return codes[0] + text + codes[1] + '\x1b[0m';
};

const renderWalkMap = (
    inputMap: string[][],
    walkMaps: Map<string, string>[],
    colors: Symbol[],
    renderNumber: boolean,
) => {
    const map = inputMap.map(el => el.slice());
    const yellowColorCode = colorToConsoleCode(Colors.YELLOW);

    let walkMapIndex = 0;
    for (const walkMap of walkMaps) {
        const colorCodes = colorToConsoleCode(colors[walkMapIndex]);
        let step = 1;
        let isStart = true;
        for (const src of walkMap.values()) {
            // skip first tile
            if (isStart) {
                isStart = false;
                continue;
            }
            const srcCoord = stringToCoord(src);
            map[srcCoord.row][srcCoord.col] =
                colorCodes[0] +
                (renderNumber ? step % 10 : map[srcCoord.row][srcCoord.col]) +
                colorCodes[1] +
                '\x1b[0m';
            step++;
        }

        // handle last tile
        const endCoord = stringToCoord(
            Array.from(walkMap)[walkMap.size - 1][0],
        );
        map[endCoord.row][endCoord.col] =
            yellowColorCode[0] +
            (renderNumber ? step % 10 : map[endCoord.row][endCoord.col]) +
            yellowColorCode[1] +
            '\x1b[0m';

        walkMapIndex++;
    }

    // handle first tile
    const startCoord = stringToCoord(walkMaps[0].values().next().value!); // any walk map is ok because it should be start at the same tile
    map[startCoord.row][startCoord.col] =
        yellowColorCode[0] +
        map[startCoord.row][startCoord.col] +
        yellowColorCode[1] +
        '\x1b[0m';

    renderMap(map);
};

const renderScanMap = (
    inputMap: string[][],
    pipeLoopMap: Map<string, string>,
    scanMap: Map<string, ScanDetail>,
    activeTile?: Coordinate,
) => {
    const map = inputMap.map(el => el.slice());

    for (const src of pipeLoopMap.values()) {
        const srcCoord = stringToCoord(src);
        const loopSymbol: string = inputMap[srcCoord.row][srcCoord.col];
        map[srcCoord.row][srcCoord.col] = getColorText(loopSymbol, Colors.RED);
    }

    for (const {directionLeftTiles, directionRightTiles} of scanMap.values()) {
        if (directionLeftTiles) {
            for (const directionLeftTile of directionLeftTiles) {
                const leftCol = directionLeftTile.col;
                const leftRow = directionLeftTile.row;
                if (!pipeLoopMap.has(coordToString(directionLeftTile))) {
                    map[leftRow][leftCol] = getColorText('X', Colors.MAGENTA);
                }
            }
        }

        if (directionRightTiles) {
            for (const directionRightTile of directionRightTiles) {
                const rightCol = directionRightTile.col;
                const rightRow = directionRightTile.row;
                if (!pipeLoopMap.has(coordToString(directionRightTile))) {
                    map[rightRow][rightCol] = getColorText('Y', Colors.GREEN);
                }
            }
        }
    }
    if (activeTile)
        map[activeTile.row][activeTile.col] = getColorText('@', Colors.YELLOW);

    renderMap(map, true);
};

const renderFloodMap = (
    inputMap: string[][],
    pipeLoopMap: Map<string, string>,
    allFloods: Set<string>[],
    floodSymbols: string[],
    floodColor: Symbol[],
    activeTile?: Coordinate,
) => {
    const map = inputMap.map(el => el.slice());

    for (const src of pipeLoopMap.values()) {
        const srcCoord = stringToCoord(src);
        map[srcCoord.row][srcCoord.col] = getColorText(
            map[srcCoord.row][srcCoord.col],
            Colors.RED,
        );
    }

    let floodSymbolIndex = 0;
    for (const floods of allFloods) {
        for (const flood of floods) {
            const floodCoord = stringToCoord(flood);
            map[floodCoord.row][floodCoord.col] = getColorText(
                floodSymbols[floodSymbolIndex],
                floodColor[floodSymbolIndex],
            );
        }
        floodSymbolIndex++;
    }

    if (activeTile)
        map[activeTile.row][activeTile.col] = getColorText('@', Colors.YELLOW);

    renderMap(map, true);
};

const findDirection = (src: Coordinate, dest: Coordinate): Symbol => {
    if (src.col < dest.col) return Directions.RIGHT;
    if (src.col > dest.col) return Directions.LEFT;
    if (src.row < dest.row) return Directions.DOWN;
    if (src.row > dest.row) return Directions.UP;

    return Directions.NONE;
};

const isOnPipeLoop = (
    coord: Coordinate,
    pipeLoopMap: Map<string, string>,
): boolean => {
    for (const src of pipeLoopMap.values()) {
        const srcCoord = stringToCoord(src);
        if (srcCoord.row === coord.row && srcCoord.col === coord.col)
            return true;
    }
    return false;
};
export default async function (isPart1: boolean): Promise<number> {
    const tiles: string[][] = []; // [row][col]
    let startTile: AdjacentTile = {
        pipeType: '',
        row: -1,
        col: -1,
    };

    let rowIndex = 0;
    let colIndex = 0;
    for await (const line of readLines('./src/day10/input.txt')) {
        const row: string[] = [];
        colIndex = 0;
        for (const char of line) {
            if (char === 'S') {
                startTile = {
                    pipeType: 'S',
                    row: rowIndex,
                    col: colIndex,
                };
            }
            row.push(char);
            colIndex++;
            // console.log('row', row);
        }
        tiles.push(row);
        rowIndex++;
    }
    // console.log(tiles);
    const foundFarthestTile = false;
    let currTile1 = startTile;
    let currTile2 = startTile;
    const walkMap1 = new Map<string, string>();
    const walkMap2 = new Map<string, string>();

    let firstWalk1: Coordinate | undefined; // prevent select same path
    let farthestTile: Coordinate | undefined;
    while (!foundFarthestTile) {
        // step 1 find adjacent tile
        const adjacentTiles1 = getAdjacentTiles(tiles, currTile1);
        const adjacentTiles2 = getAdjacentTiles(tiles, currTile2);

        // console.log(adjacentTiles1, 'walk size', walkMap1.size);

        // step 2 walk to new tile of both ways
        for (const adjacentTile1 of adjacentTiles1) {
            if (isWalkable(currTile1, adjacentTile1)) {
                const currCoord1: Coordinate = {
                    row: currTile1.row,
                    col: currTile1.col,
                };
                const nextCoord1: Coordinate = {
                    row: adjacentTile1.row,
                    col: adjacentTile1.col,
                };
                if (!walkMap1.has(coordToString(nextCoord1))) {
                    // console.log('way 1: walk from', currCoord1, 'type:', currTile1.pipeType, 'to', nextCoord1, 'type:', adjacentTile1.pipeType, 'direction', adjacentTile1.direction);
                    currTile1 = adjacentTile1;
                    if (!firstWalk1) {
                        firstWalk1 = nextCoord1;
                    }

                    walkMap1.set(
                        coordToString(nextCoord1),
                        coordToString(currCoord1),
                    );
                    // console.log('walkMap1', walkMap1);

                    break;
                }
            }
        }

        for (const adjacentTile2 of adjacentTiles2) {
            if (isWalkable(currTile2, adjacentTile2)) {
                const currCoord2: Coordinate = {
                    row: currTile2.row,
                    col: currTile2.col,
                };
                const nextCoord2: Coordinate = {
                    row: adjacentTile2.row,
                    col: adjacentTile2.col,
                };

                const nextCoordIsFirstWalk1 =
                    firstWalk1 &&
                    firstWalk1.col === nextCoord2.col &&
                    firstWalk1.row === nextCoord2.row;

                if (
                    !walkMap2.has(coordToString(nextCoord2)) &&
                    !nextCoordIsFirstWalk1
                ) {
                    // console.log('way 2: walk from', currCoord2, 'type:', currTile2.pipeType, 'to', nextCoord2, 'type:', adjacentTile2.pipeType);
                    currTile2 = adjacentTile2;
                    walkMap2.set(
                        coordToString(nextCoord2),
                        coordToString(currCoord2),
                    );
                    // console.log('walkMap2', walkMap2);
                    break;
                }
            }
        }
        // step 3 check if both ways is same tile, this is farthest tile (this is an answer!)
        if (
            currTile1.row === currTile2.row &&
            currTile1.col === currTile2.col
        ) {
            farthestTile = currTile1;
            break;
        }
    }

    console.log('walkMap1', walkMap1, walkMap1.size);
    if (isPart1) return walkMap1.size;
    console.log('walkMap2', walkMap2);
    console.log('farthestTile', farthestTile);

    renderWalkMap(tiles, [walkMap1, walkMap2], [Colors.BLUE, Colors.RED], true);

    // merge 2 walk map
    const pipeLoopMap = new Map<string, string>();
    for (const [dest, src] of Array.from(walkMap1)) {
        pipeLoopMap.set(dest, src);
    }

    const walkMap2Array = Array.from(walkMap2).reverse();
    for (const [src, dest] of walkMap2Array) {
        // swap src & dest
        if (pipeLoopMap.has(dest)) {
            throw new Error('found duplicate key' + dest);
        }
        pipeLoopMap.set(dest, src);
    }

    renderWalkMap(tiles, [pipeLoopMap], [Colors.BLUE], true);

    // scan tile around pipe loop and mark side type
    const scanMap = new Map<string, ScanDetail>();
    for (const [dest, src] of pipeLoopMap) {
        const srcCoord = stringToCoord(src);
        const destCoord = stringToCoord(dest);
        // scan relative left & right
        const direction = findDirection(srcCoord, destCoord);
        const [relativeLeftTiles, relativeRightTiles] = getSideTileByDirection(
            tiles,
            destCoord,
            direction,
            pipeLoopMap,
        );

        scanMap.set(dest, {
            walkDirection: direction,
            directionLeftTiles: relativeLeftTiles,
            directionRightTiles: relativeRightTiles,
            prevTile: srcCoord,
        });
    }

    console.log('scanmap');
    renderScanMap(tiles, pipeLoopMap, scanMap);

    // flood all side type tile to count area

    // flood step 1: init flood tile
    const leftSideFlood = new Set<string>();
    const rightSideFlood = new Set<string>();
    for (const {directionLeftTiles, directionRightTiles} of scanMap.values()) {
        if (directionLeftTiles) {
            for (const directionLeftTile of directionLeftTiles) {
                if (!pipeLoopMap.has(coordToString(directionLeftTile))) {
                    leftSideFlood.add(coordToString(directionLeftTile));
                }
            }
        }

        if (directionRightTiles) {
            for (const directionRightTile of directionRightTiles) {
                if (!pipeLoopMap.has(coordToString(directionRightTile))) {
                    rightSideFlood.add(coordToString(directionRightTile));
                }
            }
        }
    }

    // Left Side Flood
    let tilesToExpandFlood: string[] = [...Array.from(leftSideFlood)];

    while (tilesToExpandFlood.length > 0) {
        const tile: string = tilesToExpandFlood.pop()!;
        const tileCoord = stringToCoord(tile);
        const adjacentTiles = getAdjacentTiles(tiles, {
            row: tileCoord.row,
            col: tileCoord.col,
        });
        for (const adjacentTile of adjacentTiles) {
            const adjacentTileCoord = coordToString({
                row: adjacentTile.row,
                col: adjacentTile.col,
            });
            if (
                !leftSideFlood.has(adjacentTileCoord) &&
                !isOnPipeLoop(stringToCoord(adjacentTileCoord), pipeLoopMap)
            ) {
                leftSideFlood.add(adjacentTileCoord);
                tilesToExpandFlood.push(adjacentTileCoord);
            }
        }
    }

    console.log('leftSideFlood');
    renderFloodMap(
        tiles,
        pipeLoopMap,
        [leftSideFlood],
        ['X'],
        [Colors.MAGENTA],
    );

    // Right Side Flood
    tilesToExpandFlood = [...Array.from(rightSideFlood)];

    while (tilesToExpandFlood.length > 0) {
        const tile: string = tilesToExpandFlood.pop()!;
        const tileCoord = stringToCoord(tile);
        const adjacentTiles = getAdjacentTiles(tiles, {
            row: tileCoord.row,
            col: tileCoord.col,
        });
        for (const adjacentTile of adjacentTiles) {
            const adjacentTileCoord = coordToString({
                row: adjacentTile.row,
                col: adjacentTile.col,
            });
            if (
                !rightSideFlood.has(adjacentTileCoord) &&
                !isOnPipeLoop(stringToCoord(adjacentTileCoord), pipeLoopMap)
            ) {
                rightSideFlood.add(adjacentTileCoord);
                tilesToExpandFlood.push(adjacentTileCoord);
            }
        }
    }

    renderFloodMap(
        tiles,
        pipeLoopMap,
        [leftSideFlood, rightSideFlood],
        ['X', 'Y'],
        [Colors.MAGENTA, Colors.GREEN],
    );

    console.log('left side count', leftSideFlood.size);
    console.log('right side count', rightSideFlood.size);

    return rightSideFlood.size;
}
