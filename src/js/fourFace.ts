import * as TWEEN from "@tweenjs/tween.js";
import * as PIXI from "pixi.js";
// tslint:disable-next-line:ordered-imports
import "pixi-layers";

import { ipcRenderer } from "electron";

export class FourFace {

    public app: PIXI.Application;
    public loader: PIXI.loaders.Loader;
    public chipPlacedCallback: (column: number) => void;
    public chipLandedCallback: () => void;

    private boardSprite: PIXI.Sprite;
    private activeChip: PIXI.Sprite;
    private resources: PIXI.loaders.ResourceDictionary;
    private columns: PIXI.Graphics[] = [];
    private chips: PIXI.Sprite[][] = [];
    private currentHandPosition: number;
    private currentColumn: PIXI.Graphics;
    private columnsLocked: boolean = false;

    private boardGroup: pixi_display.Group;
    private activeGroup: pixi_display.Group;
    private slotGroup: pixi_display.Group;

    private rows: number = 6;
    private cols: number = 7;

    public constructor() {
        this.app = new PIXI.Application({
            height: 670, transparent: true,
            width: 500,
        });

        for (let row: number = 0; row < this.rows; row++) {
            this.chips.push([]);
            for (let column: number = 0; column < this.cols; column++) {
                this.chips[row].push(null);
            }
        }

        this.loader = new PIXI.loaders.Loader();
        this.app.stage = new PIXI.display.Stage();

        this.slotGroup = new PIXI.display.Group(0, false);
        this.boardGroup = new PIXI.display.Group(1, false);
        this.activeGroup = new PIXI.display.Group(2, false);

        this.app.stage.addChild(new PIXI.display.Layer(this.slotGroup));
        this.app.stage.addChild(new PIXI.display.Layer(this.boardGroup));
        this.app.stage.addChild(new PIXI.display.Layer(this.activeGroup));

        this.loader.add("board", "images/board.png")
            .add("chipBlue", "images/chip-blue.png")
            .add("chipRed", "images/chip-red.png")
            .load((loader: PIXI.loaders.Loader, resources: PIXI.loaders.ResourceDictionary) => {
                this.assetsLoaded(loader, resources);
            });

        requestAnimationFrame((time: number) => {
            this.animate(time);
        });
    }

    public animate(time: number) {
        requestAnimationFrame((frameTime: number) => {
            this.animate(frameTime);
        });
        TWEEN.update(time);
    }

    public assetsLoaded(loader: PIXI.loaders.Loader, resources: PIXI.loaders.ResourceDictionary) {
        this.resources = resources;

        this.boardSprite = new PIXI.Sprite(resources.board.texture);
        this.boardSprite.parentGroup = this.boardGroup;
        this.app.stage.addChild(this.boardSprite);

        this.boardSprite.anchor.x = 0.5;
        this.boardSprite.y = 50;
        this.boardSprite.x = this.app.renderer.width / 2;
        this.boardSprite.scale.set(0.5, 0.5);

        this.activeChip = this.createNewChip(resources.chipBlue.texture);
        this.app.stage.addChild(this.activeChip);

        this.createColumns();
        this.moveActiveChip(this.getColumn(0));
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

        const chips: PIXI.Texture[] = [this.resources.chipBlue.texture, this.resources.chipRed.texture];

        new TWEEN.Tween(this.activeChip)
            .to({ y: slotY }, 1000)
            .easing(TWEEN.Easing.Bounce.Out)
            .onComplete(() => {
                this.activeChip = this.createNewChip(chips[chipId]);
                this.moveActiveChip(this.currentColumn);
                this.app.stage.addChild(this.activeChip);
                this.columnsLocked = false;
                this.chipLandedCallback();
            })
            .start();

        this.chips[row][this.currentHandPosition] = this.activeChip;
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
                    this.chipPlacedCallback(i);
                }
            });

            this.app.stage.addChild(column);
            this.columns.push(column);
        }
    }

    public getColumn(column: number): PIXI.Graphics {
        return this.columns[column];
    }

    public showWinningChips(winningPositions: Array<[number, number]>) {
        for (const position of winningPositions) {
            const [row, column] = position;
            const chip: PIXI.Sprite = this.chips[row][column];
            new TWEEN.Tween(chip)
                .to({ alpha: 0.5 }, 500)
                .easing(TWEEN.Easing.Quartic.Out)
                .repeat(5)
                .start();
        }
    }
}
