/**
 * state.ts
 *
 * Abstract parent class for all states.
 */

import { FourFace } from "../fourFace";

import * as TWEEN from "@tweenjs/tween.js";
import * as PIXI from "pixi.js";
import "pixi-layers";

export abstract class State {

    protected app: FourFace;
    protected stage: PIXI.Container;
    protected layer: pixi_display.Layer;

    /**
     * State super constructor, creates a new PIXI layer for
     * all state children to be appended to. This allows for easy
     * movement between states.
     *
     * @param  {FourFace} app   Main UI instance
     */
    constructor(app: FourFace) {
        this.app = app;
        this.stage = app.app.stage;
        this.layer = new PIXI.display.Layer();
        this.layer.visible = false;
        this.stage.addChild(this.layer);
    }

    /**
     * Abstract function to be overriden by child.
     *
     * Invoked when state comes into view.
     */
    public abstract show(): void;

    /**
     * Abstract function to be overriden by child.
     *
     * Invoked when state goes out of view.
     */
    public abstract hide(): void;

    /**
     * Draws a button with specificed parameters onto a new
     * layer and returns to the caller.
     *
     * @param  {number} x       The x position of the button
     * @param  {number} y       The y position of the button
     * @param  {number} width   The width of the button
     * @param  {number} height  The height of the button
     * @param  {string} text    The text to be placed on the button
     * @returns pixi_display    The layer containing the new button
     */
    protected drawButton(x: number, y: number, width: number, height: number,
                         text: string): pixi_display.Layer {
        const group: pixi_display.Group = new PIXI.display.Group(0, false);
        const layer: pixi_display.Layer = new PIXI.display.Layer(group);

        const button: PIXI.Graphics = new PIXI.Graphics();
        button.lineStyle(2, 0x1F7BDB, 1);
        button.beginFill(0x004FA3);
        button.drawRoundedRect(x, y, width, height, 15);
        button.endFill();
        button.parentGroup = group;

        const hover: PIXI.Graphics = new PIXI.Graphics();
        hover.lineStyle(0, 0, 1);
        hover.beginFill(0x014791);
        hover.drawRoundedRect(x + 1, y + 1, width - 2, height - 2, 15);
        hover.endFill();
        hover.visible = false;
        hover.parentGroup = group;

        const textStyle: PIXI.TextStyle = new PIXI.TextStyle({
            align: "center", fill: 0x1F7BDB,
            fontFamily: "Arial", fontSize: (height >= 100) ? 50 : 20,
            fontWeight: "bold",
        });

        const buttonText: PIXI.Text = new PIXI.Text(text, textStyle);
        buttonText.anchor.set(0.5, 0.5);
        buttonText.x = x + (button.width / 2);
        buttonText.y = y + (button.height / 2);
        buttonText.parentGroup = group;
        layer.addChild(button, hover, buttonText);

        layer.on("mouseover", () => {
            if (button.visible) {
                hover.visible = true;
                buttonText.style.fill = 0x0559B3;
            }
        });

        const reset = () => {
            hover.visible = false;
            buttonText.style.fill = 0x1F7BDB;
        };
        layer.on("mouseout", reset);
        layer.on("mouseup", reset);

        layer.buttonMode = true;
        layer.interactive = true;
        return layer;
    }

    /**
     * Cleans up player name from user input.
     *
     * e.g. "joHn" => "John"
     * @param  {string} name    The name to be cleaned.
     */
    protected tidyDisplayName(name: string) {
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }

    /**
     * Hacky workaround for missing text input from PIXI. Creates a
     * HTML input element with absolute positioning and places it
     * in specified location above the stage. Then returns the HTMLInputElement
     * so it can be used similarly to PIXI graphics.
     *
     * @param  {number} x       The input x position
     * @param  {number} y       The input y position
     * @param  {number} width   The width of the text box
     * @returns HTMLInputElement
     */
    protected createTextBox(x: number, y: number, width: number):
        HTMLInputElement {
        const input = document.createElement("input");
        input.type = "text";
        input.style.zIndex = "99";
        input.style.position = "absolute";
        input.style.top = x.toString() + "px";
        input.style.left = y.toString() + "px";
        input.style.width = width.toString() + "px";
        input.style.fontSize = "30px";
        document.body.appendChild(input);
        return input;
    }

    /**
     * Destroys all input elements on the DOM.
     */
    protected destroyTextBox() {
        const elements: NodeListOf<HTMLInputElement> =
            document.getElementsByTagName("input");
        for (let index = elements.length - 1; index >= 0; index--) {
            elements[index].parentNode.removeChild(elements[index]);
        }
    }
}
