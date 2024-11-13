import {
    Colors,
    getColorText,
    readLines,
    spiltWith,
    spiltWithSpace,
} from '../utils';

// naming from https://adventofcode.com/2023/day/19
export type PartRating = {
    x: number;
    m: number;
    a: number;
    s: number;
};

export type Workflow = {
    name: string;
    condRules: Rule[]; // conditional rule
    lastDest: string;
};

export type Rule = {
    ratingType: string; //x, m, a, s
    operator: string; // > or <
    count: number;
    dest: string; // next workflow or Accept (A) or Reject (R)
};

export function extractWorkflow(workflow: string): Workflow {
    const pattern = /(.+){(.*)}/;
    const matches = workflow.match(pattern) as string[];
    const ruleTokens = spiltWith(',', matches[2]);
    const lastRuleToken = ruleTokens.pop() as string;

    const condRules: Rule[] = [];
    for (const ruleToken of ruleTokens) {
        const token = spiltWith(':', ruleToken);
        const ratingType = token[0].slice(0, 1);
        const operator = token[0].slice(1, 2);
        const count = Number(token[0].slice(2));
        const dest = token[1];
        condRules.push({ratingType, operator, count, dest});
    }

    return {
        name: matches[1],
        condRules,
        lastDest: lastRuleToken,
    };
}

export function extractPartRating(rating: string): PartRating {
    const pattern = /{x=(\d+),m=(\d+),a=(\d+),s=(\d+)}/;
    const matches = rating.match(pattern) as string[];
    return {
        x: Number(matches[1]),
        m: Number(matches[2]),
        a: Number(matches[3]),
        s: Number(matches[4]),
    };
}

async function readInput(): Promise<[Map<string, Workflow>, PartRating[]]> {
    const workflows = new Map<string, Workflow>();
    const partRatings: PartRating[] = [];
    let isWorkflow = true;
    for await (const line of readLines('./src/day19/input.txt')) {
        if (line) {
            if (isWorkflow) {
                const workflow = extractWorkflow(line);
                workflows.set(workflow.name, workflow);
            } else partRatings.push(extractPartRating(line));
        } else {
            isWorkflow = false;
        }
    }
    return [workflows, partRatings];
}

// return next workflow name or 'A' (Accept) or 'R' (Accept)
export function processWorkflowRule(
    part: PartRating,
    {ratingType, operator, count, dest}: Rule,
): string | undefined {
    let rating = -1;
    switch (ratingType) {
        case 'x':
            rating = part.x;
            break;
        case 'm':
            rating = part.m;
            break;
        case 'a':
            rating = part.a;
            break;
        case 's':
            rating = part.s;
            break;
    }
    if (operator === '>') {
        if (rating > count) {
            return dest;
        }
        return undefined;
    } else if (operator === '<') {
        if (rating < count) {
            return dest;
        }
        return undefined;
    } else {
        throw new Error('Unknown operator: ' + operator);
    }
}

function processWorkflowLastRule(
    {lastDest}: Workflow,
    workflows: Map<string, Workflow>,
): [boolean | undefined, Workflow | undefined] {
    if (lastDest === 'A') {
        return [true, undefined];
    } else if (lastDest === 'R') {
        return [false, undefined];
    } else {
        const nextWorkFlow = workflows.get(lastDest);
        if (nextWorkFlow) {
            return [undefined, nextWorkFlow];
        } else {
            throw new Error(
                'Part is not accepted or rejected and nextWorkFlow is not found!',
            );
        }
    }
}

export default async function () {
    // step 1: read input
    const [workflows, partRatings] = await readInput();
    console.log(workflows);

    // step 2: find accept part by workflows & part ratings
    let sumRating = 0;
    for (const part of partRatings) {
        let currWorkflow = workflows.get('in') as Workflow;
        let isAccept: boolean | undefined;
        let isProcess = true;

        // do unitl accept or rejected
        while (isProcess) {
            let nextWorkFlow: Workflow | undefined;
            let matchCondRule = false;

            // step 2.1 : check rules //

            for (const condRule of currWorkflow.condRules) {
                const nextWorkFlowName = processWorkflowRule(part, condRule);
                if (nextWorkFlowName) {
                    // case: Accepted
                    if (nextWorkFlowName === 'A') {
                        isAccept = true;
                    }
                    // case: Rejected
                    else if (nextWorkFlowName === 'R') {
                        isAccept = false;
                    }
                    // case: go to next workflow
                    else {
                        nextWorkFlow = workflows.get(nextWorkFlowName);
                    }
                    matchCondRule = true;
                    break;
                }
                // else {
                //     // Go to next rule if not match any condition
                // }
            }

            // if not match any condition rule go to last rule (last destination)
            if (!matchCondRule) {
                const [lastIsAccept, lastNextWorkFlow] =
                    processWorkflowLastRule(currWorkflow, workflows);
                isAccept = lastIsAccept;
                nextWorkFlow = lastNextWorkFlow;
            }

            // step 2.2 check if Accepted or Rejected and calculate sum of rating. otherwise go to next workflow. //

            // case go to next work flow
            if (nextWorkFlow) {
                currWorkflow = nextWorkFlow;
            }
            // case: Accepted or Rejected
            else {
                if (isAccept === true) {
                    sumRating += part.x;
                    sumRating += part.m;
                    sumRating += part.a;
                    sumRating += part.s;
                    isProcess = false;
                } else if (isAccept === false) {
                    // don't add rating if the part is rejected
                    isProcess = false;
                } else {
                    throw new Error(
                        'Part is not accepted or rejected and nextWorkFlow is not found!',
                    );
                }
            }
        }
        console.log('new sumRating', sumRating);
    }
}
