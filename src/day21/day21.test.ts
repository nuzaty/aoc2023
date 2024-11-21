import {getTile} from './day21'; // Adjust the import path as necessary

describe('getTile Function', () => {
    let tiles: string[][];

    beforeEach(() => {
        // Setup a sample tile grid for testing
        tiles = [
            ['A1', 'A2', 'A3'],
            ['B1', 'B2', 'B3'],
            ['C1', 'C2', 'C3'],
        ];
    });

    afterEach(() => {
        // Teardown: Clear the tiles array after each test
        tiles = [];
    });

    it('should return the correct tile for positive indices', () => {
        expect(getTile(0, 0, tiles)).toBe('A1');
        expect(getTile(1, 2, tiles)).toBe('B3');
        expect(getTile(2, 1, tiles)).toBe('C2');
    });

    it('should handle negative row indices by wrapping around', () => {
        expect(getTile(-1, 0, tiles)).toBe('C1'); // -1 % 3 = 2
        expect(getTile(-4, 1, tiles)).toBe('C2'); // -4 % 3 = 2, then 2 % 3 = 2
        expect(getTile(-3, 2, tiles)).toBe('A3'); // -3 % 3 = 0
    });

    it('should handle negative column indices by wrapping around', () => {
        expect(getTile(0, -1, tiles)).toBe('A3'); // -1 % 3 = 2
        expect(getTile(1, -4, tiles)).toBe('B3'); // -4 % 3 = 2
        expect(getTile(2, -3, tiles)).toBe('C1'); // -3 % 3 = 0
    });

    it('should handle negative row and column indices by wrapping around', () => {
        expect(getTile(-1, -1, tiles)).toBe('C3');
        expect(getTile(-2, -2, tiles)).toBe('B2');
        expect(getTile(-3, -3, tiles)).toBe('A1');
    });

    it('should return the correct tile for large positive indices', () => {
        expect(getTile(6, 0, tiles)).toBe('A1'); // 6 % 3 = 0
        expect(getTile(7, 8, tiles)).toBe('B3'); // 7 % 3 = 1, 8 % 3 = 2
    });

    it('should handle non-square tile grids', () => {
        tiles = [['A1', 'A2'], ['B1', 'B2', 'B3'], ['C1']];

        expect(getTile(0, 1, tiles)).toBe('A2');
        expect(getTile(1, 2, tiles)).toBe('B3');
        expect(getTile(2, 0, tiles)).toBe('C1');
    });

    it('should handle very large negative indices', () => {
        expect(getTile(-1000000, -1000000, tiles)).toBe('C3'); // Large negative indices should wrap around correctly
    });
});
