import {ipcMain} from 'electron'


function basename (path) {
  const parts = path.split('/')
  parts.pop()
  return parts.join('/') || '/'
}

function sort (a, b) {
  if (a.type === 'directory' && b.type !== 'directory') {
    return -1
  } else if (b.type === 'directory' && a.type !== 'directory') {
    return 1
  }

  return a.name > b.name
}

function listAndSend (opts, root) {
  const {debug, ipfs, send} = opts

  ipfs().files.ls(root)
    .then(files => {
      Promise.all(files.map(file => {
        return ipfs().files.stat([root, file.name].join('/'))
          .then(stats => Object.assign({}, file, stats))
      }))
        .then(res => res.sort(sort))
        .then(res => send('files', {
          root: root,
          contents: res
        }))
        .catch(e => { debug(e.stack) })
    })
}

function list (opts) {
  return (event) => {
    event.sender.send('tracks', {
      tracks: loadedFiles
    })
  }
}

let adding = 0

async function add (files, root, client) {
  client.seed(files, function (torrent) {
    console.log('Client is seeding ' + torrent.magnetURI)
  })
}

function uploadFiles (opts) {
  let {webtorrent, debug, send} = opts

  const sendAdding = () => { send('adding', adding > 0) }
  const inc = () => { adding++; sendAdding() }
  const dec = () => { adding--; sendAdding() }

  const anyway = () => {
    dec()
    send('files-updated')
  }

  return (event, files, root = '/') => {
    debug('Uploading files', {files})
    inc()

    add(files, root, webtorrent)
      .then(anyway)
      .catch((e) => { anyway(); debug(e.stack) })
  }
}


export default function (opts) {
  ipcMain.on('request-files', list(opts))
  ipcMain.on('drop-files', uploadFiles(opts))
}
