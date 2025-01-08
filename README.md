
# Advent of Code 2023

My solutions to the [Advent of Code](https://adventofcode.com) problems written in TypeScript.
These might be simple or "silly" solutions, but I'm doing this for fun! 😊

## Running the Code

### 1. Download the Puzzle Inputs

You can download all inputs using the `downloader.ps1` PowerShell script (Windows only):

```bash
.\downloader.ps1 -session [your_aoc_session]
```

Alternatively, use another tool to download the inputs and save them in the `src/day*/input.txt` directory.

### 2. Compile the TypeScript Files

Run the TypeScript compiler in watch mode:

```bash
npx tsc -w
```

### 3. Execute the Scripts

In a new terminal, run `index.js` with Node.js (or any other JavaScript runtime you prefer):

```bash
node ./build/index.js [day] [part]
```

For example, to run the script for Day 10, Part 1:

```bash
node ./build/index.js 10 1
```
