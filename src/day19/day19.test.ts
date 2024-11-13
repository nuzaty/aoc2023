import {
    extractWorkflow,
    extractPartRating,
    Workflow,
    PartRating,
    processWorkflowRule,
} from './day19';

describe('extractWorkflow function', () => {
    it('should return a corrected workflow with the given input 1', () => {
        const actual: Workflow = extractWorkflow('px{a<2006:qkq,m>2090:A,rfg}');
        const expected: Workflow = {
            name: 'px',
            condRules: [
                {ratingType: 'a', operator: '<', count: 2006, dest: 'qkq'},
                {ratingType: 'm', operator: '>', count: 2090, dest: 'A'},
            ],
            lastDest: 'rfg',
        };
        expect(actual).toEqual(expected);
    });

    it('should return a corrected workflow with the given input 2', () => {
        const actual: Workflow = extractWorkflow('qqz{s>2770:qs,m<1801:hdj,R}');
        const expected: Workflow = {
            name: 'qqz',
            condRules: [
                {ratingType: 's', operator: '>', count: 2770, dest: 'qs'},
                {ratingType: 'm', operator: '<', count: 1801, dest: 'hdj'},
            ],
            lastDest: 'R',
        };
        expect(actual).toEqual(expected);
    });

    it('should return a corrected workflow with the given input 3', () => {
        const actual: Workflow = extractWorkflow('hdj{m>838:A,pv}');
        const expected: Workflow = {
            name: 'hdj',
            condRules: [
                {ratingType: 'm', operator: '>', count: 838, dest: 'A'},
            ],
            lastDest: 'pv',
        };
        expect(actual).toEqual(expected);
    });
});

describe('extractPartRating function', () => {
    it('should return a corrected part rating with the given input', () => {
        const actual: PartRating = extractPartRating(
            '{x=787,m=2655,a=1222,s=2876}',
        );
        const expected: PartRating = {
            x: 787,
            m: 2655,
            a: 1222,
            s: 2876,
        };
        expect(actual).toEqual(expected);
    });
});

describe('processWorkflowRule function', () => {
    it('should return a corrected next workflow name with the given input 1', () => {
        const actual: string | undefined = processWorkflowRule(
            {
                x: 787,
                m: 2655,
                a: 1222,
                s: 2876,
            },
            {ratingType: 'x', operator: '>', count: 786, dest: 'A'},
        );
        const expected = 'A';
        expect(actual).toEqual(expected);
    });
});

describe('processWorkflowRule function', () => {
    it('should return a corrected next workflow name with the given input 2', () => {
        const actual: string | undefined = processWorkflowRule(
            {
                x: 787,
                m: 2655,
                a: 1222,
                s: 2876,
            },
            {ratingType: 'x', operator: '>', count: 787, dest: 'A'},
        );
        const expected = undefined;
        expect(actual).toEqual(expected);
    });
});
