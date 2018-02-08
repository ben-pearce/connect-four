import { app, BrowserWindow } from "electron"
import * as path from  "path"
import * as url from "url"

var win:BrowserWindow

function createWindow () {
    win = new BrowserWindow({
        width: 500, height: 700,
        resizable: false
    })

    win.setMenu(null)

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    win.on('closed', () => {
        win = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
})