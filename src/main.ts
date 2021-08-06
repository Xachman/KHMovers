const { app, BrowserWindow } = require('electron')
const path = require('path')
import {KHMap} from './KHMap'
import {Storage} from './Storage'
const ipc = require('electron').ipcMain

let storage = new Storage(ipc)

let hi = "hi"

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('assets/index.html')
}


app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})



app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})