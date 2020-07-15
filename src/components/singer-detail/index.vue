<template>
  <transition name="slide">
    <music-list
      :songs="songs"
      :title="title"
      :bgImage="bgImage"
      @pullData="pullData"
      :refresh="refresh"
    ></music-list>
  </transition>
</template>

<script>
import { mapGetters } from "vuex";
import { getSingerSongs } from "api/singer";
import { createSong } from "common/js/song";
import MusicList from "components/music-list/index";
export default {
  data() {
    return {
      num: 0,
      songs: [],
      refresh: false
    };
  },
  computed: {
    ...mapGetters(["singer"]),
    title() {
      return this.singer.singer_name;
    },
    bgImage() {
      return this.singer.singer_pic;
    }
  },
  created() {
    // 当前页面刷新时，返回上一级界面
    if (!this.singer.singer_name) this.$router.back();
    this._getSingerSongs();
  },
  methods: {
    // 获取歌手歌曲
    _getSingerSongs() {
      if (this.num < 0) return null;
      // 设置页数，一页15个歌曲返回
      this.singer.num = this.num;
      getSingerSongs(this.singer).then(res => {
        if (res.code === 0) {
          // 获取不到数据时，上拉不再发生请求
          if (res.data.list.length === 0) {
            this.num = -99;
          }
          this.songs = this.songs.concat(this._normalizeSongs(res.data.list));
        }
      });
    },
    // 标准化歌曲数据
    _normalizeSongs(list) {
      let ret = [];
      list.forEach(item => {
        let { musicData } = item;
        ret.push(createSong(musicData));
      });
      return ret;
    },
    // 子组件上拉，获取更多歌曲事件
    pullData() {
      this.refresh = true;
      setTimeout(() => {
        this.refresh = false;
      }, 1000);
      this.num = this.num + 1;
      this._getSingerSongs();
    }
  },
  components: {
    MusicList
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';

.slide-enter-active, .slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter, .slide-leave-to {
  transform: translate3d(100%, 0, 0);
}
</style>