
let loadedTracks;

const fileKey = 'musicNeth:files'


function retrieveCachedTracks() {
  let filesJSON = JSON.parse(localStorage.getItem(fileKey) || '[]')

  return filesJSON
}

function cacheTracks(tracks) {
  localStorage.setItem(fileKey, JSON.stringify(tracks))
}

export function list() {
  if (loadedTracks == undefined) {
    loadedTracks = retrieveCachedTracks()
  }

  return loadedTracks
}


export function add() {

}
