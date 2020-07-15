import {
  getSearchHistory,
  getPlay,
  getFavorite
} from 'common/js/cache'
const state = {
  singer: {}, // 歌手
  playing: false, // 播放状态
  fullScreen: false, // 全屏
  playList: [], // 播放列表
  sequenceList: [], // 顺序列表
  mode: 0, // 播放模式 顺序播放0 循环单曲1 随机播放2 
  currentIndex: -1, // 播放索引
  disc: {}, // 歌单数据
  topList: {}, // 排行榜数据
  searchHistory: getSearchHistory(), // 搜索历史
  playHistory: getPlay(), // 播放历史
  favoriteList: getFavorite() // 喜欢收藏
}
export default state