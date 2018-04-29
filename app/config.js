const fs = require('fs')
const path = require('path')
const electron = require('electron')
export const debug = require('debug')('music:share')
const events = require('events')

const app = electron.app

const isDev = process.env.NODE_ENV === 'development'

let config

if (isDev) {
  config = require('../build/config')
} else {
  config = {}
}

function ensurePath (path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path)
  }

  return path
}


const ipfsAppData = ensurePath(path.join(app.getPath('appData'), 'music-share'))

config.appData = ipfsAppData
config.ipfsPath = path.join(process.env.IPFS_PATH || (process.env.HOME || process.env.USERPROFILE), '.ipfs')
config.debug = debug
config.isDev = isDev
config.events = new events.EventEmitter()

export default config
