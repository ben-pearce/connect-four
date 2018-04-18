import { ipcRenderer } from "electron";

import { Board } from "./board";

export class FindFour {
    public board: Board;
    public winningSlots: Array<[number, number]> = [];

    public checkDeltas: Array<[number, number]> = [[1, 0], [0, 1], [1, 1], [1, -1]];
    public deltaMultipliers: number[] = [1, -1];

    public constructor(rows: number, columns: number) {
        this.board = new Board(rows, columns);
    }

    public checkWinPosition(row: number, column: number): boolean {
        const searchValue = this.board.get(row, column);
        for (const deltaMove of this.checkDeltas) {
            let [ deltaRow, deltaColumn ] = deltaMove;
            let consecutiveItems: number = 1;
            for (const delta of this.deltaMultipliers) {
                deltaRow *= delta;
                deltaColumn *= delta;
                let nextRow: number = row + deltaRow;
                let nextColumn: number = column + deltaColumn;
                this.winningSlots = [];
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
                    nextRow += deltaRow;
                    nextColumn += deltaColumn;
                }
            }
        }
        this.winningSlots = [];
        return false;
    }
}
