/**
 * board.ts
 *
 * Class representing a connect 4 board.
 */

export class Board {
    public rows: number;
    public columns: number;
    public player: number;
    public last: number;

    private board: number[][];

    /**
     * Board class constructor.
     *
     * @param  {number=6} rows      The number of rows
     * @param  {number=7} columns   The number of columns
     * @param  {number=1} player    Starting player
     * @param  {number[][]} board?  2D array to initialise board with (optional)
     */
    public constructor(rows: number = 6, columns: number = 7, player: number = 1,
                       board?: number[][]) {
        this.rows = rows, this.columns = columns;
        this.player = player;

        this.board = (board == null) ? this.create() : board;
    }

    /**
     * Places a chip into the board. Returns
     * false if column is full or does not exist.
     *
     * @param  {number} column  The column to place the chip into
     * @returns boolean         Was chip placement successful.
     */
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
    /**
     * Gets a slot state from specified row and column.
     *
     * @param  {number} row
     * @param  {number} column
     * @returns number  The slot state
     */
    public get(row: number, column: number): number {
        if (row >= 0 && row < this.rows && column >= 0 && column < this.columns) {
            return this.board[row][column];
        }
        return 0;
    }

    /**
     * Returns true if row and column are within range
     * of board parameters (row, column).
     *
     * @param  {number} row     The row to check
     * @param  {number} column  The column to check
     * @returns boolean         Is position valid?
     */
    public valid(row: number, column: number): boolean {
        return row >= 0 && row < this.rows && column >= 0
            && column < this.columns;
    }

    /**
     * Factory method for copying a board instance without
     * reference to the previous one.
     *
     * @returns Board   The new board instance.
     */
    public copy(): Board {
        const newBoard: number[][] = new Array(this.board.length);
        for (let i: number = 0; i < this.board.length; i++) {
            newBoard[i] = this.board[i].slice(0);
        }
        return new Board(this.rows, this.columns, this.player, newBoard);
    }

    /**
     * Returns true if board is full.
     *
     * @returns boolean Is board full?
     */
    public full(): boolean {
        for (const column of this.board[this.rows - 1]) {
            if (column === 0) {
                return false;
            }
        }

        return true;
    }

    /**
     * Creates and empty 2D array of 0's
     * (row x column)
     *
     * @returns number  The 2D array
     */
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
