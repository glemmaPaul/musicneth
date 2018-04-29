import Vue from 'vue'
import {ipcRenderer} from 'electron'


const state = {
  address: null
}

const mutations = {
  UPDATE_STATE(state, newState) {
    Object.keys(newState).forEach((item) => {
      Vue.set(state, item, newState[item])
    })
  }
}

const actions = {
}

const store = {
  state,
  mutations,
  actions,
}


export default store
