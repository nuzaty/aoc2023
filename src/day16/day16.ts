import {readLines} from '../utils';

enum Direction {
    None = 'none',
    Up = 'up',
    Down = 'down',
    Left = 'left',
    Right = 'right',
}

type Position = {
    row: number;
    col: number;
};

function positionToString(position: Position): string {
    return `${position.row},${position.col}`;
}

function isValidPosition(tiles: string[][], {row, col}: Position): boolean {
    const rowLength = tiles.length;
    const colLength = tiles[0].length;
    return row >= 0 && row < rowLength && col >= 0 && col < colLength;
}

function getTile(tiles: string[][], position: Position): string {
    if (isValidPosition(tiles, position)) {
        return tiles[position.row][position.col];
    }
    return '';
}

function getNextDirection(
    currTile: string,
    currDirection: Direction,
): Direction[] {
    let nextDirection: Direction[] = [];

    if (currTile === '.') {
        nextDirection = [currDirection];
    } else if (currTile === '/') {
        switch (currDirection as Direction) {
            case Direction.Left:
                nextDirection = [Direction.Down];
                break;
            case Direction.Right:
                nextDirection = [Direction.Up];
                break;
            case Direction.Up:
                nextDirection = [Direction.Right];
                break;
            case Direction.Down:
                nextDirection = [Direction.Left];
                break;
        }
    } else if (currTile === '\\') {
        switch (currDirection as Direction) {
            case Direction.Left:
                nextDirection = [Direction.Up];
                break;
            case Direction.Right:
                nextDirection = [Direction.Down];
                break;
            case Direction.Up:
                nextDirection = [Direction.Left];
                break;
            case Direction.Down:
                nextDirection = [Direction.Right];
                break;
        }
    } else if (currTile === '|') {
        switch (currDirection as Direction) {
            case Direction.Left:
            case Direction.Right:
                nextDirection = [Direction.Down, Direction.Up];
                break;
            case Direction.Up:
            case Direction.Down:
                nextDirection = [currDirection];
                break;
        }
    } else if (currTile === '-') {
        switch (currDirection as Direction) {
            case Direction.Left:
            case Direction.Right:
                nextDirection = [currDirection];
                break;
            case Direction.Up:
            case Direction.Down:
                nextDirection = [Direction.Left, Direction.Right];
                break;
        }
    }

    return nextDirection;
}

function getNextPos({row, col}: Position, direction: Direction): Position {
    switch (direction) {
        case Direction.Left:
            return {row, col: col - 1};
        case Direction.Right:
            return {row, col: col + 1};
        case Direction.Up:
            return {row: row - 1, col};
        case Direction.Down:
            return {row: row + 1, col};
        default:
            return {row, col};
    }
}

function getPassedTileNote(currPos: Position, currDirection: Direction) {
    return positionToString(currPos) + currDirection;
}

function findTotalEnergizedTiles(
    tiles: string[][],
    startPos: Position,
    headingDirection: Direction,
): number {
    const energizedTiles = new Set<string>();
    const passedTiles = new Set<string>();

    const currPositions: Position[] = [startPos];
    const currDirections: Direction[] = [headingDirection];

    while (currPositions.length > 0) {
        const currPos = currPositions.shift() as Position;
        const currDirection = currDirections.shift() as Direction;
        const passedTileNote = getPassedTileNote(currPos, currDirection);

        // skip if the beam has already pass with same direction
        if (!passedTiles.has(passedTileNote)) {
            // update passed note
            passedTiles.add(passedTileNote);
            // update energized tiles
            energizedTiles.add(positionToString(currPos));

            const currTile = getTile(tiles, currPos);
            const nextDirection: Direction[] = getNextDirection(
                currTile,
                currDirection,
            );
            const next = nextDirection
                .map(v => [v, getNextPos(currPos, v)])
                .filter(v => isValidPosition(tiles, v[1] as Position));

            currDirections.push(...next.map(v => v[0] as Direction));
            currPositions.push(...next.map(v => v[1] as Position));
        }
    }

    return energizedTiles.size;
}

export default async function (isPart1: boolean): Promise<number> {
    // step 1 : read input into array
    const tiles: string[][] = [];
    for await (const line of readLines('./src/day16/input.txt')) {
        const row = [];
        for (const colChar of line) {
            row.push(colChar);
        }
        tiles.push(row);
    }

    // step 2 : simulate light beam
    if (isPart1) {
        // the beam enters in the top-left cornerand heading to the right
        const totalEnergizedTiles = findTotalEnergizedTiles(
            tiles,
            {row: 0, col: 0},
            Direction.Right,
        );
        console.log(totalEnergizedTiles);
        return totalEnergizedTiles;
    } else {
        const rowLength = tiles.length;
        const colLength = tiles[0].length;

        let maxEnergizedTiles = 0;

        // heading right (enter from the left)
        for (let row = 0; row < rowLength; row++) {
            const totalEnergizedTiles = findTotalEnergizedTiles(
                tiles,
                {row, col: 0},
                Direction.Right,
            );
            if (totalEnergizedTiles > maxEnergizedTiles)
                maxEnergizedTiles = totalEnergizedTiles;
        }

        // heading left (enter from the right)
        for (let row = 0; row < rowLength; row++) {
            const totalEnergizedTiles = findTotalEnergizedTiles(
                tiles,
                {row, col: colLength - 1},
                Direction.Left,
            );
            if (totalEnergizedTiles > maxEnergizedTiles)
                maxEnergizedTiles = totalEnergizedTiles;
        }

        // heading downward (enter from the top)
        for (let col = 0; col < colLength; col++) {
            const totalEnergizedTiles = findTotalEnergizedTiles(
                tiles,
                {row: 0, col},
                Direction.Down,
            );
            if (totalEnergizedTiles > maxEnergizedTiles)
                maxEnergizedTiles = totalEnergizedTiles;
        }

        // heading upward (enter from the bottom)
        for (let col = 0; col < colLength; col++) {
            const totalEnergizedTiles = findTotalEnergizedTiles(
                tiles,
                {row: rowLength - 1, col},
                Direction.Up,
            );
            if (totalEnergizedTiles > maxEnergizedTiles)
                maxEnergizedTiles = totalEnergizedTiles;
        }

        console.log('maxEnergizedTiles', maxEnergizedTiles);
        return maxEnergizedTiles;
    }
}
