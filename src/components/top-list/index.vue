<template>
  <transition name="slide">
    <music-list :title="title" :bgImage="bgImage" :songs="songs" :rank="true"></music-list>
  </transition>
</template>

<script>
import { mapGetters } from "vuex";
import MusicList from "components/music-list/index";
import { getMusicList } from "api/rank";
import { createSong } from "common/js/song";
export default {
  data() {
    return {
      songs: []
    };
  },
  computed: {
    title() {
      return this.topList.title;
    },
    bgImage() {
      if(this.songs.length){
        return this.songs[0].image
      }
      return ''
    },
    ...mapGetters(["topList"])
  },
  created() {
    this._getMusicList();
  },
  methods: {
    _getMusicList() {
      if (!this.topList.topId) {
        this.$router.push("/rank");
        return;
      }
      getMusicList(this.topList.topId).then(res => {
        if (res.code === 0) {
          this.songs = this._normalize(res.songlist);
        }
      });
    },
    _normalize(list) {
      let ret = [];
      list.forEach(item => {
        if (item.data.albummid && item.data.songid)
          ret.push(createSong(item.data));
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
.slide-enter-active, .slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter, .slide-leave-to {
  transform: translate3d(100%, 0, 0);
}
</style>