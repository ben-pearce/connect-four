/**
 * gameState.ts
 *
 * Responsible for drawing game to stage and handling
 * related input.
 */

import * as TWEEN from "@tweenjs/tween.js";
import * as PIXI from "pixi.js";
import "pixi-layers";

import { FourFace } from "../fourFace";
import { MenuState } from "./menuState";
import { State } from "./state";

export class GameState extends State {

    private slotGroup: pixi_display.Group;
    private activeGroup: pixi_display.Group;
    private boardSprite: PIXI.Sprite;
    private activeChip: PIXI.Sprite;
    private columnsLocked: boolean = false;
    private currentColumn: number;
    private currentHandPosition: number;
    private columns: PIXI.Graphics[] = [];
    private chips: PIXI.Sprite[][] = [];

    private playerOneHighlight: PIXI.Graphics;
    private playerTwoHighlight: PIXI.Graphics;
    private playerOneChip: PIXI.Sprite;
    private playerTwoChip: PIXI.Sprite;

    private gameOver: boolean = false;

    /**
     * GameState constructor. Creates 2D null array to
     * store chips which will be placed into the board.
     *
     * @param  {FourFace} app
     */
    constructor(app: FourFace) {
        super(app);

        for (let row: number = 0; row < FourFace.rows; row++) {
            this.chips.push([]);
            for (let column: number = 0; column < FourFace.cols; column++) {
                this.chips[row].push(null);
            }
        }
    }

    /**
     * Creates a new chip sprite with specified texture and adjusts
     * to the correct position and scaling. Also moves the sprite to
     * the active layer so it appears above the board.
     *
     * @param  {PIXI.Texture} chipTexture   Texture to use
     * @returns PIXI                        The generated sprite
     */
    public createNewChip(chipTexture: PIXI.Texture): PIXI.Sprite  {
        const activeChip: PIXI.Sprite = new PIXI.Sprite(chipTexture);
        activeChip.height = 60;
        activeChip.width = 60;
        activeChip.y = 30;
        activeChip.anchor.set(0.5, 0.5);
        activeChip.visible = true;
        activeChip.parentGroup = this.activeGroup;
        return activeChip;
    }

    /**
     * Animates the placing of the active chip and
     * drops to the row specified.
     *
     * @param  {number} row The row to drop chip to
     */
    public placeActiveChip(row: number) {
        this.columnsLocked = true;
        this.activeChip.parentGroup = this.slotGroup;
        this.activeChip.width = 50;
        this.activeChip.height = 50;
        const slotY: number = (1.025 * this.boardSprite.height) -
            (0.158333 * this.boardSprite.height * row);
        const chips: PIXI.Texture[] = [this.app.resources.chipBlue.texture,
            this.app.resources.chipRed.texture];

        new TWEEN.Tween(this.activeChip)
            .to({ y: slotY }, 1000)
            .easing(TWEEN.Easing.Bounce.Out)
            .onComplete(() => {
                if (!this.gameOver) {
                    this.columnsLocked = false;
                    this.activeChip = this.createNewChip(chips[(chips.indexOf(
                            this.activeChip.texture) + 1) % 2]);
                    this.moveActiveChip(this.currentColumn);
                    this.layer.addChild(this.activeChip);
                    this.switchCurrentPlayer();
                    this.app.chipLandedCallback();
                }
            })
            .start();

        this.chips[row][this.currentHandPosition] = this.activeChip;
    }

    /**
     * Draws and animates the end game text once a game is over,
     * then returns to the main menu after a delay.
     *
     * @param  {boolean=false} tie  Is match a tie?
     */
    public finish(tie: boolean = false) {
        this.gameOver = true;
        const finishMessage = (tie) ? "You tied!" :
            (this.playerOneHighlight.visible) ? this.app.playerOneName +
            " wins!" : this.app.playerTwoName + " wins!";
        const textStyle: PIXI.TextStyle = new PIXI.TextStyle({
            align: "center", fill: 0xFFFFFF, fontFamily: "Arial",
            fontSize: 50, fontWeight: "bold",
            stroke: 0x000000, strokeThickness: 10,
        });
        const winText: PIXI.Text = new PIXI.Text(finishMessage, textStyle);
        winText.scale.set(0.1);
        winText.anchor.set(0.5, 0.5);
        winText.position.set(250, 150);

        new TWEEN.Tween(winText.scale)
            .to({ x: 1, y: 1 }, 200)
            .easing(TWEEN.Easing.Elastic.Out)
            .onStart(() => {
                this.layer.addChild(winText);
            })
            .onComplete(() => {
                setTimeout(() => {
                    this.app.updateState(MenuState);
                }, 4000);
            })
            .delay(1000)
            .start();
    }

    /**
     * Moves the active chip to a column.
     *
     * @param  {number} column  The column to move to
     */
    public moveActiveChip(column: number) {
        this.currentHandPosition = column;
        const columnGraphic = this.columns[column];
        this.activeChip.visible = false;
        this.activeChip.width = 20;
        this.activeChip.height = 20;
        this.activeChip.visible = true;
        this.activeChip.x = columnGraphic.x + (columnGraphic.width / 2);

        new TWEEN.Tween(this.activeChip)
            .to({ width: 60, height: 60 }, 400)
            .easing(TWEEN.Easing.Quartic.Out)
            .start();
    }

    /**
     * Draws and displays invisible column over the board
     * sprite so each column can be treated as an interactive
     * button.
     */
    public createColumns() {
        for (let i: number = 0; i < 7; i++) {
            const column: PIXI.Graphics = new PIXI.Graphics();

            column.lineStyle(0, 0x000000, 1);
            column.beginFill(0x000000, 0);
            column.drawRect(0, 0, 63, this.boardSprite.height);
            column.endFill();

            column.interactive = true;
            column.buttonMode = true;
            column.parentGroup = this.activeGroup;
            column.defaultCursor = "pointer";
            column.y = this.boardSprite.y;

            const boardEdge = this.boardSprite.x - (this.boardSprite.width / 2);
            column.x = boardEdge + 10 + (63 * i);

            column.on("mouseover", () => {
                this.currentColumn = i;
                if (!this.columnsLocked) {
                    this.moveActiveChip(i);
                }
            });

            column.on("mouseup", () => {
                if (!this.columnsLocked) {
                    this.app.chipPlacedCallback(i);
                }
            });

            this.layer.addChild(column);
            this.columns.push(column);
        }
    }

    /**
     * Method hides the current players highlight and adjusts
     * chip alpha, then shows the new player highlight and adjusts
     * their chip alpha. Switching the current player display.
     */
    public switchCurrentPlayer() {
        [this.playerOneChip.alpha, this.playerOneHighlight.visible,
            this.playerTwoChip.alpha, this.playerTwoHighlight.visible] =
            (this.playerOneHighlight.visible) ? [0.5, false, 1, true] :
            [1, true, 0.5, false];
    }

    /**
     * Tweens all of the chips passed in winning positions
     * to fade-flash repeatedly.
     *
     * @param  {Array<[number, number]>} winningPositions Array of positions
     */
    public showWinningChips(winningPositions: Array<[number, number]>) {
        for (const position of winningPositions) {
            const [row, column] = position;
            const chip: PIXI.Sprite = this.chips[row][column];
            const fade = new TWEEN.Tween(chip)
                .to({ alpha: [0, 1] }, 1000)
                .easing(TWEEN.Easing.Linear.None)
                .repeat(Infinity)
                .start();
        }
    }

    /**
     * Bounce out the logo.
     *
     * @returns void
     */
    public show(): void {
        new TWEEN.Tween(this.app.logoSprite)
            .to({ y: -60 }, 1000)
            .easing(TWEEN.Easing.Back.InOut)
            .onComplete(() => {
                this.draw();
            })
            .start();
    }

    /**
     * Resets state and destroys all child sprites
     * and graphics as they will need to be redrawn for
     * the next game. Bounce in the logo.
     *
     * @returns void
     */
    public hide(): void {
        this.layer.visible = false;
        this.gameOver = false;
        this.columnsLocked = false;
        this.layer.removeChildren();
        this.app.resetCallback();
        new TWEEN.Tween(this.app.logoSprite)
            .to({ y: 60 }, 1000)
            .easing(TWEEN.Easing.Back.InOut)
            .start();
    }

    /**
     * Draws the board initially on first game or redraws
     * the board after being destroyed following the previous
     * game.
     *
     * @returns void
     */
    private draw(): void {
        this.slotGroup = new PIXI.display.Group(1, false);
        const boardGroup = new PIXI.display.Group(2, false);
        this.activeGroup = new PIXI.display.Group(3, false);
        this.layer.addChild(new PIXI.display.Layer(this.slotGroup),
            new PIXI.display.Layer(boardGroup),
            new PIXI.display.Layer(this.activeGroup));

        this.boardSprite = new PIXI.Sprite(this.app.resources.board.texture);
        this.boardSprite.parentGroup = boardGroup;

        this.boardSprite.anchor.x = 0.5;
        this.boardSprite.position.set(250, 50);
        this.boardSprite.scale.set(0.5, 0.5);

        this.activeChip = this.createNewChip(this.app.resources.chipBlue.texture);
        this.layer.addChild(this.boardSprite, this.activeChip);

        this.createColumns();
        this.moveActiveChip(0);

        const textStyle: PIXI.TextStyle = new PIXI.TextStyle({
            align: "center", fill: 0xFFFFFF, fontFamily: "Arial",
            fontSize: 50, fontWeight: "bold",
            stroke: 0x000000, strokeThickness: 5,
        });

        const playerOneNickname: PIXI.Text = new PIXI.Text(
                this.app.playerOneName, textStyle);
        const playerTwoNickname: PIXI.Text = new PIXI.Text(
                this.app.playerTwoName, new PIXI.TextStyle(textStyle));
        playerOneNickname.position.set(100, 460);
        playerTwoNickname.position.set(playerOneNickname.x, playerOneNickname.y
            + playerOneNickname.height + 10);

        const highlightText = (text: PIXI.Text): PIXI.Graphics => {
            const highlight: PIXI.Graphics = new PIXI.Graphics();
            highlight.lineStyle(0, 0, 1);
            highlight.beginFill(0x000000, 0.25);
            highlight.drawRoundedRect(text.x, text.y,
                    text.width, text.height, 10);
            highlight.endFill();
            return highlight;
        };

        this.playerOneHighlight = highlightText(playerOneNickname);
        this.playerTwoHighlight = highlightText(playerTwoNickname);
        this.playerTwoHighlight.visible = false;

        this.playerOneChip = new PIXI.Sprite(this.app.resources.chipBlue.texture);
        this.playerTwoChip = new PIXI.Sprite(this.app.resources.chipRed.texture);
        this.playerOneChip.scale.set(0.6, 0.6);
        this.playerOneChip.position.set(20, playerOneNickname.y);
        this.playerTwoChip.scale.set(0.6, 0.6);
        this.playerTwoChip.position.set(20, playerTwoNickname.y);
        this.playerTwoChip.alpha = 0.5;
        const back: pixi_display.Layer = this.drawButton(20, 610, 100, 50, "Quit");
        back.on("mouseup", () => {
            this.app.updateState(MenuState);
        });
        this.layer.addChild(this.playerOneHighlight, this.playerTwoHighlight,
            playerOneNickname, playerTwoNickname, this.playerOneChip,
            this.playerTwoChip, back);
        this.layer.visible = true;
    }
}
