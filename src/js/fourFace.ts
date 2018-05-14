import * as TWEEN from "@tweenjs/tween.js";
import * as PIXI from "pixi.js";
import "pixi-layers";

import { ipcRenderer } from "electron";
import { TextStyle } from "pixi.js";
import { FindFour } from "./findFour";

import { MenuState } from "./states/menuState";
import { State } from "./states/state";

export class FourFace {
    public static Multiplayer = 0;
    public static Computer = 1;

    public static Easy = 4;
    public static Medium = 6;
    public static Hard = 8;

    public static rows: number = 6;
    public static cols: number = 7;

    public app: PIXI.Application;
    public loader: PIXI.loaders.Loader;
    public chipPlacedCallback: (column: number) => void;
    public chipLandedCallback: () => void;
    public resetCallback: () => void;

    public gameMode: number = FourFace.Multiplayer;
    public difficulty: number = FourFace.Easy;

    public logoSprite: PIXI.Sprite;
    public resources: PIXI.loaders.ResourceDictionary;

    public playerOneName: string;
    public playerTwoName: string;

    private states: { [id: string]: State } = {};
    private currentState: State;

    public constructor() {
        this.app = new PIXI.Application({
            antialias: true, height: 670,
            transparent: true, width: 500,
        });

        this.loader = new PIXI.loaders.Loader();
        this.app.stage = new PIXI.display.Stage();

        requestAnimationFrame((time: number) => {
            this.animate(time);
        });

        this.loader.add("logo", "images/logo.png")
            .add("board", "images/board.png")
            .add("chipBlue", "images/chip-blue.png")
            .add("chipRed", "images/chip-red.png")
            .load((loader: PIXI.loaders.Loader, resources: PIXI.loaders.ResourceDictionary) => {
                this.assetsLoaded(loader, resources);
            });
    }

    public animate(time: number) {
        requestAnimationFrame((frameTime: number) => {
            this.animate(frameTime);
        });
        TWEEN.update(time);
    }

    public updateState(state: new(app: FourFace) => State) {
        if (this.currentState !== undefined) {
            this.currentState.hide();
        }
        this.states[state.name] = (state.name in this.states)
            ? this.states[state.name] : new state(this);
        this.currentState = this.states[state.name];
        this.currentState.show();
    }

    public getState(state: new(app: FourFace) => State): any {
        return this.states[state.name];
    }

    public assetsLoaded(loader: PIXI.loaders.Loader, resources: PIXI.loaders.ResourceDictionary) {
        this.resources = resources;

        this.logoSprite = new PIXI.Sprite(resources.logo.texture);
        this.logoSprite.position.set(this.app.renderer.width / 2, this.app.renderer.height / 2);
        this.logoSprite.anchor.set(0.5, 0.5);
        this.logoSprite.scale.set(0.1);

        this.updateState(MenuState);

        const menuState: MenuState = this.getState(MenuState);

        [menuState.multiplayer.alpha, menuState.computer.alpha] = [0, 0];

        this.app.stage.addChild(this.logoSprite);

        const scale = new TWEEN.Tween(this.logoSprite.scale)
            .to({ x: 0.8, y: 0.8 }, 500)
            .easing(TWEEN.Easing.Elastic.Out);
        const move = new TWEEN.Tween(this.logoSprite)
            .to({ y: 60 }, 1000).easing(TWEEN.Easing.Quadratic.InOut);
        const showMultiplayer = new TWEEN.Tween(menuState.multiplayer)
            .to({ alpha: 1 }, 100).easing(TWEEN.Easing.Linear.None)
            .delay(600);
        const showComputer = new TWEEN.Tween(menuState.computer)
            .to({ alpha: 1 }, 100).easing(TWEEN.Easing.Linear.None)
            .delay(200);
        scale.chain(move, showComputer, showMultiplayer).start();
    }
}
