<template>
  <transition name="slide">
    <music-list :title="title" :bgImage="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script>
import MusicList from "components/music-list/index";
import { getDiscSong } from "api/recommend";
import { mapGetters } from "vuex";
import { createSong } from "common/js/song";

export default {
  data() {
    return {
      songs: []
    };
  },
  computed: {
    title() {
      return this.disc.dissname;
    },
    bgImage() {
      return this.disc.imgurl;
    },
    ...mapGetters(["disc"])
  },
  created() {
    this._getDiscSong();
  },
  methods: {
    _getDiscSong() {
      if (!this.disc.dissid) {
        this.$router.push("/recommend");
        return
      }
      getDiscSong(this.disc.dissid).then(res => {
        if (res.code === 0) {
          this.songs = this._normalizeSongs(res.cdlist[0].songlist);
        }
      });
    },
    // 标准化歌曲数据
    _normalizeSongs(list) {
      let ret = [];
      list.forEach(item => {
        let musicData = {};
        musicData.songid = item.id;
        musicData.songmid = item.mid;
        musicData.singer = item.singer;
        musicData.songname = item.name;
        musicData.albumname = item.album.name;
        musicData.interval = item.interval;
        musicData.albummid = item.album.mid;
        ret.push(createSong(musicData));
      });
      return ret;
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