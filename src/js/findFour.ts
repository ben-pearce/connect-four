/**
 * findFour.ts
 *
 * Class for holding details and acting upon a Connect-four
 * match board.
 */

import { Board } from "./board";

export class FindFour {
    private static CheckDeltas: Array<[number, number]> = [[1, 0], [0, 1],
        [1, 1], [1, -1]];
    private static DeltaMultipliers: number[] = [1, -1];

    public board: Board;
    public winningSlots: Array<[number, number]> = [];

    /**
     * FindFour class constructor. Creates a new board instance.
     *
     * @param  {number} rows    The number of rows
     * @param  {number} columns The number of columns
     */
    public constructor(rows: number, columns: number) {
        this.board = new Board(rows, columns);
    }

    /**
     * Checks if a game has been won. Keeps track of any chips
     * that contributed to a win.
     *
     * @param  {number} row     The check chip's row
     * @param  {number} column  The check chip's column
     * @returns boolean         Has match been won?
     */
    public checkWinPosition(row: number, column: number): boolean {
        const searchValue = this.board.get(row, column);
        // Move in all directions
        for (const deltaMove of FindFour.CheckDeltas) {
            let [ deltaRow, deltaColumn ] = deltaMove;
            let consecutiveItems: number = 1;
            // Move backwards and forwards
            for (const delta of FindFour.DeltaMultipliers) {
                deltaRow *= delta;
                deltaColumn *= delta;
                let nextRow: number = row + deltaRow;
                let nextColumn: number = column + deltaColumn;
                this.winningSlots = [];
                // Try to find streak
                while (this.board.valid(nextRow, nextColumn)) {
                    if (this.board.get(nextRow, nextColumn) === searchValue) {
                        consecutiveItems += 1;
                        this.winningSlots.push([nextRow, nextColumn]);
                    } else {
                        break;
                    }
                    if (consecutiveItems === 4) {
                        this.winningSlots.push([row, column]);
                        return true;
                    }
                    // Move in specified direction
                    nextRow += deltaRow;
                    nextColumn += deltaColumn;
                }
            }
        }
        this.winningSlots = [];
        return false;
    }
}
