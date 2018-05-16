/**
 * index.ts
 *
 * Entry point for process application (Electron).
 */

import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import * as url from "url";

let win: BrowserWindow;

function createWindow() {
    win = new BrowserWindow({
        height: 700, icon: "icon.png",
        resizable: false,
        width: 500,
    });

    // Do not show menu bar on windows.
    win.setMenu(null);

    // Navigate to internal index page.
    win.loadURL(url.format({
        pathname: path.join(__dirname, "../dist/index.html"),
        protocol: "file:",
        slashes: true,
    }));

    win.on("closed", () => {
        win = null;
    });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (win === null) {
        createWindow();
    }
});
