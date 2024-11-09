import util from 'util';
import {readLines, waitKeyInput, getColorText, Colors} from "../utils";
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

type CameFrom = {
    src: Frontier,
    direction: Direction
}

type Frontier = {
    tile: Position,
    distance: number,
    direction: Direction
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


// TODO: Need refactor to better readability
function getNeighbors(tiles: string[][], {tile: {row, col}, distance, direction}: Frontier): Frontier[] {
    const neighbors: Frontier[] = []

    switch (direction) {
        case Direction.Left:
            // left
            if (col - 1 >= 0)
                neighbors.push({tile: {row, col: col - 1}, distance: distance + 1, direction: Direction.Left});
            // up
            if (row - 1 >= 0)
                neighbors.push({tile: {row: row - 1, col}, distance: 1, direction: Direction.Up});
            // down
            if (row + 1 < tiles.length)
                neighbors.push({tile: {row: row + 1, col}, distance: 1, direction: Direction.Down});
            break;
        case Direction.Right:
            // right
            if (col + 1 < tiles[0].length)
                neighbors.push({tile: {row, col: col + 1}, distance: distance + 1, direction: Direction.Right});
            // up
            if (row - 1 >= 0)
                neighbors.push({tile: {row: row - 1, col}, distance: 1, direction: Direction.Up});
            // down
            if (row + 1 < tiles.length)
                neighbors.push({tile: {row: row + 1, col}, distance: 1, direction: Direction.Down});
            break;
        case Direction.Up:
            // left
            if (col - 1 >= 0)
                neighbors.push({tile: {row, col: col - 1}, distance: 1, direction: Direction.Left});
            // right
            if (col + 1 < tiles[0].length)
                neighbors.push({tile: {row, col: col + 1}, distance: 1, direction: Direction.Right});
            // up
            if (row - 1 >= 0)
                neighbors.push({tile: {row: row - 1, col}, distance: distance + 1, direction: Direction.Up});
            break;
        case Direction.Down:
            // left
            if (col - 1 >= 0)
                neighbors.push({tile: {row, col: col - 1}, distance: 1, direction: Direction.Left});
            // right
            if (col + 1 < tiles[0].length)
                neighbors.push({tile: {row, col: col + 1}, distance: 1, direction: Direction.Right});
            // down
            if (row + 1 < tiles.length)
                neighbors.push({tile: {row: row + 1, col}, distance: distance + 1, direction: Direction.Down});
            break;
        default:
            throw new Error('Unknown direction: ' + direction);
    }

    return neighbors;
}

function getDirection(src: Position, dest: Position): Direction {
    console.log('getDirection', src, dest)
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
function cameFromToPath(start: Position, goalFrontier: Frontier, cameFrom: Map<string, CameFrom>): Map<string, Direction> {
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
        process.stdout.write('' + (rowIndex + 1) % 10 + ' ');
        for (const char of row) {
            const positionStr = positionToString({row: rowIndex, col: colIndex});
            if (path.has(positionStr))
                process.stdout.write(getColorText(directionToArrow(path.get(positionStr) as Direction), Colors.Red));
            else
                process.stdout.write(char);

            colIndex++;
        }
        process.stdout.write('\n');
        rowIndex++;
    }
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
    const cameFrom = new Map<string, CameFrom>();
    const costSoFar = new Map<string, number>();
    const frontiers = new PriorityQueue<Frontier>(); // ref: https://www.redblobgames.com/pathfinding/a-star/introduction.html
    const start = {row: 0, col: 0}; // The starting point is the top-left city block.
    const goal = {row: tiles.length - 1, col: tiles[0].length - 1}  // the destination is the bottom-right city block.

    let goalFrontier: Frontier | undefined = undefined;

    const frontierStart1 = {tile: start, distance: 1, direction: Direction.Right};
    const frontierStart2 = {tile: start, distance: 1, direction: Direction.Down};
    costSoFar.set(frontierToString(frontierStart1), 0);
    costSoFar.set(frontierToString(frontierStart2), 0);
    frontiers.enqueue(frontierStart1, 0);
    frontiers.enqueue(frontierStart2, 0);

    while (frontiers.size() > 0) {

        // console.log('new frontiers', util.inspect(frontiers, false, null, true));

        const frontier = frontiers.dequeue() as Frontier;

        // console.log('curr frontier', util.inspect(frontier, false, null, true));
        // console.log('costSoFar', costSoFar);
        // await waitKeyInput();

        const {tile} = frontier;

        const currCostSoFar = costSoFar.get(frontierToString(frontier)) ?? 0;

        if (tile.row === goal.row && tile.col === goal.col) {
            goalFrontier = frontier;
            console.log(">>>", currCostSoFar, "<<<");
            break;
        }

        for (const nextFrontier of getNeighbors(tiles, frontier)) {
            const {tile: next, distance, direction} = nextFrontier;
            const nextPosStr = positionToString(next);
            const currCost = (heatLossMap.get(nextPosStr) as number);
            const newCostSoFar = currCostSoFar + currCost;

            if (!costSoFar.has(frontierToString(nextFrontier)) && distance <= 3) {
                costSoFar.set(frontierToString(nextFrontier), newCostSoFar);
                frontiers.enqueue(nextFrontier, newCostSoFar);
                cameFrom.set(frontierToString(nextFrontier), {src: frontier, direction: direction});

            } else if (newCostSoFar < (costSoFar.get(nextPosStr) as number)) {
                // TODO: case new path is lower cost
                throw new Error("WTF! The new path is lower cost!");
            }
        }

        // console.log('costSoFar', costSoFar);
        // console.log('frontiers', util.inspect(frontiers, false, null, true));
        // console.log('cameFrom', cameFrom);
    }
    if (goalFrontier) {
        const path = cameFromToPath(start, goalFrontier, cameFrom);
        console.log(path);
        renderPath(tiles, path);
    }
}