import Vue from 'vue'
import Vuex from 'vuex'
import { ipcRenderer } from 'electron'


// modules
import auth from './auth'
import info from './info'

Vue.use(Vuex)

const state = {
  count: 0
}

const mutations = {

}

const actions = {
}

const modules = {
  auth,
  info
}


export function createIpcRendererListeners(store) {
  ipcRenderer.on('authenticated', (event, authInfo) => {
    store.commit('auth/STORE_AUTHENTICATION', authInfo)
  })

  ipcRenderer.on('app-info', (event, state) => {
    console.log("New state", state)
    store.commit('UPDATE_STATE', state)
  })
}


const store = new Vuex.Store({
  state,
  mutations,
  actions,
  modules,
  plugins: [createIpcRendererListeners]
})


export default store
