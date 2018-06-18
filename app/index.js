'use strict'
import fs from 'fs'
import { join } from 'path'
import electron from 'electron'
import DaemonFactory from 'ipfsd-ctl'
import setupHandlers from './handlers'
import handleKnownErrors from './errors'
import webtorrent from './torrent/client'
import config from './config'
import { startNode } from './p2p'

startNode()

// Local variables
var dialog = electron.dialog,
    ipcMain = electron.ipcMain,
    app = electron.app,
    BrowserWindow = electron.BrowserWindow;

let IPFS, mainWindow;
let state = 'stopped'


const debug = config.debug
const isDev = config.isDev

if (isDev) {
  debug("Attaching electron reload")
  require('electron-reload')(__dirname);
}

config.send = send
config.ipfs = () => IPFS
config.webtorrent = webtorrent


function onRequestState(st) {
  debug(st)
}

function updateState (st) {
  state = st
}

// Moves files from appData/file-history.json to MFS so
// v0.4.0 is backwards compatible with v0.3.0.
function moveFilesOver () {
  const path = join(config.appData, 'file-history.json')

  if (!fs.existsSync(path)) {
    return
  }

  let files

  try {
    files = JSON.parse(fs.readFileSync(path))
  } catch (e) {
    debug(e)
    return
  }

  Promise.all(files.map((file) => IPFS.files.cp([`/ipfs/${file.hash}`, `/${file.name}`])))
    .then(() => {
      fs.unlinkSync(path)
    })
    .catch((e) => {
      fs.unlinkSync(path)
      debug(e)
    })
}

function onStartDaemon (node) {
  debug('Starting daemon')
  updateState('starting')

  // Tries to remove the repo.lock file if it already exists.
  // This fixes a bug on Windows, where the daemon seems
  // not to be exiting correctly, hence the file is not
  // removed.
  const lockPath = join(config.ipfsPath, 'repo.lock')
  const apiPath = join(config.ipfsPath, 'api')

  if (fs.existsSync(lockPath)) {
    try {
      fs.unlinkSync(lockPath)
    } catch (e) {
      debug('Could not remove lock. Daemon might be running.')
    }
  }

  if (fs.existsSync(apiPath)) {
    try {
      fs.unlinkSync(apiPath)
    } catch (e) {
      debug('Could not remove API file. Daemon might be running.')
    }
  }

  const flags = []
  if (config.dhtClient) {
    flags.push('--routing=dhtclient')
  }

  node.start(flags, (err, api) => {
    if (err) {
      handleKnownErrors(err)
      return
    }

    IPFS = api
    debug('Daemon started')
    config.events.emit('node:started')

    if (node.subprocess) {
      // Stop the executation of the program if some error
      // occurs on the node.
      node.subprocess.on('error', (e) => {
        updateState('stopped')
        debug(e)
      })
    }

    // Move files from V0.3.0
    moveFilesOver()

    // menubar.tray.setImage(config.logo.ice)
    updateState('running')
  })
}

function onStopDaemon (node, done) {
  debug('Stopping daemon')
  updateState('stopping')

  config.events.emit('node:stopped')

  node.stop((err) => {
    if (err) {
      return debug(err.stack)
    }

    debug('Stopped daemon')
    // menubar.tray.setImage(config.logo.black)

    IPFS = null
    updateState('stopped')
    done()
  })

  mainWindow.close()
}

function onWillQuit (node, event) {
  debug('Shutting down application')

  mainWindow.close()

  if (IPFS == null) {
    return
  }

  event.preventDefault()
  onStopDaemon(node, () => {
    app.quit()
  })
}


function send (key, ...args) {
  mainWindow.webContents.send(key, ...args)
}

// Initalize a new IPFS node
function initialize (path, node) {
  debug('Initialzing new node')

  // Initialize the welcome window.
  const window = new BrowserWindow({
    title: 'Welcome to IPFS',
    icon: config.logo.ice,
    show: false,
    resizable: false,
    width: 850,
    height: 450
  })

  // Only show the window when the contents have finished loading.
  window.on('ready-to-show', () => {
    window.show()
    window.focus()
  })

  // send the default path as soon as the window is ready.
  window.webContents.on('did-finish-load', () => {
    window.webContents.send('setup-config-path', path)
  })

  // Close the application if the welcome dialog is canceled
  window.once('close', () => {
    if (!node.initialized) app.quit()
  })

  window.setMenu(null)
  window.loadURL(`file://${__dirname}/views/welcome.html`)

  let userPath = path

  ipcMain.on('setup-browse-path', () => {
    dialog.showOpenDialog(window, {
      title: 'Select a directory',
      defaultPath: path,
      properties: [
        'openDirectory',
        'createDirectory'
      ]
    }, (res) => {
      if (!res) return

      userPath = res[0]

      if (!userPath.match(/.ipfs\/?$/)) {
        userPath = join(userPath, '.ipfs')
      }

      window.webContents.send('setup-config-path', userPath)
    })
  })

  // Wait for the user to hit 'Install IPFS'
  ipcMain.on('initialize', (event, { keySize }) => {
    debug(`Initializing new node with key size: ${keySize} in ${userPath}.`)
    window.webContents.send('initializing')

    node.init({
      directory: userPath,
      keySize: keySize
    }, (err, res) => {
      if (err) {
        return send('initialization-error', String(err))
      }

      config.settingsStore.set('ipfsPath', userPath)

      send('initialization-complete')
      updateState('stopped')

      onStartDaemon(node)
      window.close()
    })
  })
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  const url = isDev ? `http://${config.devServer.host}:${config.devServer.port}` : `file://${__dirname}/../dist/index.html`
  mainWindow.loadURL(url)

  // Open the DevTools.
  if (isDev) {
    mainWindow.webContents.openDevTools()

    const installExtension = require('electron-devtools-installer')
    installExtension.default(installExtension.VUEJS_DEVTOOLS)
      .then(name => console.log(`Added Extension:  ${name}`))
      .catch(err => console.log('An error occurred: ', err))
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

