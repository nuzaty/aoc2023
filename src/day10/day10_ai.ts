import { readFileSync } from 'fs';

type Pos = { x: number, y: number };
type Grid = string[][];

const DIRS: Pos[] = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
const PIPES: { [key: string]: number[] } = {
    '|': [0, 2], '-': [1, 3], 'L': [0, 1], 'J': [0, 3], '7': [2, 3], 'F': [1, 2], 'S': [0, 1, 2, 3]
};

function parseInput(input: string): [Grid, Pos] {
    const grid = input.split('\n').map(line => line.split(''));
    const start = grid.flatMap((row, y) =>
        row.map((cell, x) => cell === 'S' ? { x, y } : null)
    ).find(pos => pos !== null)!;
    return [grid, start];
}

function getNextPos(grid: Grid, pos: Pos, from: number): [Pos, number] | null {
    const pipe = PIPES[grid[pos.y][pos.x]];
    if (!pipe) return null;
    const to = pipe.find(d => d !== (from + 2) % 4);
    if (to === undefined) return null;
    return [{ x: pos.x + DIRS[to].x, y: pos.y + DIRS[to].y }, to];
}

function traverseLoop(grid: Grid, start: Pos): [Set<string>, number] {
    const loop = new Set<string>();
    let pos = start, from = -1, steps = 0;
    do {
        loop.add(`${pos.x},${pos.y}`);
        const next = DIRS.map((_, i) => getNextPos(grid, pos, i)).find(n => n);
        if (!next) break;
        [pos, from] = next;
        steps++;
    } while (pos.x !== start.x || pos.y !== start.y);
    return [loop, steps / 2];
}

function countEnclosedTiles(grid: Grid, loop: Set<string>): number {
    let enclosed = 0;
    for (let y = 0; y < grid.length; y++) {
        let inside = false;
        let lastCorner = '';
        for (let x = 0; x < grid[y].length; x++) {
            if (loop.has(`${x},${y}`)) {
                const tile = grid[y][x];
                if (tile === '|') {
                    inside = !inside;
                } else if ('LF'.includes(tile)) {
                    lastCorner = tile;
                } else if (tile === '7' && lastCorner === 'L') {
                    inside = !inside;
                } else if (tile === 'J' && lastCorner === 'F') {
                    inside = !inside;
                }
            } else if (inside) {
                enclosed++;
            }
        }
    }
    return enclosed;
}

function solvePuzzle(input: string): [number, number] {
    const [grid, start] = parseInput(input);
    console.log('grid', grid);
    const [loop, farthest] = traverseLoop(grid, start);
    const enclosed = countEnclosedTiles(grid, loop);
    return [farthest, enclosed];
}

export async function day10_ai() {
    const input = readFileSync('./src/day10/input.txt', 'utf-8');
    // console.log('input:', input);

    const [part1, part2] = solvePuzzle(input);
    console.log('Part 1:', part1);
    console.log('Part 2:', part2);
}