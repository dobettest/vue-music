<template>
  <div class="singer" ref="singer">
    <ListView :data="singers" v-if="singers.length" @select="selectSinger" ref="list"></ListView>
    <router-view></router-view>
  </div>
</template>

<script>
import { getSingerList } from "api/singer";
import ListView from "base/listview/index";
import { playlistMixin } from "common/js/mixin";
import { mapMutations } from "vuex";
export default {
  mixins: [playlistMixin],
  data() {
    return {
      singers: []
    };
  },
  created() {
    // 获取歌手列表
    this._getSingerList();
  },
  methods: {
    _getSingerList() {
      const hot = -100;
      getSingerList(hot).then(res => {
        if (res.code === 0) {
          this.singers = res.singerList.data.singerlist;
        }
      });
    },
    // 处理子组件的派发事件
    selectSinger(singer) {
      this.$router.push({
        path: `/singer/${singer.singer_id}`
      });
      this.setSinger(singer);
    },
    // mixin 处理 滚动刷新
    handlePlayList(playlist) {
      const bottom = playlist.length > 0 ? "60px" : "";
      this.$refs.singer.style.bottom = bottom;
      if (this.$refs.list) this.$refs.list.refresh();
    },
    ...mapMutations({
      setSinger: "SET_SINGER"
    })
  },
  components: {
    ListView
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
.singer {
  position: fixed;
  top: 88px;
  bottom: 0;
  width: 100%;
}
</style>