import { ipcRenderer } from "electron";
import * as TWEEN from "@tweenjs/tween.js";
import * as PIXI from "pixi.js";
import "pixi-layers";

class FindFour {
    public board: number[][];
    public columns: number;
    public rows: number;

    public constructor() {

    }
}

class FourFace {

    public app: PIXI.Application;
    public loader: PIXI.loaders.Loader;

    private boardSprite: PIXI.Sprite;
    private activeChip: PIXI.Sprite;
    private resources: PIXI.loaders.ResourceDictionary;

    private boardGroup: pixi_display.Group;
    private activeGroup: pixi_display.Group;
    private slotGroup: pixi_display.Group;

    public constructor() {
        this.app = new PIXI.Application({
            height: 500, transparent: true,
            width: 500,
        });

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
            this.animate(time)
        });
    }

    private animate(time: number) {
        requestAnimationFrame((time: number) => {
            this.animate(time)
        });
        TWEEN.update(time)
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
    }

    public createNewChip(chipTexture: PIXI.Texture): PIXI.Sprite  {
        let activeChip: PIXI.Sprite = new PIXI.Sprite(chipTexture);
        activeChip.height = 60;
        activeChip.width = 60;
        activeChip.y = 30;
        activeChip.anchor.set(0.5, 0.5);
        activeChip.visible = false;
        activeChip.parentGroup = this.activeGroup;
        return activeChip;
    }

    public placeActiveChip() {
        this.activeChip.parentGroup = this.slotGroup;
        this.activeChip.width = 50;
        this.activeChip.height = 50;
        let slotY: number = ((this.boardSprite.height / 6) * 1.4) + (((this.boardSprite.height / 6) * 0.95) * 5);

        new TWEEN.Tween(this.activeChip)
            .to({ y: slotY }, 1000)
            .easing(TWEEN.Easing.Bounce.Out)
            .onComplete(() => {
                this.activeChip = this.createNewChip(this.resources.chipRed.texture);
                this.app.stage.addChild(this.activeChip);
            })
            .start();
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

            column.on("mouseover", () => { this.moveActiveChip(column) });
            column.on("mouseup", () => { this.placeActiveChip() });

            this.app.stage.addChild(column);
        }
    }
}

window.onload = () => {
    const fourFace: FourFace = new FourFace();
    document.body.appendChild(fourFace.app.view);
};