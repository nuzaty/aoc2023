import {Colors, getColorText, readLines} from '../utils';
import util from 'util';

type Position = {
    row: number;
    col: number;
};

type NextWalk = {
    pos: Position;
    walkPath: Position[];
};

export default async function () {
    console.log('hello day23');

    const tiles = await readPuzzleInput();
    // console.log(tiles);
    // renderMap(tiles);

    const startPosition = findStartPosition(tiles);
    const endPostition = findEndPosition(tiles);

    console.log('startPosition', startPosition);
    console.log('endPostition', endPostition);

    const startWalkPath = [startPosition];
    let walkPaths: Position[][] = [startWalkPath];
    const walkQueue: NextWalk[] = [
        {pos: startPosition, walkPath: startWalkPath},
    ];

    // let loopCount = 0;

    // console.log(
    //     loopCount,
    //     'walkQueue',
    //     util.inspect(walkQueue, {
    //         showHidden: false,
    //         depth: null,
    //         colors: true,
    //     }),
    //     'walkPaths',
    //     util.inspect(walkPaths, {
    //         showHidden: false,
    //         depth: null,
    //         colors: true,
    //     }),
    // );

    while (walkQueue.length > 0) {
        const nextWalk = walkQueue.shift();
        const {pos, walkPath} = nextWalk!;

        const posNext: Position[] = findNextPositions(pos, tiles, walkPath);

        const newWalkPaths: Position[][] = [];

        for (const pos of posNext) {
            const newWalkPath = [...walkPath, pos];
            walkQueue.push({pos, walkPath: newWalkPath});
            newWalkPaths.push(newWalkPath);
        }

        if (newWalkPaths.length > 0) {
            walkPaths = walkPaths.filter(path => path !== walkPath);
            walkPaths.push(...newWalkPaths);
        }

        // loopCount++;
        // console.log(
        //     loopCount,
        //     'walkQueue',
        //     util.inspect(walkQueue, {
        //         showHidden: false,
        //         depth: null,
        //         colors: true,
        //     }),
        //     'walkPaths',
        //     util.inspect(walkPaths, {
        //         showHidden: false,
        //         depth: null,
        //         colors: true,
        //     }),
        // );
    }

    // console.log(
    //     'walkPaths',
    //     util.inspect(walkPaths, {
    //         showHidden: false,
    //         depth: null,
    //         colors: true,
    //     }),
    // );

    const validPaths = walkPaths.filter(
        path =>
            path[path.length - 1].row === endPostition.row &&
            path[path.length - 1].col === endPostition.col,
    );

    console.log('total validPaths', validPaths.length);
    for (const path of validPaths) {
        // console.log('validPath Length', path.length, 'path', path);
        console.log(
            'validPath Length (without start position)',
            path.length - 1,
        );
        // renderPath(tiles, startPosition, path);
    }
}

async function readPuzzleInput(): Promise<string[][]> {
    const tiles: string[][] = [];
    for await (const line of readLines('./src/day23/input.txt')) {
        const row: string[] = [];
        for (const colChar of line) {
            row.push(colChar);
        }
        tiles.push(row);
    }
    return tiles;
}

function renderPath(
    tiles: string[][],
    startPosition: Position,
    path: Position[],
): void {
    let rowIndex = 0;

    for (const row of tiles) {
        let colIndex = 0;
        for (const colChar of row) {
            if (
                rowIndex === startPosition.row &&
                colIndex === startPosition.col
            ) {
                process.stdout.write('S');
            } else if (
                path.some(p => p.row === rowIndex && p.col === colIndex)
            ) {
                process.stdout.write(getColorText('O', Colors.Red));
            } else {
                process.stdout.write(colChar);
            }
            colIndex++;
        }
        process.stdout.write('\n');
        rowIndex++;
    }
}

function findStartPosition(tiles: string[][]): Position {
    // start position is (.) on the first row
    for (let col = 0; col < tiles[0].length; col++) {
        if (tiles[0][col] === '.') {
            return {row: 0, col};
        }
    }
    throw new Error('start position not found');
}

function findEndPosition(tiles: string[][]): Position {
    // end position is (.) on the last row
    for (let col = 0; col < tiles[tiles.length - 1].length; col++) {
        if (tiles[tiles.length - 1][col] === '.') {
            return {row: tiles.length - 1, col};
        }
    }
    throw new Error('end position not found');
}

function findNextPositions(
    pos: Position,
    tiles: string[][],
    walkPath: Position[],
): Position[] {
    const nextPositions: Position[] = [];
    const {row, col} = pos;
    const walkable = ['.', '^', 'v', '<', '>'];
    const currentTile = tiles[row][col];

    const tryMoveUp = () => {
        if (
            row > 0 &&
            walkable.some(t => t === tiles[row - 1][col]) &&
            !walkPath.some(p => p.row === row - 1 && p.col === col)
        ) {
            nextPositions.push({row: row - 1, col});
        }
    };
    const tryMoveDown = () => {
        if (
            row < tiles.length - 1 &&
            walkable.some(t => t === tiles[row + 1][col]) &&
            !walkPath.some(p => p.row === row + 1 && p.col === col)
        ) {
            nextPositions.push({row: row + 1, col});
        }
    };
    const tryMoveLeft = () => {
        if (
            col > 0 &&
            walkable.some(t => t === tiles[row][col - 1]) &&
            !walkPath.some(p => p.row === row && p.col === col - 1)
        ) {
            nextPositions.push({row, col: col - 1});
        }
    };
    const tryMoveRight = () => {
        if (
            col < tiles[0].length - 1 &&
            walkable.some(t => t === tiles[row][col + 1]) &&
            !walkPath.some(p => p.row === row && p.col === col + 1)
        ) {
            nextPositions.push({row, col: col + 1});
        }
    };

    if (currentTile === '^') {
        // can only move up
        tryMoveUp();
    } else if (currentTile === 'v') {
        // can only move down
        tryMoveDown();
    } else if (currentTile === '<') {
        // can only move left
        tryMoveLeft();
    } else if (currentTile === '>') {
        // can only move right
        tryMoveRight();
    } else {
        // can move in any direction
        tryMoveUp();
        tryMoveDown();
        tryMoveLeft();
        tryMoveRight();
    }

    return nextPositions;
}
