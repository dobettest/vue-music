<template>
  <div class="music-list">
    <div class="back"
         @click="back">
      <i class="icon-back"></i>
    </div>
    <h1 class="title"
        v-html="title"></h1>
    <div class="bg-image"
         :style="bgStyle"
         ref="bgImage">
      <div class="play-wrapper">
        <div class="play"
             v-show="songs.length>0"
             ref="playBtn"
             @click="random">
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <div class="filter"></div>
    </div>
    <div class="bg-layer"
         ref="layer"></div>
    <div class="list"
         ref="list">
      <div class="song-list-wrapper">
        <song-list :songs="songs"
                   @select="selectItem"
                   :rank="rank"></song-list>
      </div>
      <div class="loading-container"
           v-show="!songs.length || refresh">
        <loading></loading>
      </div>
    </div>
  </div>
</template>

<script>
import SongList from "base/song-list/index";
import BScroll from "@better-scroll/core";
import Loading from "base/loading/index";
import PullUp from "@better-scroll/pull-up";
import { playlistMixin } from "common/js/mixin";
import { mapActions } from "vuex";
BScroll.use(PullUp);
export default {
  mixins: [playlistMixin],
  data () {
    return {
      bscroll: null,
      minTranslateY: 0
    };
  },
  props: {
    bgImage: {
      type: String,
      default: ""
    },
    songs: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: ""
    },
    rank: {
      type: Boolean,
      default: false
    },
    refresh: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    bgStyle () {
      return `background-image:url(${this.bgImage})`;
    }
  },
  mounted () {
    this._initScroll();
  },
  methods: {
    _initScroll () {
      // 列表在图片下面
      this.$refs.list.style.top = `${this.$refs.bgImage.clientHeight}px`;
      // 确定推到最顶值
      this.minTranslateY = -this.$refs.bgImage.clientHeight + 40;
      // 初始化scroll组件 probeType实时监测
      this.bscroll = new BScroll(this.$refs.list, {
        scrollY: true,
        click: true,
        pullUpLoad: true,
        probeType: 3
      });
      // 监听滚动事件
      this.bscroll.on("scroll", this.onScroll);
      // 监听上拉事件
      this.bscroll.on("pullingUp", this.pullingUpHandler);
    },
    random () {
      this.randomPlay({
        list: this.songs
      });
    },
    back () {
      this.$router.back();
    },
    onScroll (pos) {
      // 让列表跟随scroll一起动
      this.$refs.layer.style.transform = `translate3d(0,${pos.y}px,0)`;
      let zIndex = 0;
      let scale = 1;
      let blur = 0;
      // 图片缩放、模糊比例
      const percent = Math.abs(pos.y / this.$refs.bgImage.clientHeight);
      if (pos.y > 0) {
        zIndex = 10;
        scale = 1 + percent;
      } else {
        blur = Math.min(10, percent * 7);
      }
      // scroll情况判定
      if (pos.y > this.minTranslateY) {
        this.$refs.bgImage.style.height = "0px";
        this.$refs.bgImage.style.paddingTop = "70%";
      } else {
        this.$refs.bgImage.style.height = "40px";
        this.$refs.bgImage.style.paddingTop = 0;
        zIndex = 10;
        blur = 5;
      }
      this.$refs.bgImage.style.zIndex = zIndex;
      this.$refs.bgImage.style.transform = `scale(${scale})`;
      this.$refs.bgImage.style.filter = `blur(${blur}px)`;
    },
    pullingUpHandler () {
      // 防止快速刷新 不是最佳方案
      if (!this.refresh) {
        this.$emit("pullData");
        this.bscroll.finishPullUp();
      }
    },
    // 子组件的派发事件
    selectItem (song, index) {
      this.selectPlay({
        list: this.songs,
        index: index
      });
    },
    // mixin 处理 滚动刷新
    handlePlayList (playlist) {
      const bottom = playlist.length > 0 ? "60px" : "";
      this.$refs.list.style.bottom = bottom;
      if (this.bscroll) this.bscroll.refresh();
    },
    ...mapActions(["selectPlay", "randomPlay"])
  },
  // 销毁scroll
  beforeDestroy () {
    if (this.bscroll) this.bscroll.destroy();
  },
  watch: {
    songs () {
      setTimeout(() => {
        this.bscroll.refresh();
      }, 20);
    }
  },
  components: {
    SongList,
    Loading
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable'
@import '~common/stylus/mixin'
.music-list
  position fixed
  z-index 100
  top 0
  left 0
  bottom 0
  right 0
  background $color-background
  .back
    position absolute
    top 0
    left 6px
    z-index 50
    .icon-back
      display block
      padding 10px
      font-size $font-size-large-x
      color $color-theme
  .title
    position absolute
    top 0
    left 10%
    z-index 40
    width 80%
    no-wrap()
    text-align center
    line-height 40px
    font-size $font-size-large
    color $color-text
  .bg-image
    position relative
    width 100%
    height 0
    padding-top 70%
    transform-origin top
    background-size cover
    .play-wrapper
      position absolute
      bottom 20px
      z-index 50
      width 100%
      .play
        box-sizing border-box
        width 135px
        padding 7px 0
        margin 0 auto
        text-align center
        border 1px solid $color-theme
        color $color-theme
        border-radius 100px
        font-size 0
        .icon-play
          display inline-block
          vertical-align middle
          margin-right 6px
          font-size $font-size-medium-x
        .text
          display inline-block
          vertical-align middle
          font-size $font-size-small
    .filter
      position absolute
      top 0
      left 0
      width 100%
      height 100%
      background rgba(7, 17, 27, 0.3)
  .bg-layer
    position relative
    height 100%
    background $color-background
  .list
    position fixed
    top 0
    bottom 0
    width 100%
    background $color-background
    .song-list-wrapper
      padding 20px 30px
    .loading-container
      position absolute
      width 100%
      top 50%
      transform translateY(-50%)
</style>