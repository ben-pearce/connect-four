/**
 * four.ts
 *
 * Entry point for renderer application.
 */

import { FindFour } from "./findFour";
import { FourFace } from "./fourFace";
import { MiniMax } from "./miniMax";
import { GameState } from "./states/gameState";

/**
 * Function invoked once window has fully loaded.
 */
window.onload = () => {
    let findFour: FindFour = new FindFour(6, 7);
    const fourFace: FourFace = new FourFace();

    fourFace.resetCallback = () => {
        findFour = new FindFour(findFour.board.rows, findFour.board.columns);
    };

    // Checks for a win in the find four game and updates the game state.
    const checkWin = (gameState: GameState, row: number, column: number) => {
        if (findFour.checkWinPosition(row, column)) {
            gameState.finish();
            gameState.showWinningChips(findFour.winningSlots);
        }

        if (findFour.board.full()) {
            gameState.finish(true);
        }
    };

    // Places a chip into the find four game and updates the game state.
    fourFace.chipPlacedCallback = (column: number) => {
        const gameState: GameState = fourFace.getState(GameState);
        findFour.board.place(column);
        const row = findFour.board.last;
        gameState.placeActiveChip(row);
        checkWin(gameState, row, column);
    };

    /**
     * Retrieves a computer move from the minimax algorithm and updates
     * the game state.
     */
    fourFace.chipLandedCallback = () => {
        // Check that we're in computer mode and that it's computer turn.
        if (findFour.board.player === 2 && fourFace.gameMode === FourFace.Computer) {
            const gameState: GameState = fourFace.getState(GameState);
            const [nextColumn, nextScore] = MiniMax.nextMove(findFour.board, fourFace.difficulty);
            gameState.moveActiveChip(nextColumn);
            findFour.board.place(nextColumn);
            const nextRow: number = findFour.board.last;
            gameState.placeActiveChip(nextRow);
            checkWin(gameState, nextRow, nextColumn);
        }
    };

    // Append the PIXI application to the DOM.
    document.body.appendChild(fourFace.app.view);
};
