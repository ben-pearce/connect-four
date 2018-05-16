/**
 * miniMax.ts
 *
 * Static methods for computing the next best move in
 * a connect four board.
 */

import { Board } from "./board";

export class MiniMax {

    /**
     * Generates the next best move in a connect four board.
     *
     * @param  {Board} board        The board to use as root node.
     * @param  {number=4} depth     Maximum depth
     * @param  {boolean=true} max
     * @returns number              The next best column to use.
     */
    public static nextMove(board: Board, depth: number = 4,
                           max: boolean = true): number[] {
        const score: number = MiniMax.getBoardScore(board);

        if (depth === 0 || Math.abs(score) === MiniMax.WinningScore ||
            board.full()) {
            return [null, score];
        }

        let bestColumn: number = null;
        let bestScore: number = (max) ? -MiniMax.BestScore : MiniMax.BestScore;

        // Move through possible next moves
        for (let column: number = 0; column < board.columns; column++) {
            const newBoard: Board = board.copy();

            if (newBoard.place(column)) {
                // Get next game state
                const [nextColumn, nextScore] = MiniMax.nextMove(newBoard,
                        depth - 1, !max);
                if (bestColumn === null || (max && nextScore > bestScore) ||
                    (!max && nextScore < bestScore)) {
                    bestColumn = column;
                    bestScore = nextScore;
                }
            }
        }

        return [bestColumn, bestScore];
    }

    /**
     * Generates a heuristic value for a connect four board.
     *
     * @param  {Board} board    The board to use
     * @returns number          The heuristic value
     */
    public static getBoardScore(board: Board): number {
        let points: number = 0;

        const deltaOffsets: Array<[number, number, number, number, number]> = [
            [0, 3, 6, -1,  0],  [0, 0, 3,  0, 1],
            [3, 3, 6, -1, -1],  [0, 3, 3, -1, 1]];

        for (const delta of deltaOffsets) {
            const [initialColumn, rowMin, columnMax, deltaX, deltaY] = delta;
            // Move through possible starting positions
            for (let row: number = board.rows - 1; row >= rowMin; row--) {
                for (let column: number = initialColumn; column <= columnMax;
                    column++) {
                    const score: number = MiniMax.scorePosition(board, row,
                            column, deltaX, deltaY);
                    if (Math.abs(score) === MiniMax.WinningScore) {
                        // We have a winning board
                        return score;
                    }
                    points += score;
                }
            }
        }

        return points;
    }

    /**
     * Substitute for minimax infinite score.
     */
    private static WinningScore: number = 100000;

    /**
     * Initial best score to use.
     */
    private static BestScore: number = 99999;

    /**
     * Takes initial board and slot position and moves four
     * slots in specified direction and totals up the points
     * for each player.
     *
     * @param  {Board} board    The board to use
     * @param  {number} row     The initial row
     * @param  {number} column  The initial column
     * @param  {number} deltaX  Move in delta X direction
     * @param  {number} deltaY  Move in delta Y direction
     * @returns number          The resulting value
     */
    private static scorePosition(board: Board, row: number, column: number,
                                 deltaX: number, deltaY: number): number {
        let humanPoints: number = 0;
        let computerPoints: number = 0;

        // Check for streak up to 4
        for (let i: number = 0; i < 4; i++) {
            if (board.get(row, column) === 1) {
                humanPoints++;
            } else if (board.get(row, column) === 2) {
                computerPoints++;
            }
            // Moving in direction specified
            row += deltaX;
            column += deltaY;
        }

        return (humanPoints === 4) ? -MiniMax.WinningScore :
            (computerPoints === 4) ? MiniMax.WinningScore : computerPoints;
    }
}
