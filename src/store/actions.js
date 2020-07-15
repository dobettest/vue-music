import *as types from './mutation-type'
import { shuffle } from 'common/js/util'
import { saveSearch,deleteSearch,clearSearch ,savePlay,saveFavorite,deleteFavorite} from 'common/js/cache'
function findIndex (list, song) {
  return list.findIndex((item) => {
    return item.id === song.id
  })
}

// 点击歌曲
export const selectPlay = function ({ commit, state }, { list, index }) {
  commit(types.SET_SEQUENCELIST, list)
  if (state.mode === 2) {
    let randomList = shuffle(list)
    commit(types.SET_PLAYLIST, randomList)
    index = findIndex(randomList, list[index])
  } else {
    commit(types.SET_PLAYLIST, list)
  }
  commit(types.SET_CURRENTINDEX, index)
  commit(types.SET_FULLSCREEN, true)
  commit(types.SET_PlAYING, true)
}

// 随机播放
export const randomPlay = function ({ commit }, { list }) {
  commit(types.SET_SEQUENCELIST, list)
  let randomList = shuffle(list)
  commit(types.SET_PLAYLIST, randomList)
  commit(types.SET_MODE, 2)
  commit(types.SET_CURRENTINDEX, 0)
  commit(types.SET_FULLSCREEN, true)
  commit(types.SET_PlAYING, true)
}

// 插入歌曲
export const insertSong = function({ commit , state }, song ) {

  // 使用副本
  let playList = state.playList.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex

  // 记录下当前歌曲
  let currentSong =  playList[currentIndex]
  // 查找插入的歌曲存不存在
  let fpIndex = findIndex(playList,song)
  // 因为是插入歌曲，所以索引 + 1
  currentIndex ++
  // 插入这首歌到当前的索引位置 
  playList.splice( currentIndex , 0 , song)
  if(fpIndex > -1){
    // 如果当前的插入的序号小于列表中的序号
    if(currentIndex > fpIndex) {
      playList.splice(fpIndex,1)
      currentIndex --   
    } else {
      playList.splice(fpIndex + 1, 1)
    }
  }

  let currentSIndex = findIndex(sequenceList,currentSong) + 1
  let fsIndex = findIndex(sequenceList,song)
  sequenceList.splice(currentSIndex,0,song)
  if(fsIndex > -1){
    if(currentSIndex > fsIndex){
      sequenceList.splice(fsIndex,1)
    }else{
      sequenceList.splice(fsIndex + 1,1)
    }
  }

  commit(types.SET_PLAYLIST,playList)
  commit(types.SET_SEQUENCELIST,sequenceList)
  commit(types.SET_CURRENTINDEX,currentIndex)
  commit(types.SET_FULLSCREEN, true)
  commit(types.SET_PlAYING, true)
}

// 保存歌曲历史
export const saveSearchHistory  = function({commit},query) {
  commit(types.SET_SEARCHHISTORY, saveSearch(query))
}

// 删除一首歌曲历史
export const deleteSearchHistory  = function({commit},query) {
  commit(types.SET_SEARCHHISTORY, deleteSearch(query))
}

// 删除所有歌曲历史
export const clearSearchHistory  = function({commit},query) {
  commit(types.SET_SEARCHHISTORY, clearSearch(query))
}

// 删除列表歌曲
export const deleteSong = function({ commit , state }, song){
  let playList = state.playList.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex

  let pIndex = findIndex(playList,song)
  playList.splice(pIndex,1)
  let sIndex = findIndex(sequenceList,song)
  sequenceList.splice(sIndex,1)
  if(currentIndex > pIndex || currentIndex === playList.length)
      currentIndex --
    commit(types.SET_PLAYLIST,playList)
    commit(types.SET_SEQUENCELIST,sequenceList)
    commit(types.SET_CURRENTINDEX,currentIndex)

    const playing = playList.length >0
    commit(types.SET_PlAYING,playing)
}

// 删除列表所有歌曲
export const clearAllSong = function({ commit }){
  commit(types.SET_PLAYLIST,[])
  commit(types.SET_SEQUENCELIST,[])
  commit(types.SET_CURRENTINDEX,-1)
  commit(types.SET_PlAYING,false)
}

// 保存播放历史
export const savePlayHistory = function ({ commit },song){
  commit(types.SET_PLAYHISTORY,savePlay(song))
}

// 收藏喜爱
export const saveFavoriteList = function ({ commit },song){
  commit(types.SET_FAVORITELIST,saveFavorite(song))
}

// 取消收藏喜爱
export const deleteFavoriteList = function ({ commit },song){
  commit(types.SET_FAVORITELIST,deleteFavorite(song))
}