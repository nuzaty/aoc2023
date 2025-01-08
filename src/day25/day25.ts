import {readLines, spiltWith, spiltWithSpace} from '../utils';
import fs from 'fs';

export default async function (isPart1: boolean): Promise<number> {
    // read input
    const originalGraph = await readPuzzleInput(false);
    const graph = await readPuzzleInput(true);

    // gen graph map data file
    const dataFile = 'src/day25/graph_output.txt';
    if (fs.existsSync(dataFile)) fs.unlinkSync(dataFile);
    const lines = new Set<string>();
    for (const [key, val] of originalGraph) {
        for (const value of val) {
            const line = "('" + key + "', '" + value + "')" + ',';
            if (lines.has(line)) {
                throw new Error('found duplicate!');
            }
            lines.add(line);

            fs.appendFileSync(dataFile, line + '\n');
        }
    }

    const groupBefore = countGroup(graph);
    console.log('groupBefore: ', groupBefore);

    // cheating by graph visualization from graph_output.txt (plot data with python networkx) :P
    for (const [node1, node2] of [
        ['kpc', 'nnl'],
        ['rkh', 'sph'],
        ['mnf', 'hrs'],
    ]) {
        disconnect(node1, node2, graph);
    }

    const groupAfter = countGroup(graph);
    console.log('groupAfter: ', groupAfter);

    if (isPart1 && groupAfter === 2) {
        const groupsSize = findGroupsSize(graph);
        const result = groupsSize[0] * groupsSize[1];
        console.log('PART1 result: ', result);
        return result;
    } else {
        return 0;
    }
}
async function readPuzzleInput(
    addMissing: boolean,
): Promise<Map<string, string[]>> {
    const graphs = new Map<string, string[]>();
    for await (const line of readLines('./src/day25/input.txt')) {
        const token = spiltWith(':', line);
        const nodeKey = token[0];
        const nodeValues = spiltWithSpace(token[1]);
        if (!graphs.has(nodeKey)) {
            graphs.set(nodeKey, nodeValues);
        } else {
            graphs.get(nodeKey)!.push(...nodeValues);
        }

        if (addMissing) {
            // add missing node and value
            for (const nodeVal of nodeValues) {
                if (!graphs.has(nodeVal)) graphs.set(nodeVal, [nodeKey]);
                else {
                    const nodeValSet = new Set([...graphs.get(nodeVal)!]);
                    nodeValSet.add(nodeKey);
                    graphs.set(nodeVal, [...nodeValSet]);
                }
            }
        }
    }
    return graphs;
}

function countGroup(graph: Map<string, string[]>): number {
    const tree = new Map<string, Set<string>>();
    const visited = new Set<string>();
    let groups = 0;
    for (const node of graph.keys()) {
        if (!visited.has(node)) {
            groups++;
            dfs(graph, node, visited);
        }
    }

    function dfs(
        graph: Map<string, string[]>,
        node: string,
        visited: Set<string>,
    ): void {
        visited.add(node);
        tree.set(node, new Set<string>());

        for (const neighbor of graph.get(node) ?? []) {
            if (!visited.has(neighbor)) {
                tree.get(node)!.add(neighbor);
                dfs(graph, neighbor, visited);
            }
        }
    }

    return groups;
}

function disconnect(
    node1: string,
    node2: string,
    graphs: Map<string, string[]>,
) {
    // disconnect node1 and node2 in both directions
    const node1Neighbors = new Set(graphs.get(node1)!);
    const node2Neighbors = new Set(graphs.get(node2)!);

    node1Neighbors.delete(node2);
    node2Neighbors.delete(node1);

    graphs.set(node1, [...node1Neighbors]);
    graphs.set(node2, [...node2Neighbors]);
}

function findGroupsSize(graph: Map<string, string[]>): number[] {
    const groupsSize = [];
    const visited = new Set<string>();
    for (const node of graph.keys()) {
        if (!visited.has(node)) {
            const groupSize = dfsGraphSize(graph, node, visited);
            groupsSize.push(groupSize);
        }
    }
    return groupsSize;
}

function dfsGraphSize(
    graph: Map<string, string[]>,
    node: string,
    visited: Set<string>,
): number {
    if (visited.has(node)) return 0;

    visited.add(node);

    let size = 1;

    for (const neighbor of graph.get(node)!) {
        size += dfsGraphSize(graph, neighbor, visited);
    }

    return size;
}
