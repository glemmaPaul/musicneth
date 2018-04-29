import {ipcMain} from 'electron'

let state = {}

export function updateState(updates) {
  state = {
    ...state,
    ...updates
  }

  return state
}

