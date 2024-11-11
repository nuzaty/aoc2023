import fs from 'node:fs';
import readline from 'readline';

export function readLines(fileName: string) {
    const fileStream = fs.createReadStream(fileName);
    return readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });
}

export function spiltWith(delimiter: string, str: string) {
    return str
        .split(delimiter)
        .map(item => item.trim())
        .filter(item => item);
}

export function spiltWithSpace(str: string) {
    return str
        .split(' ')
        .map(item => item.trim())
        .filter(item => item);
}

export function sleep(ms: number) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

export function waitKeyInput(text?: string) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve =>
        rl.question(text || 'Press key to continue', ans => {
            rl.close();
            resolve(ans);
        }),
    );
}

export enum Colors {
    Red,
    Blue,
    Yellow,
    Green,
    Magenta,
}

export function colorToConsoleCode(color: Colors): string[] {
    let codes: number[] = [];

    if (color === Colors.Blue) {
        codes = [94, 39];
    } else if (color === Colors.Red) {
        codes = [91, 39];
    } else if (color === Colors.Yellow) {
        codes = [93, 39];
    } else if (color === Colors.Green) {
        codes = [92, 39];
    } else if (color === Colors.Magenta) {
        codes = [95, 39];
    } else {
        throw new Error('Unknown color: ' + color);
    }

    return ['\x1b[' + codes[0] + 'm', '\x1b[' + codes[1] + 'm'];
}

export function getColorText(text: string, color: Colors): string {
    const codes = colorToConsoleCode(color);
    return codes[0] + text + codes[1] + '\x1b[0m';
}
