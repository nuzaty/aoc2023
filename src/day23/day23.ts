import {readLines} from '../utils';

type Position = {row: number; col: number};

type Walker = {position: Position; steps: number};

export default async function (isPart1: boolean): Promise<number> {
    const tiles = await readPuzzleInput();

    const startNode: Position = findStartNode(tiles);
    const endNode: Position = findEndNode(tiles);

    const nodes: Position[] = [startNode, endNode];

    // step 1 : find nodes
    tiles.forEach((row, r) => {
        row.forEach((colChar, c) => {
            if (colChar === '#') return;

            const currentNode: Position = {row: r, col: c};
            const neighbors = findNeighbors(tiles, currentNode, true);

            // if have three neighbors, then it's a junction (nodes)
            if (neighbors.length >= 3) {
                nodes.push(currentNode);
            }
        });
    });

    // step 2 : connect each node
    const graphs = new Map<string, Map<string, number>>();
    nodes.forEach(node => {
        const stack: Walker[] = [{position: node, steps: 0}];
        const seen: Set<string> = new Set();
        seen.add(posToString(node));

        while (stack.length > 0) {
            const {position, steps} = stack.pop() as Walker;

            // case found other node
            if (
                steps !== 0 &&
                nodes.some(
                    n => n.row === position.row && n.col === position.col,
                )
            ) {
                const nodePosStr = posToString(node);

                let innerMap: Map<string, number>;
                if (graphs.has(nodePosStr)) {
                    innerMap = graphs.get(nodePosStr) as Map<string, number>;
                } else {
                    innerMap = new Map<string, number>();
                    graphs.set(nodePosStr, innerMap);
                }
                innerMap.set(posToString(position), steps);
                continue;
            }

            const neighbors = findNeighbors(tiles, position, !isPart1);
            for (const neighbor of neighbors) {
                const neighborStr = posToString(neighbor);
                if (!seen.has(neighborStr)) {
                    stack.push({position: neighbor, steps: steps + 1});
                    seen.add(neighborStr);
                }
            }
        }
    });

    // step 3 : find the longest path between any two nodes using DFS
    const longestPath = dfs(startNode, endNode, tiles, graphs);
    console.log('Longest path:', longestPath);

    return longestPath;
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

function findStartNode(tiles: string[][]): Position {
    // the start node is the first '.' in the first row
    // Placeholder logic to find the start node
    for (let col = 0; col < tiles[0].length; col++) {
        if (tiles[0][col] === '.') {
            return {row: 0, col};
        }
    }
    throw new Error('Start node not found'); // Placeholder error handling
}

function findEndNode(tiles: string[][]): Position {
    // the end node is the first '.' in the last row
    for (let col = 0; col < tiles[tiles.length - 1].length; col++) {
        if (tiles[tiles.length - 1][col] === '.') {
            return {row: tiles.length - 1, col};
        }
    }
    throw new Error('End node not found'); // Placeholder error handling
}

function findNeighbors(
    tiles: string[][],
    pos: Position,
    ignorePosChar: boolean,
): Position[] {
    const neighbors: Position[] = [];
    const posChar = tiles[pos.row][pos.col];

    const allDirections = [
        {row: -1, col: 0}, // up
        {row: 1, col: 0}, // down
        {row: 0, col: -1}, // left
        {row: 0, col: 1}, // right
    ];

    const directionsByChar: Record<string, Position[]> = {
        '^': [
            {row: -1, col: 0}, // up
        ],
        // eslint-disable-next-line prettier/prettier
        'v': [
            {row: 1, col: 0}, // down
        ],
        '>': [
            {row: 0, col: 1}, // right
        ],
        '<': [
            {row: 0, col: -1}, // left
        ],
        '.': allDirections,
    };

    const directions = ignorePosChar
        ? allDirections
        : directionsByChar[posChar];

    for (const direction of directions) {
        const newRow = pos.row + direction.row;
        const newCol = pos.col + direction.col;

        if (
            newRow >= 0 &&
            newRow < tiles.length &&
            newCol >= 0 &&
            newCol < tiles[newRow].length &&
            tiles[newRow][newCol] !== '#'
        ) {
            neighbors.push({row: newRow, col: newCol});
        }
    }

    return neighbors;
}

function posToString(pos: Position): string {
    return `${pos.row},${pos.col}`; // Convert position to a unique string representation
}

function stringToPos(str: string): Position {
    const [rowStr, colStr] = str.split(',');
    return {row: parseInt(rowStr), col: parseInt(colStr)}; // Convert string back to position
}

function dfs(
    node: Position,
    end: Position,
    tiles: string[][],
    graphs: Map<string, Map<string, number>>,
    seen: Set<String> | undefined = undefined,
): number {
    if (node.col === end.col && node.row === end.row) {
        return 0;
    }
    if (!seen) seen = new Set<string>();
    let maxLength = -Infinity;

    const nodePos = posToString(node);
    seen.add(nodePos);
    for (const next of graphs.get(nodePos)!.keys()) {
        if (!seen.has(next)) {
            maxLength = Math.max(
                maxLength,
                dfs(stringToPos(next), end, tiles, graphs, seen) +
                    graphs.get(nodePos)!.get(next)!,
            );
        }
    }
    seen.delete(nodePos); // Backtrack
    return maxLength;
}
