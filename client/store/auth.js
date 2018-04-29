import {ipcRenderer} from 'electron'


const state = {
  walletAddress: null,
  completed: null,
  loading: false
}

const mutations = {
  STORE_LOADING(state, loading) {
    state.loading = loading
  },

  STORE_AUTHENTICATION(state, { walletAddress }) {
    state.loading = false
    state.walletAddress = walletAddress
  }
}

const actions = {
  authenticate({ commit }, {username, password, name}) {
    commit('STORE_LOADING', true)
    ipcRenderer.send('authenticate', name, username, password)
  }
}

const store = {
  namespaced:true,
  state,
  mutations,
  actions,
}

export default store
