import {Colors, getColorText, readLines, spiltWith} from '../utils';
import util from 'util';

enum ModuleType {
    Unknown,
    Button,
    Boardcaster,
    FilpFlop,
    Conjuction,
}

enum ModuleState {
    On = 'on',
    Off = 'off',
    Low = 'low',
    High = 'high',
}

type Module = {
    name: string;
    type: ModuleType;
    inputs: string[];
    outputs: string[];
    states?: ModuleState[];
};

enum SignalType {
    Low,
    High,
}

type Signal = {
    type: SignalType;
    from: string;
    to: string;
};

async function readInput(): Promise<Map<string, Module>> {
    const moduleMap = new Map<string, Module>();
    const broadcasterModule: Module = {
        name: 'broadcaster',
        type: ModuleType.Boardcaster,
        inputs: ['button'],
        outputs: [],
    };
    moduleMap.set(broadcasterModule.name, broadcasterModule);
    const buttonModule: Module = {
        name: 'button',
        type: ModuleType.Button,
        inputs: [],
        outputs: ['broadcaster'],
    };
    moduleMap.set(buttonModule.name, buttonModule);

    for await (const line of readLines('./src/day20/input.txt')) {
        const token = spiltWith('->', line);
        const nameWithPrefix = token[0];
        const outputs = spiltWith(',', token[1]);

        let name = '';
        let type = ModuleType.Unknown;

        if (nameWithPrefix.startsWith('%')) type = ModuleType.FilpFlop;
        else if (nameWithPrefix.startsWith('&')) type = ModuleType.Conjuction;

        if (type === ModuleType.FilpFlop || type === ModuleType.Conjuction) {
            name = nameWithPrefix.slice(1);
            const existingModule = moduleMap.get(name);
            if (existingModule) {
                existingModule.type = type;
                existingModule.outputs = outputs;
                if (type === ModuleType.FilpFlop) {
                    existingModule.states = [ModuleState.Off];
                } else {
                    const totalInput = existingModule.inputs.length;
                    existingModule.states = new Array(totalInput).fill(
                        ModuleState.Low,
                    );
                }
            } else {
                const module: Module = {
                    name,
                    type,
                    inputs: [],
                    outputs,
                    // can't init state becase we don't know inputs
                };
                moduleMap.set(module.name, module);
            }
        } else if (nameWithPrefix === 'broadcaster') {
            name = nameWithPrefix;
            broadcasterModule.outputs = outputs;
        } else {
            throw new Error('Unknown module type: ' + nameWithPrefix);
        }

        // init output module with unknown type
        // or update (add more) input connection for output module
        for (const output of outputs) {
            const existingModule = moduleMap.get(output);
            if (existingModule) {
                existingModule.inputs.push(name);
                if (existingModule.type === ModuleType.FilpFlop) {
                    existingModule.states = [ModuleState.Off];
                } else {
                    const totalInput = existingModule.inputs.length;
                    existingModule.states = new Array(totalInput).fill(
                        ModuleState.Low,
                    );
                }
            } else {
                const module: Module = {
                    name: output,
                    type: ModuleType.Unknown,
                    inputs: [name],
                    outputs: [],
                };
                moduleMap.set(module.name, module);
            }
        }
    }
    return moduleMap;
}

function pressButton(): Signal {
    return {type: SignalType.Low, from: 'button', to: 'broadcaster'};
}

function processSignal(
    currSignal: Signal,
    moduleMap: Map<string, Module>,
): Signal[] {
    const toModule = moduleMap.get(currSignal.to) as Module;
    switch (toModule.type) {
        case ModuleType.Boardcaster:
            return doBoardcast(currSignal, toModule);
        case ModuleType.FilpFlop:
            return doFilpFlop(currSignal, toModule);
        case ModuleType.Conjuction:
            return doConjuction(currSignal, toModule);
        case ModuleType.Unknown:
            return [];
        default:
            throw new Error(
                'invalid module type' +
                    util.inspect(toModule, false, null, true),
            );
    }
}

function doFilpFlop(signal: Signal, filpFlop: Module): Signal[] {
    if (signal.type === SignalType.High) return [];
    else {
        if (!filpFlop.states)
            throw new Error('invalid filp-flop state: ' + filpFlop.states);

        const state = filpFlop.states[0];

        // toggle state and find new signal
        let signalOutType: SignalType;
        if (state === ModuleState.On) {
            filpFlop.states = [ModuleState.Off];
            signalOutType = SignalType.Low;
        } else {
            filpFlop.states = [ModuleState.On];
            signalOutType = SignalType.High;
        }

        return filpFlop.outputs.map(output => {
            return {
                from: filpFlop.name,
                to: output,
                type: signalOutType,
            };
        });
    }
}

function doConjuction(signal: Signal, conjuction: Module): Signal[] {
    // update states
    if (!conjuction.states)
        throw new Error('invalid module state: ' + conjuction.states);

    const inputStateIndex = conjuction.inputs.findIndex(v => v === signal.from);
    if (inputStateIndex === -1) {
        throw new Error(
            'cant find module state from the input: ' +
                signal.from +
                ', ' +
                conjuction.inputs,
        );
    }
    conjuction.states[inputStateIndex] =
        signal.type === SignalType.High ? ModuleState.High : ModuleState.Low;

    const everyStateIsHigh = conjuction.states.every(
        v => v === ModuleState.High,
    );
    const signalOutType = everyStateIsHigh ? SignalType.Low : SignalType.High;

    return conjuction.outputs.map(output => {
        return {
            from: conjuction.name,
            to: output,
            type: signalOutType,
        };
    });
}

function doBoardcast(signal: Signal, broadcaster: Module): Signal[] {
    return broadcaster.outputs.map(output => {
        return {
            from: broadcaster.name,
            to: output,
            type: signal.type,
        };
    });
}

function logSignal({from, type, to}: Signal) {
    let typeText = '';
    if (type === SignalType.High) {
        typeText = getColorText('high', Colors.Red);
    } else {
        typeText = getColorText('low', Colors.Blue);
    }
    console.log(from + ' -' + typeText + '-> ' + to);
}

export default async function () {
    const isPart1 = true;

    // step 1 : read puzzle input
    const moduleMap = await readInput();
    console.log(moduleMap);

    // step 2: signal simulation
    const signalQueue: Signal[] = [];

    if (isPart1) {
        // step 2-1-1: simulate 1000 button pressed and count total signal
        const totalButtonPressed = 4;
        let sumLowCount = 0;
        let sumHighCount = 0;
        for (let i = 0; i < totalButtonPressed; i++) {
            signalQueue.push(pressButton());

            let currSignal: Signal;
            let lowCount = 0;
            let highCount = 0;
            while (signalQueue.length > 0) {
                currSignal = signalQueue.shift() as Signal;
                logSignal(currSignal);
                // count new signal
                if (currSignal.type === SignalType.Low) lowCount++;
                else highCount++;

                const newSignal: Signal[] = processSignal(
                    currSignal,
                    moduleMap,
                );
                signalQueue.push(...newSignal);
            }
            console.log();

            sumLowCount += lowCount;
            sumHighCount += highCount;
        }
        // step 2-1-2: multiply low and high signal count
        console.log('multiply result', sumLowCount * sumHighCount);
    } else {
        // TODO
    }
}
