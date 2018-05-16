/**
 * multiplayerState.ts
 *
 * Responsible for drawing the multiplayer menu to
 * the stage and handling related input.
 */

import * as TWEEN from "@tweenjs/tween.js";
import * as PIXI from "pixi.js";
import "pixi-layers";

import { FourFace } from "../fourFace";
import { GameState } from "./gameState";
import { MenuState } from "./menuState";
import { State } from "./state";

export class MultiplayerState extends State {

    private play: pixi_display.Layer;

    /**
     * Draws multiplayer menu.
     *
     * @param  {FourFace} app
     */
    constructor(app: FourFace) {
        super(app);

        const textStyle: PIXI.TextStyle = new PIXI.TextStyle({
            align: "center", fill: 0xFFFFFF,
            fontFamily: "Arial", fontSize: 30,
            fontWeight: "bold",
        });
        const playerOneText: PIXI.Text = new PIXI.Text("Enter player 1 name: ",
            textStyle);
        playerOneText.position.set(50, 150);
        const playerTwoText: PIXI.Text = new PIXI.Text("Enter player 2 name: ",
            textStyle);
        playerTwoText.position.set(playerOneText.x, 300);
        this.play = this.drawButton(50, 470, 400, 100, "Play!");
        this.play.alpha = 0.2;
        this.play.interactive = false;
        const back: pixi_display.Layer = this.drawButton(50, 590, 400, 50,
            "Go back");
        this.layer.addChild(playerOneText, playerTwoText, this.play, back);

        back.on("mouseup", () => {
            this.app.updateState(MenuState);
        });

        this.play.on("mouseup", () => {
            this.app.updateState(GameState);
        });
    }

    /**
     * Creates the player one and two name input boxes and assigns
     * validation function for onkeyup event. Play button is disabled
     * and text input is red whenever display names do not match regular
     * expression. Allowed names are alphabetical with no whitespace.
     *
     * @returns void
     */
    public show(): void {
        this.layer.visible = true;
        this.app.gameMode = FourFace.Multiplayer;
        const playerOneInput = this.createTextBox(200, 50, 350);
        const playerTwoInput = this.createTextBox(350, 50, 350);
        const checkName = (e: any) => {
            [this.play.alpha, this.play.interactive] = [0.2, false];
            const check = /[^a-zA-Z]/;
            e.target.style.color = (check.test(e.target.value)) ? "#FF0000" :
                "#000000";
            if (playerOneInput.value && playerTwoInput.value) {
                [this.play.alpha, this.play.interactive] =
                    check.test(playerOneInput.value + playerTwoInput.value) ?
                        [0.2, false] : [1, true];
                [this.app.playerOneName, this.app.playerTwoName] =
                    [this.tidyDisplayName(playerOneInput.value),
                    this.tidyDisplayName(playerTwoInput.value)];
            }
        };
        [playerOneInput.maxLength, playerTwoInput.maxLength] = [20, 20];
        [playerOneInput.onkeyup, playerTwoInput.onkeyup] = [checkName, checkName];
    }

    /**
     * Destroys text boxes and disables play button.
     *
     * @returns void
     */
    public hide(): void {
        this.layer.visible = false;
        [this.play.alpha, this.play.interactive] = [0.2, false];
        this.destroyTextBox();
    }
}
