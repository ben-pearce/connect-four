/**
 * fourFace.ts
 *
 * The main class for managing the WebGL UI.
 */

import * as TWEEN from "@tweenjs/tween.js";
import * as PIXI from "pixi.js";
import "pixi-layers";

import { TextStyle } from "pixi.js";
import { FindFour } from "./findFour";

import { MenuState } from "./states/menuState";
import { State } from "./states/state";

export class FourFace {
    /**
     * Game modes
     */
    public static Multiplayer = 0;
    public static Computer = 1;

    /**
     * Computer AI difficulty levels.
     */
    public static Easy = 4;
    public static Medium = 6;
    public static Hard = 8;

    public static rows: number = 6;
    public static cols: number = 7;

    public app: PIXI.Application;
    public loader: PIXI.loaders.Loader;

    /**
     * Callback that can be assigned is invoked when column
     * is selected.
     */
    public chipPlacedCallback: (column: number) => void;

    /**
     * Callback that can be assigned is invoked when chip
     * has finished landing and UI has created a new chip.
     */
    public chipLandedCallback: () => void;

    /**
     * Callback that can be assigned is invoked when quit
     * button is pressed on the game state.
     */
    public resetCallback: () => void;

    public gameMode: number = FourFace.Multiplayer;
    public difficulty: number = FourFace.Easy;

    public logoSprite: PIXI.Sprite;
    public resources: PIXI.loaders.ResourceDictionary;

    public playerOneName: string;
    public playerTwoName: string;

    private states: { [id: string]: State } = {};
    private currentState: State;

    /**
     * FourFace class constructor.
     *
     * Creates new PIXI Application instance and loads
     * assets into the stage. Starts the tween.js event
     * loop.
     */
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

    /**
     * tween.js event loop
     */
    public animate(time: number) {
        requestAnimationFrame((frameTime: number) => {
            this.animate(frameTime);
        });
        TWEEN.update(time);
    }

    /**
     * Creates a new state based on class reference passed in. If
     * state already exists then just show the existing state. Always
     * hide the current state.
     *
     * @param  {new(app:FourFace} state The state to move to.
     */
    public updateState(state: new(app: FourFace) => State) {
        if (this.currentState !== undefined) {
            this.currentState.hide();
        }
        this.states[state.name] = (state.name in this.states)
            ? this.states[state.name] : new state(this);
        this.currentState = this.states[state.name];
        this.currentState.show();
    }

    /**
     * Returns an existing state based on class reference passed in.
     *
     * @param  {new(app:FourFace} state The state to retrieve
     * @returns any The retieved state.
     */
    public getState(state: new(app: FourFace) => State): any {
        return this.states[state.name];
    }

    /**
     * Callback for PIXI loader. Invoked once all resources have been
     * loaded. Animates fly-in logo and displays main menu.
     *
     * @param  {PIXI.loaders.Loader} loader
     * @param  {PIXI.loaders.ResourceDictionary} resources
     */
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
