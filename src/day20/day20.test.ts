import {
    doBroadcast,
    doConjunction,
    doFilpFlop,
    Module,
    ModuleState,
    ModuleType,
    Signal,
    SignalType,
} from './day20';

describe('doFilpFlop function', () => {
    it('should return empty signal with the given input is the HIGH signal', () => {
        const actual: Signal[] = doFilpFlop(
            {
                type: SignalType.High,
                from: 'a',
                to: 'b',
            },
            {
                name: 'b',
                type: ModuleType.FilpFlop,
                inputs: ['a'],
                outputs: ['c'],
            },
        );
        const expected: Signal[] = [];
        expect(actual).toEqual(expected);
    });

    it('should return LOW signal to all output with the flip-flop module state is ON and the given input is the LOW signal', () => {
        const actual: Signal[] = doFilpFlop(
            {
                type: SignalType.Low,
                from: 'a',
                to: 'b',
            },
            {
                name: 'b',
                type: ModuleType.FilpFlop,
                inputs: ['a'],
                outputs: ['c', 'd'],
                states: [ModuleState.On],
            },
        );
        const expected: Signal[] = [
            {
                type: SignalType.Low,
                from: 'b',
                to: 'c',
            },
            {
                type: SignalType.Low,
                from: 'b',
                to: 'd',
            },
        ];
        expect(actual).toEqual(expected);
    });

    it('should return HIGH signal to all output with the flip-flop module state is OFF and the given input is the LOW signal', () => {
        const actual: Signal[] = doFilpFlop(
            {
                type: SignalType.Low,
                from: 'a',
                to: 'b',
            },
            {
                name: 'b',
                type: ModuleType.FilpFlop,
                inputs: ['a'],
                outputs: ['c', 'd'],
                states: [ModuleState.Off],
            },
        );
        const expected: Signal[] = [
            {
                type: SignalType.High,
                from: 'b',
                to: 'c',
            },
            {
                type: SignalType.High,
                from: 'b',
                to: 'd',
            },
        ];
        expect(actual).toEqual(expected);
    });
});

describe('doBroadcast function', () => {
    it('should return the LOW signal to all output with the given input is the LOW signal', () => {
        const actual: Signal[] = doBroadcast(
            {
                type: SignalType.Low,
                from: 'a',
                to: 'b',
            },
            {
                name: 'b',
                type: ModuleType.Boardcaster,
                inputs: ['a'],
                outputs: ['c', 'd', 'e'],
            },
        );
        const expected: Signal[] = [
            {
                type: SignalType.Low,
                from: 'b',
                to: 'c',
            },
            {
                type: SignalType.Low,
                from: 'b',
                to: 'd',
            },
            {
                type: SignalType.Low,
                from: 'b',
                to: 'e',
            },
        ];
        expect(actual).toEqual(expected);
    });
});
describe('doConjunction function', () => {
    it('should return the HIGH signal to all output with the given input is the LOW signal', () => {
        const actual: Signal[] = doConjunction(
            {
                type: SignalType.Low,
                from: 'a',
                to: 'b',
            },
            {
                name: 'b',
                type: ModuleType.Conjunction,
                inputs: ['a'],
                outputs: ['c', 'd'],
                states: [ModuleState.Low],
            },
        );
        const expected: Signal[] = [
            {
                type: SignalType.High,
                from: 'b',
                to: 'c',
            },
            {
                type: SignalType.High,
                from: 'b',
                to: 'd',
            },
        ];
        expect(actual).toEqual(expected);
    });

    it('should return the LOW signal to all output with the given input is the HIGH signal and it connected to a single input', () => {
        const actual: Signal[] = doConjunction(
            {
                type: SignalType.High,
                from: 'a',
                to: 'b',
            },
            {
                name: 'b',
                type: ModuleType.Conjunction,
                inputs: ['a'],
                outputs: ['c', 'd'],
                states: [ModuleState.Low],
            },
        );
        const expected: Signal[] = [
            {
                type: SignalType.Low,
                from: 'b',
                to: 'c',
            },
            {
                type: SignalType.Low,
                from: 'b',
                to: 'd',
            },
        ];
        expect(actual).toEqual(expected);
    });

    it('should return the HIGH signal to all output with the given input is the HIGH signal and module remember that the other last input is LOW', () => {
        const actual: Signal[] = doConjunction(
            {
                type: SignalType.High,
                from: 'a',
                to: 'b',
            },
            {
                name: 'b',
                type: ModuleType.Conjunction,
                inputs: ['a', 'x'],
                outputs: ['c', 'd'],
                states: [ModuleState.Low, ModuleState.Low],
            },
        );
        const expected: Signal[] = [
            {
                type: SignalType.High,
                from: 'b',
                to: 'c',
            },
            {
                type: SignalType.High,
                from: 'b',
                to: 'd',
            },
        ];
        expect(actual).toEqual(expected);
    });

    it('should the conjunction module is update state correctly with the given input 1', () => {
        const actual: Module = {
            name: 'b',
            type: ModuleType.Conjunction,
            inputs: ['a', 'x'],
            outputs: ['c', 'd'],
            states: [ModuleState.Low, ModuleState.Low],
        };
        doConjunction(
            {
                type: SignalType.High,
                from: 'a',
                to: 'b',
            },
            actual,
        );
        const expected: Module = {
            ...actual,
            states: [ModuleState.High, ModuleState.Low],
        };
        expect(actual).toEqual(expected);
    });

    it('should the conjunction module is update state correctly with the given input 2', () => {
        const actual: Module = {
            name: 'b',
            type: ModuleType.Conjunction,
            inputs: ['a', 'x'],
            outputs: ['c', 'd'],
            states: [ModuleState.Low, ModuleState.Low],
        };
        doConjunction(
            {
                type: SignalType.High,
                from: 'x',
                to: 'b',
            },
            actual,
        );
        const expected: Module = {
            ...actual,
            states: [ModuleState.Low, ModuleState.High],
        };
        expect(actual).toEqual(expected);
    });

    it('should the conjunction module is update state correctly with the given input 3', () => {
        const actual: Module = {
            name: 'b',
            type: ModuleType.Conjunction,
            inputs: ['a', 'x'],
            outputs: ['c', 'd'],
            states: [ModuleState.High, ModuleState.High],
        };
        doConjunction(
            {
                type: SignalType.Low,
                from: 'x',
                to: 'b',
            },
            actual,
        );
        const expected: Module = {
            ...actual,
            states: [ModuleState.High, ModuleState.Low],
        };
        expect(actual).toEqual(expected);
    });
});
