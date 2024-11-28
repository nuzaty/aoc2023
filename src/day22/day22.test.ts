import {
    isPointOnAxisAlignedLine,
    isAxisAlignedSegmentOverlap,
    doAxisAlignedSegmentsIntersect,
    Line,
    Point2D,
} from './day22';

describe('isPointOnOrthogonalLine', () => {
    let horizontalLine: Line;
    let verticalLine: Line;
    let pointInsideHorizontal: Point2D;
    let pointOutsideHorizontal: Point2D;
    let pointInsideVertical: Point2D;
    let pointOutsideVertical: Point2D;
    let pointOnStartOfHorizontal: Point2D;
    let pointOnEndOfHorizontal: Point2D;
    let pointOnStartOfVertical: Point2D;
    let pointOnEndOfVertical: Point2D;

    beforeEach(() => {
        // Horizontal line from (1, 3) to (5, 3)
        horizontalLine = {start: {x: 1, y: 3}, end: {x: 5, y: 3}};
        // Vertical line from (4, 2) to (4, 6)
        verticalLine = {start: {x: 4, y: 2}, end: {x: 4, y: 6}};

        pointInsideHorizontal = {x: 3, y: 3};
        pointOutsideHorizontal = {x: 6, y: 3};
        pointInsideVertical = {x: 4, y: 4};
        pointOutsideVertical = {x: 4, y: 7};
        pointOnStartOfHorizontal = {x: 1, y: 3};
        pointOnEndOfHorizontal = {x: 5, y: 3};
        pointOnStartOfVertical = {x: 4, y: 2};
        pointOnEndOfVertical = {x: 4, y: 6};
    });

    afterEach(() => {
        // Teardown can be done here if necessary
    });

    describe('Horizontal Line', () => {
        it('should return true for a point inside the line', () => {
            expect(
                isPointOnAxisAlignedLine(horizontalLine, pointInsideHorizontal),
            ).toBe(true);
        });

        it('should return false for a point outside the line', () => {
            expect(
                isPointOnAxisAlignedLine(
                    horizontalLine,
                    pointOutsideHorizontal,
                ),
            ).toBe(false);
        });

        it('should return true for the start point of the line', () => {
            expect(
                isPointOnAxisAlignedLine(
                    horizontalLine,
                    pointOnStartOfHorizontal,
                ),
            ).toBe(true);
        });

        it('should return true for the end point of the line', () => {
            expect(
                isPointOnAxisAlignedLine(
                    horizontalLine,
                    pointOnEndOfHorizontal,
                ),
            ).toBe(true);
        });
    });

    describe('Vertical Line', () => {
        it('should return true for a point inside the line', () => {
            expect(
                isPointOnAxisAlignedLine(verticalLine, pointInsideVertical),
            ).toBe(true);
        });

        it('should return false for a point outside the line', () => {
            expect(
                isPointOnAxisAlignedLine(verticalLine, pointOutsideVertical),
            ).toBe(false);
        });

        it('should return true for the start point of the line', () => {
            expect(
                isPointOnAxisAlignedLine(verticalLine, pointOnStartOfVertical),
            ).toBe(true);
        });

        it('should return true for the end point of the line', () => {
            expect(
                isPointOnAxisAlignedLine(verticalLine, pointOnEndOfVertical),
            ).toBe(true);
        });
    });

    describe('Edge Cases', () => {
        it('should return false for a point not aligned with the line', () => {
            const misalignedPoint = {x: 3, y: 4};
            expect(
                isPointOnAxisAlignedLine(horizontalLine, misalignedPoint),
            ).toBe(false);
        });

        it('should handle lines in reverse order (start > end)', () => {
            const reversedHorizontalLine = {
                start: {x: 5, y: 3},
                end: {x: 1, y: 3},
            };
            expect(
                isPointOnAxisAlignedLine(
                    reversedHorizontalLine,
                    pointInsideHorizontal,
                ),
            ).toBe(true);
        });

        it('should handle a single point line', () => {
            const singlePointLine = {start: {x: 4, y: 2}, end: {x: 4, y: 2}};
            expect(
                isPointOnAxisAlignedLine(
                    singlePointLine,
                    pointOnStartOfVertical,
                ),
            ).toBe(true);
        });
    });
});

describe('isAxisAlignedSegmentOverlap', () => {
    // Helper function to create lines more easily
    const line = (x1: number, y1: number, x2: number, y2: number): Line => ({
        start: {x: x1, y: y1},
        end: {x: x2, y: y2},
    });

    it('should return true for overlapping vertical lines', () => {
        const l1 = line(0, 0, 0, 5);
        const l2 = line(0, 3, 0, 8);
        expect(isAxisAlignedSegmentOverlap(l1, l2)).toBe(true);
    });

    it('should return false for non-overlapping vertical lines', () => {
        const l1 = line(0, 0, 0, 5);
        const l2 = line(0, 6, 0, 8);
        expect(isAxisAlignedSegmentOverlap(l1, l2)).toBe(false);
    });

    it('should return true for overlapping horizontal lines', () => {
        const l1 = line(0, 0, 5, 0);
        const l2 = line(3, 0, 8, 0);
        expect(isAxisAlignedSegmentOverlap(l1, l2)).toBe(true);
    });

    it('should return false for non-overlapping horizontal lines', () => {
        const l1 = line(0, 0, 5, 0);
        const l2 = line(6, 0, 8, 0);
        expect(isAxisAlignedSegmentOverlap(l1, l2)).toBe(false);
    });

    it('should return true for touching vertical lines', () => {
        const l1 = line(0, 0, 0, 5);
        const l2 = line(0, 5, 0, 8);
        expect(isAxisAlignedSegmentOverlap(l1, l2)).toBe(true);
    });

    it('should return true for touching horizontal lines', () => {
        const l1 = line(0, 0, 5, 0);
        const l2 = line(5, 0, 8, 0);
        expect(isAxisAlignedSegmentOverlap(l1, l2)).toBe(true);
    });

    it('should return false for parallel but non-overlapping lines', () => {
        const l1 = line(0, 0, 0, 5);
        const l2 = line(1, 3, 1, 8);
        expect(isAxisAlignedSegmentOverlap(l1, l2)).toBe(false);

        const h1 = line(0, 0, 5, 0);
        const h2 = line(6, 0, 8, 0);
        expect(isAxisAlignedSegmentOverlap(h1, h2)).toBe(false);
    });

    it('should handle lines with only one point correctly (vertical)', () => {
        const l1 = line(0, 0, 0, 0);
        const l2 = line(0, 0, 0, 5);
        expect(isAxisAlignedSegmentOverlap(l1, l2)).toBe(true);

        const l3 = line(0, 6, 0, 8);
        expect(isAxisAlignedSegmentOverlap(l1, l3)).toBe(false);
    });

    it('should handle lines with only one point correctly (horizontal)', () => {
        const l1 = line(0, 0, 0, 0);
        const l2 = line(0, 0, 5, 0);
        expect(isAxisAlignedSegmentOverlap(l1, l2)).toBe(true);

        const l3 = line(6, 0, 8, 0);
        expect(isAxisAlignedSegmentOverlap(l1, l3)).toBe(false);
    });

    it('should handle lines that are exactly the same', () => {
        const l1 = line(0, 0, 5, 0);
        const l2 = line(0, 0, 5, 0);
        expect(isAxisAlignedSegmentOverlap(l1, l2)).toBe(true);

        const v1 = line(0, 0, 0, 5);
        const v2 = line(0, 0, 0, 5);
        expect(isAxisAlignedSegmentOverlap(v1, v2)).toBe(true);
    });

    it('should handle lines that are just touching at a single point (vertical)', () => {
        const l1 = line(0, 0, 0, 3);
        const l2 = line(0, 3, 0, 5);
        expect(isAxisAlignedSegmentOverlap(l1, l2)).toBe(true);

        const v1 = line(0, 3, 0, 5);
        const v2 = line(0, 0, 0, 3);
        expect(isAxisAlignedSegmentOverlap(v1, v2)).toBe(true);
    });

    it('should handle lines that are just touching at a single point (horizontal)', () => {
        const l1 = line(0, 0, 3, 0);
        const l2 = line(3, 0, 5, 0);
        expect(isAxisAlignedSegmentOverlap(l1, l2)).toBe(true);

        const h1 = line(3, 0, 5, 0);
        const h2 = line(0, 0, 3, 0);
        expect(isAxisAlignedSegmentOverlap(h1, h2)).toBe(true);
    });

    // Teardown is not necessary for these tests as there are no external resources to clean up.
});

describe('doAxisAlignedSegmentsIntersect', () => {
    let verticalLine: Line;
    let horizontalLine: Line;

    beforeEach(() => {
        // Setup default lines for each test
        verticalLine = {start: {x: 5, y: 0}, end: {x: 5, y: 10}};
        horizontalLine = {start: {x: 0, y: 5}, end: {x: 10, y: 5}};
    });

    afterEach(() => {
        // Teardown if necessary
        verticalLine = null!;
        horizontalLine = null!;
    });

    it('should return true when lines intersect', () => {
        expect(
            doAxisAlignedSegmentsIntersect(verticalLine, horizontalLine),
        ).toBe(true);
    });

    it('should return false when lines do not intersect - vertical line above', () => {
        verticalLine.start.y = 15;
        verticalLine.end.y = 20;
        expect(
            doAxisAlignedSegmentsIntersect(verticalLine, horizontalLine),
        ).toBe(false);
    });

    it('should return false when lines do not intersect - vertical line below', () => {
        verticalLine.start.y = -5;
        verticalLine.end.y = 0;
        expect(
            doAxisAlignedSegmentsIntersect(verticalLine, horizontalLine),
        ).toBe(false);
    });

    it('should return false when lines do not intersect - horizontal line to the left', () => {
        horizontalLine.start.x = -10;
        horizontalLine.end.x = 0;
        expect(
            doAxisAlignedSegmentsIntersect(verticalLine, horizontalLine),
        ).toBe(false);
    });

    it('should return false when lines do not intersect - horizontal line to the right', () => {
        horizontalLine.start.x = 15;
        horizontalLine.end.x = 20;
        expect(
            doAxisAlignedSegmentsIntersect(verticalLine, horizontalLine),
        ).toBe(false);
    });

    it('should return true when vertical line starts exactly at horizontal line y-coordinate', () => {
        verticalLine.start.y = 5;
        verticalLine.end.y = 10;
        expect(
            doAxisAlignedSegmentsIntersect(verticalLine, horizontalLine),
        ).toBe(true);
    });

    it('should return true when vertical line ends exactly at horizontal line y-coordinate', () => {
        verticalLine.start.y = 0;
        verticalLine.end.y = 5;
        expect(
            doAxisAlignedSegmentsIntersect(verticalLine, horizontalLine),
        ).toBe(true);
    });

    it('should return true when horizontal line starts exactly at vertical line x-coordinate', () => {
        horizontalLine.start.x = 5;
        horizontalLine.end.x = 10;
        expect(
            doAxisAlignedSegmentsIntersect(verticalLine, horizontalLine),
        ).toBe(true);
    });

    it('should return true when horizontal line ends exactly at vertical line x-coordinate', () => {
        horizontalLine.start.x = 0;
        horizontalLine.end.x = 5;
        expect(
            doAxisAlignedSegmentsIntersect(verticalLine, horizontalLine),
        ).toBe(true);
    });

    it('should return false when both lines are outside each other in x and y dimensions', () => {
        verticalLine.start.x = 20;
        verticalLine.end.x = 30;
        horizontalLine.start.y = 20;
        horizontalLine.end.y = 30;
        expect(
            doAxisAlignedSegmentsIntersect(verticalLine, horizontalLine),
        ).toBe(false);
    });

    it('should handle lines with negative coordinates', () => {
        verticalLine.start = {x: -5, y: -10};
        verticalLine.end = {x: -5, y: 0};
        horizontalLine.start = {x: -10, y: -5};
        horizontalLine.end = {x: 0, y: -5};
        expect(
            doAxisAlignedSegmentsIntersect(verticalLine, horizontalLine),
        ).toBe(true);
    });

    it('should handle lines with zero length in one dimension', () => {
        verticalLine.start = {x: 5, y: 5};
        verticalLine.end = {x: 5, y: 5};
        expect(
            doAxisAlignedSegmentsIntersect(verticalLine, horizontalLine),
        ).toBe(true);
    });

    it('should handle lines with conner overlaps', () => {
        expect(
            doAxisAlignedSegmentsIntersect(
                {start: {x: 0, y: 0}, end: {x: 0, y: 2}},
                {start: {x: 0, y: 2}, end: {x: 2, y: 2}},
            ),
        ).toBe(true);
    });
});
