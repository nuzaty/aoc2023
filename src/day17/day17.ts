import {get} from "http";
import {readLines, waitKeyInput} from "../utils";
import PriorityQueue from "./priority-queue";

enum Direction {
    None = "none",
    Up = "up",
    Down = "down",
    Left = "left",
    Right = "right"
}

type Position = {
    row: number,
    col: number,
    empty?: boolean,
}

function positionToString(position: Position): string {
    return `${position.row},${position.col}`;
}

function stringToPosition(str: string): Position {
    const parts = str.split(',');
    if (parts.length !== 2) throw new Error('Invalid position format');

    const row = parseInt(parts[0]);
    const col = parseInt(parts[1]);

    return {row, col};
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


function getNeighbors(tiles: string[][], {row, col}: Position): Position[] {
    const neighbors: Position[] = []
    // left
    if (col - 1 >= 0)
        neighbors.push({row, col: col - 1});
    // right
    if (col + 1 < tiles[0].length)
        neighbors.push({row, col: col + 1});
    // up
    if (row - 1 >= 0)
        neighbors.push({row: row - 1, col});
    // down
    if (row + 1 < tiles.length)
        neighbors.push({row: row + 1, col});

    return neighbors;
}

function getFinalPath(cameFrom: Map<string, Position>, start: Position, goal: Position): Map<string, Direction> {
    let curr = goal;
    const path = new Map<string, Direction>();
    while (curr !== start) {
        const currPosStr = positionToString(curr);
        const next = cameFrom.get(currPosStr) as Position;
        path.set(currPosStr, getDirection(next, curr)); // reverse to get start to goal path
        curr = next;
    }
    return path;
}

function getPath(cameFrom: Map<string, Position>): Map<string, Direction> {
    const path = new Map<string, Direction>();
    for (const [dest, src] of cameFrom) {
        const currPosStr = dest;
        const curr = stringToPosition(currPosStr);
        const next = cameFrom.get(currPosStr) as Position;
        path.set(currPosStr, getDirection(next, curr)); // reverse to get start to goal path
    }
    return path;
}

function getDirection(src: Position, dest: Position): Direction {
    if (src.row < dest.row) {
        return Direction.Down;
    } else if (src.row > dest.row) {
        return Direction.Up;
    } else if (src.col > dest.col) {
        return Direction.Left;
    } else if (src.col < dest.col) {
        return Direction.Right;
    }
    throw new Error('Unknown direction!');
}

function renderPath(tiles: string[][], path: Map<string, Direction>) {
    let rowIndex = 0;
    for (const row of tiles) {
        let colIndex = 0;
        process.stdout.write('' + (rowIndex + 1) % 10 + ' ');
        for (const char of row) {
            const positionStr = positionToString({row: rowIndex, col: colIndex});
            if (path.has(positionStr))
                process.stdout.write(directionToArrow(path.get(positionStr) as Direction));
            else
                process.stdout.write(char);

            colIndex++;
        }
        process.stdout.write('\n');
        rowIndex++;
    }
}

function isCrucibleTooLong(curr: Position, next: Position, cameFrom: Map<string, Position>): boolean {
    const newDirection = getDirection(curr, next);
    const lastThreeDirection = [];

    let dest = curr;
    for (let i = 3; i > 0; i--) {
        const src = cameFrom.get(positionToString(dest)) as Position;

        // case came from map is too small!
        if (!src || src.empty === true) {
            break;
        }

        lastThreeDirection.push(getDirection(src, dest));
        dest = src;
    }
    // console.log('isCrucibleTooLong', curr, next, newDirection, lastThreeDirection);

    return lastThreeDirection.filter(v => v === newDirection).length >= 3;
}

export default async function () {
    const isPart1 = false;

    // step 1 : read input into array
    const tiles: string[][] = [];
    const heatLossMap = new Map<string, number>();
    let rowIndex = 0;
    for await (const line of readLines('./src/day17/input.txt')) {
        const row = [];
        let colIndex = 0;
        for (const colChar of line) {
            const heatLoss = Number(colChar);
            heatLossMap.set(positionToString({row: rowIndex, col: colIndex}), heatLoss);
            row.push(colChar);
            colIndex++;
        }
        tiles.push(row);
        rowIndex++;
    }


    // step 2 : find path with the heat loss so far
    const cameFrom = new Map<string, Position>();
    const heatLossSoFar = new Map<string, number>();
    const frontiers = new PriorityQueue<Position>(); // ref: https://www.redblobgames.com/pathfinding/a-star/introduction.html
    const start = {row: 0, col: 0}; // The starting point is the top-left city block.
    const goal = {row: tiles.length - 1, col: tiles[0].length - 1}  // the destination is the bottom-right city block.

    cameFrom.set(positionToString(start), {row: -1, col: -1, empty: true}); // Position: none
    heatLossSoFar.set(positionToString(start), 0);
    frontiers.enqueue(start, 0);

    while (frontiers.size() > 0) {
        const curr = frontiers.dequeue() as Position;

        if (curr.row === goal.row && curr.col === goal.col)
            break; // TODO: Check eary exit condition

        for (const next of getNeighbors(tiles, curr)) {
            const nextPosStr = positionToString(next);
            const currHeatLossSoFar = heatLossSoFar.get(positionToString(curr)) ?? 0;
            const currHeatLoss = (heatLossMap.get(nextPosStr) as number);
            const newHeatLossSoFar = currHeatLossSoFar + currHeatLoss;

            if (!isCrucibleTooLong(curr, next, cameFrom)) {
                if (!heatLossSoFar.has(nextPosStr) || newHeatLossSoFar < (heatLossMap.get(nextPosStr) as number)) {
                    heatLossSoFar.set(nextPosStr, newHeatLossSoFar);
                    const heuristic = Math.abs(goal.row - next.row) + Math.abs(goal.col - next.col);
                    const priority = newHeatLossSoFar + heuristic;
                    frontiers.enqueue(next, priority);
                    cameFrom.set(positionToString(next), curr);

                    console.log(cameFrom);
                    const path = getPath(cameFrom);
                    renderPath(tiles, path);
                    const ans = await waitKeyInput();
                    if (ans === 'exit')
                        break;
                }
            }

        }

    }

    const finalPath = getFinalPath(cameFrom, start, goal);
    renderPath(tiles, finalPath);

    console.log(heatLossSoFar.get(positionToString(goal)));
}