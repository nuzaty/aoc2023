import {readLines, getColorText, Colors} from '../utils';
import PriorityQueue from './priority-queue';

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
    empty?: boolean;
};

type CameFrom = {
    src: Frontier;
    direction: Direction;
};

type Frontier = {
    tile: Position;
    distance: number;
    direction: Direction;
};

function positionToString(position: Position): string {
    return `${position.row},${position.col}`;
}

function frontierToString({tile, distance, direction}: Frontier): string {
    return `${positionToString(tile)},${distance},${direction}`;
}

function directionToArrow(direction: Direction): string {
    switch (direction) {
        case Direction.Left:
            return '<';
        case Direction.Right:
            return '>';
        case Direction.Up:
            return '^';
        case Direction.Down:
            return 'v';
        default:
            throw new Error('Unknown direction: ' + direction);
    }
}

function cameFromToPath(
    start: Position,
    goalFrontier: Frontier,
    cameFrom: Map<string, CameFrom>,
): Map<string, Direction> {
    const path = new Map<string, Direction>();

    let curr = goalFrontier;
    while (curr.tile.row !== start.row || curr.tile.col !== start.col) {
        const currFrontierStr = frontierToString(curr);
        if (cameFrom.has(currFrontierStr)) {
            const {src, direction} = cameFrom.get(currFrontierStr) as CameFrom;
            path.set(positionToString(curr.tile), direction);
            curr = src;
        }
    }

    return path;
}

function renderPath(tiles: string[][], path: Map<string, Direction>) {
    let rowIndex = 0;
    for (const row of tiles) {
        let colIndex = 0;
        process.stdout.write('' + ((rowIndex + 1) % 10) + ' ');
        for (const char of row) {
            const positionStr = positionToString({
                row: rowIndex,
                col: colIndex,
            });
            if (path.has(positionStr))
                process.stdout.write(
                    getColorText(
                        directionToArrow(path.get(positionStr) as Direction),
                        Colors.Red,
                    ),
                );
            else process.stdout.write(char);

            colIndex++;
        }
        process.stdout.write('\n');
        rowIndex++;
    }
}

function moveAndUpdate(
    tiles: string[][],
    costMap: Map<string, number>,
    frontierQueue: PriorityQueue<Frontier>,
    costSoFarMap: Map<string, number>,
    cameFrom: Map<string, CameFrom>,
    frontier: Frontier,
    costSoFar: number,
    moveDirection: Direction,
    newDistance: number,
    minDistance: number,
    start: Position,
    goal: Position,
): boolean {
    // find new position
    const newPostion = {...frontier.tile};
    switch (moveDirection) {
        case Direction.Left:
            newPostion.col -= 1;
            break;
        case Direction.Right:
            newPostion.col += 1;
            break;
        case Direction.Up:
            newPostion.row -= 1;
            break;
        case Direction.Down:
            newPostion.row += 1;
            break;
        default:
            throw new Error('Unknown direction: ' + moveDirection);
    }

    // bounds checking
    if (newPostion.col < 0 || newPostion.row < 0) return false;
    if (newPostion.col >= tiles[0].length || newPostion.row >= tiles.length)
        return false;

    // calcuate new cost
    const newCostSoFar =
        costSoFar + (costMap.get(positionToString(newPostion)) as number);

    if (
        newPostion.row === goal.row &&
        newPostion.col === goal.col &&
        newDistance >= minDistance
    ) {
        console.log('>>>', newCostSoFar, '<<<');
        answer = newCostSoFar;

        const goalFrontier = {
            tile: newPostion,
            distance: newDistance,
            direction: moveDirection,
        };
        cameFrom.set(frontierToString(goalFrontier), {
            src: frontier,
            direction: moveDirection,
        });
        const path = cameFromToPath(start, goalFrontier, cameFrom);

        renderPath(tiles, path);

        return true;
    }

    // create new frontier
    const newFrontier = {
        tile: newPostion,
        distance: newDistance,
        direction: moveDirection,
    };

    // checj if not seen
    if (!costSoFarMap.has(frontierToString(newFrontier))) {
        cameFrom.set(frontierToString(newFrontier), {
            src: frontier,
            direction: moveDirection,
        });
        costSoFarMap.set(frontierToString(newFrontier), newCostSoFar);
        frontierQueue.enqueue(newFrontier, newCostSoFar);
    }
    return false;
}

function turnLeft(direction: Direction): Direction {
    switch (direction) {
        case Direction.Down:
            return Direction.Right;
        case Direction.Up:
            return Direction.Left;
        case Direction.Left:
            return Direction.Down;
        case Direction.Right:
            return Direction.Up;
        default:
            throw new Error('Invalid direction');
    }
}
function turnRight(direction: Direction): Direction {
    switch (direction) {
        case Direction.Down:
            return Direction.Left;
        case Direction.Up:
            return Direction.Right;
        case Direction.Left:
            return Direction.Up;
        case Direction.Right:
            return Direction.Down;
        default:
            throw new Error('Invalid direction');
    }
}

let answer = 0;
export default async function (isPart1: boolean): Promise<number> {
    // step 1 : read input into array
    const tiles: string[][] = [];
    const heatLossMap = new Map<string, number>();
    let rowIndex = 0;
    for await (const line of readLines('./src/day17/input.txt')) {
        const row = [];
        let colIndex = 0;
        for (const colChar of line) {
            const heatLoss = Number(colChar);
            heatLossMap.set(
                positionToString({row: rowIndex, col: colIndex}),
                heatLoss,
            );
            row.push(colChar);
            colIndex++;
        }
        tiles.push(row);
        rowIndex++;
    }

    // step 2 : find path with the heat loss so far
    const maxDistance = isPart1 ? 3 : 10;
    const minDistance = isPart1 ? 1 : 4;

    const cameFrom = new Map<string, CameFrom>();
    const costSoFarMap = new Map<string, number>();
    const frontierQueue = new PriorityQueue<Frontier>(); // ref: https://www.redblobgames.com/pathfinding/a-star/introduction.html
    const start = {row: 0, col: 0}; // The starting point is the top-left city block.
    const goal = {row: tiles.length - 1, col: tiles[0].length - 1}; // the destination is the bottom-right city block.

    const startFrontier: Frontier = {
        tile: start,
        distance: 0,
        direction: Direction.None,
    };

    let isFinished = moveAndUpdate(
        tiles,
        heatLossMap,
        frontierQueue,
        costSoFarMap,
        cameFrom,
        startFrontier,
        0,
        Direction.Right,
        1,
        minDistance,
        start,
        goal,
    );
    if (isFinished) return answer;

    isFinished = moveAndUpdate(
        tiles,
        heatLossMap,
        frontierQueue,
        costSoFarMap,
        cameFrom,
        startFrontier,
        0,
        Direction.Down,
        1,
        minDistance,
        start,
        goal,
    );
    if (isFinished) return answer;

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const {node: frontier, priority: costSoFar} =
            frontierQueue.dequeue() as {node: Frontier; priority: number};
        const {direction, distance} = frontier;

        // go straight
        if (distance < maxDistance) {
            const isFinished = moveAndUpdate(
                tiles,
                heatLossMap,
                frontierQueue,
                costSoFarMap,
                cameFrom,
                frontier,
                costSoFar,
                direction,
                distance + 1,
                minDistance,
                start,
                goal,
            );
            if (isFinished) return answer;
        }
        // turn left and right
        if (distance >= minDistance) {
            let isFinished = moveAndUpdate(
                tiles,
                heatLossMap,
                frontierQueue,
                costSoFarMap,
                cameFrom,
                frontier,
                costSoFar,
                turnLeft(direction),
                1,
                minDistance,
                start,
                goal,
            );
            if (isFinished) return answer;

            isFinished = moveAndUpdate(
                tiles,
                heatLossMap,
                frontierQueue,
                costSoFarMap,
                cameFrom,
                frontier,
                costSoFar,
                turnRight(direction),
                1,
                minDistance,
                start,
                goal,
            );
            if (isFinished) return answer;
        }
    }
}
