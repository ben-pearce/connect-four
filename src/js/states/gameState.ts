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
    private currentColumn: PIXI.Graphics;
    private currentHandPosition: number;
    private columns: PIXI.Graphics[] = [];

    constructor(app: FourFace) {
        super(app);
    }

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

    public placeActiveChip(row: number, chipId: number = 0) {
        this.columnsLocked = true;
        this.activeChip.parentGroup = this.slotGroup;
        this.activeChip.width = 50;
        this.activeChip.height = 50;
        const slotY: number = ((this.boardSprite.height / 6) * 1.4) +
            (((this.boardSprite.height / 6) * 0.95) * (5 - row));

        const chips: PIXI.Texture[] = [this.app.resources.chipBlue.texture, this.app.resources.chipRed.texture];

        new TWEEN.Tween(this.activeChip)
            .to({ y: slotY }, 1000)
            .easing(TWEEN.Easing.Bounce.Out)
            .onComplete(() => {
                this.activeChip = this.createNewChip(chips[chipId]);
                this.moveActiveChip(this.currentColumn);
                this.layer.addChild(this.activeChip);
                this.columnsLocked = false;
                this.app.chipLandedCallback();
            })
            .start();

        this.app.chips[row][this.currentHandPosition] = this.activeChip;
    }

    public moveActiveChip(column: PIXI.Graphics) {
        this.activeChip.visible = false;
        this.activeChip.width = 20;
        this.activeChip.height = 20;
        this.activeChip.visible = true;
        this.activeChip.x = column.x + (column.width / 2);

        new TWEEN.Tween(this.activeChip)
            .to({ width: 60, height: 60 }, 400)
            .easing(TWEEN.Easing.Quartic.Out)
            .start();
    }

    public createColumns(at: number = 60) {
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
                this.currentHandPosition = i;
                this.currentColumn = column;
                if (!this.columnsLocked) {
                    this.moveActiveChip(column);
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

    public getColumn(column: number): PIXI.Graphics {
        return this.columns[column];
    }

    public showWinningChips(winningPositions: Array<[number, number]>) {
        for (const position of winningPositions) {
            const [row, column] = position;
            const chip: PIXI.Sprite = this.app.chips[row][column];
            new TWEEN.Tween(chip)
                .to({ alpha: 0.5 }, 500)
                .easing(TWEEN.Easing.Quartic.Out)
                .repeat(5)
                .start();
        }
    }

    public show(): void {
        this.layer.removeChildren();
        this.slotGroup = new PIXI.display.Group(1, false);
        const boardGroup = new PIXI.display.Group(2, false);
        this.activeGroup = new PIXI.display.Group(3, false);
        this.layer.addChild(new PIXI.display.Layer(this.slotGroup),
            new PIXI.display.Layer(boardGroup),
            new PIXI.display.Layer(this.activeGroup));

        this.boardSprite = new PIXI.Sprite(this.app.resources.board.texture);
        this.boardSprite.parentGroup = boardGroup;

        this.boardSprite.anchor.x = 0.5;
        this.boardSprite.y = 50;
        this.boardSprite.x = 250;
        this.boardSprite.scale.set(0.5, 0.5);

        this.activeChip = this.createNewChip(this.app.resources.chipBlue.texture);
        this.layer.addChild(this.boardSprite, this.activeChip);

        this.createColumns();
        this.moveActiveChip(this.getColumn(0));

        const textStyle: PIXI.TextStyle = new PIXI.TextStyle({
            align: "center", fill: 0xFFFFFF, fontFamily: "Arial",
            fontSize: 50, fontWeight: "bold",
            stroke: 0x000000, strokeThickness: 5,
        });

        const playerOneNickname: PIXI.Text = new PIXI.Text(this.app.playerOneName, textStyle);
        const playerTwoNickname: PIXI.Text = new PIXI.Text(this.app.playerTwoName, new PIXI.TextStyle(textStyle));
        playerOneNickname.position.set(100, 460);
        playerTwoNickname.position.set(playerOneNickname.x, playerOneNickname.y + playerOneNickname.height + 10);

        const playerOneHighlight: PIXI.Graphics = new PIXI.Graphics();
        playerOneHighlight.lineStyle(0, 0, 1);
        playerOneHighlight.beginFill(0x000000, 0.25);
        playerOneHighlight.drawRoundedRect(playerOneNickname.x, playerOneNickname.y,
                playerOneNickname.width, playerOneNickname.height, 10);
        playerOneHighlight.endFill();

        const redChip: PIXI.Sprite = new PIXI.Sprite(this.app.resources.chipBlue.texture);
        const blueChip: PIXI.Sprite = new PIXI.Sprite(this.app.resources.chipRed.texture);
        redChip.scale.set(0.6, 0.6);
        redChip.position.set(20, playerOneNickname.y);
        blueChip.scale.set(0.6, 0.6);
        blueChip.position.set(20, playerTwoNickname.y);
        const back: pixi_display.Layer = this.drawButton(20, 610, 100, 50, "Quit");
        back.on("mouseup", () => {
            this.app.updateState(MenuState);
            new TWEEN.Tween(this.app.logoSprite)
                .to({ y: ((this.app.logoSprite.y === 60) ? -60 : 60) }, 1000)
                .easing(TWEEN.Easing.Back.InOut)
                .start();
        });
        this.layer.addChild(playerOneHighlight, playerOneNickname, playerTwoNickname,
            redChip, blueChip, back);
        this.layer.visible = true;
    }

    public hide(): void {
        this.layer.visible = false;
    }
}
