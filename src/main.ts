const { app, BrowserWindow, Menu, dialog } = require('electron')
const path = require('path')
import {KHMap} from './KHMap'
import {Storage} from './Storage'



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

  let storage = new Storage(win.webContents.send)

  let menu = Menu.buildFromTemplate([
      {
          label: 'File',
          submenu: [
            {
              label:'Select Sheet',
              click() {
                dialog.showOpenDialog({ properties: ['openFile']}).then( file => {
                  if(!file.canceled) {
                    storage.setSheetPath(file.filePaths[0])
                  }
                })
              }
            }
          ]
      }
  ])
  Menu.setApplicationMenu(menu); 

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