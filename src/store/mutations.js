import * as types from './mutation-type'
const mutations = {
  [types.SET_SINGER](state, singer) {
    state.singer = singer
  },
  [types.SET_PlAYING](state, flag) {
    state.playing = flag
  },
  [types.SET_FULLSCREEN](state, flag) {
    state.fullScreen = flag
  },
  [types.SET_PLAYLIST](state, list) {
    state.playList = list
  },
  [types.SET_SEQUENCELIST](state, list) {
    state.sequenceList = list
  },
  [types.SET_MODE](state, mode) {
    state.mode = mode
  },
  [types.SET_CURRENTINDEX](state, index) {
    state.currentIndex = index
  },
  [types.SET_DISC](state, disc) {
    state.disc = disc
  },
  [types.SET_TOPLIST](state, list) {
    state.topList = list
  },
  [types.SET_SEARCHHISTORY](state, list) {
    state.searchHistory = list
  },
  [types.SET_PLAYHISTORY](state, list) {
    state.playHistory = list
  },
  [types.SET_FAVORITELIST](state, list) {
    state.favoriteList = list
  },
}

export default mutations