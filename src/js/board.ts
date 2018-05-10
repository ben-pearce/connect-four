import { ipcRenderer } from "electron";

export class Board {
    public rows: number;
    public columns: number;
    public player: number;
    public last: number;

    private board: number[][];

    public constructor(rows: number = 6, columns: number = 7, player: number = 1, board?: number[][]) {
        this.rows = rows, this.columns = columns;
        this.player = player;

        this.board = (board == null) ? this.create() : board;
    }

    public place(column: number): boolean {
        for (let row: number = 0; row <= (this.rows - 1); row++) {
            if (this.board[row][column] === 0) {
                this.board[row][column] = this.player;
                this.player = (this.player === 1) ? 2 : 1;
                this.last = row;
                return true;
            }
        }
        return false;
    }

    public print() {
        ipcRenderer.send("log", this.board);
    }

    public get(row: number, column: number): number {
        if (row >= 0 && row < this.rows && column >= 0 && column < this.columns) {
            return this.board[row][column];
        }
        return 0;
    }

    public valid(row: number, column: number): boolean {
        return row >= 0 && row < this.rows && column >= 0 && column < this.columns;
    }

    public copy(): Board {
        const newBoard: number[][] = new Array(this.board.length);
        for (let i: number = 0; i < this.board.length; i++) {
            newBoard[i] = this.board[i].slice(0);
        }
        return new Board(this.rows, this.columns, this.player, newBoard);
    }

    public full(): boolean {
        for (const column of this.board[this.rows - 1]) {
            if (column === 0) {
                return false;
            }
        }

        return true;
    }

    private create(): number[][] {
        const board: number[][] = [];

        for (let row: number = 0; row < (this.rows); row++) {
            board.push([]);
            for (let column: number = 0; column < (this.columns); column++) {
                board[row].push(0);
            }
        }
        return board;
    }
}
