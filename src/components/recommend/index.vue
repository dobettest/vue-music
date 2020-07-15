<template>
  <div class="recommend"
       ref="recommend">
    <div class="recommend-content"
         ref="recommendContent">
      <div>
        <div class="slider-wrapper"
             v-if="banners.length">
          <slider>
            <div v-for="item in banners"
                 :key="item.id">
              <a :href="item.linkUrl">
                <img :src="item.picUrl" />
              </a>
            </div>
          </slider>
        </div>
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li v-for="item in songList"
                class="item"
                :key="item.id"
                @click="selectItem(item)">
              <div class="icon">
                <img width="60"
                     height="60"
                     v-lazy="item.imgurl" />
              </div>
              <div class="text">
                <h2 class="name"
                    v-html="item.dissname"></h2>
                <div class="desc">
                  <span v-html="item.creator.name"></span>
                  <span>{{toListenNum(item.listennum)}}</span>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="loading-container"
           v-show="!songList.length">
        <loading></loading>
      </div>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
import { getBanner, getSongList } from "api/recommend";
import { playlistMixin } from "common/js/mixin";
import Slider from "base/slider/index";
import BScroll from "@better-scroll/core";
import ScrollBar from "@better-scroll/scroll-bar";
import Loading from "base/loading/index";
import { mapMutations } from "vuex";
BScroll.use(ScrollBar);

export default {
  mixins: [playlistMixin],
  data () {
    return {
      banners: [],
      songList: [],
      bscroll: null
    };
  },
  created () {
    // 轮播图
    this._getBanner();
    // 歌单列表
    this._getSongList();
  },
  mounted () {
    // 初始化滑动组件
    this._initBscroll();
  },
  methods: {
    _getBanner () {
      getBanner().then(res => {
        if (res.code === 0) {
          this.banners = res.data.slider;
        }
        if (this.songList.length > 0) {
          // 确保数据加载完成
          setTimeout(() => {
            this.bscroll.refresh();
          }, 100);
        }
      });
    },
    _getSongList () {
      getSongList().then(res => {
        if (res.code === 0) {
          this.songList = res.data.list;
        }
        // 确保数据加载完成
        setTimeout(() => {
          this.bscroll.refresh();
        }, 500);
      });
    },
    _initBscroll () {
      this.bscroll = new BScroll(this.$refs.recommendContent, {
        scrollY: true,
        probeType: 1,
        scrollbar: true,
        click: true
      });
    },
    toListenNum (num) {
      if (num < 10000) return num;
      num = (num / 10000).toFixed(2);
      return `${num}万`;
    },
    // mixin的实现方法
    handlePlayList (playList) {
      const bottom = playList.length > 0 ? "60px" : "";
      this.$refs.recommend.style.bottom = bottom;
      if (this.bscroll) this.bscroll.refresh();
    },
    // 点击歌单
    selectItem (item) {
      this.$router.push({
        path: `/recommend/${item.dissid}`
      });
      this.setDsic(item);
    },
    ...mapMutations({
      setDsic: "SET_DISC"
    })
  },
  beforeDestroy () {
    this.bscroll.destroy();
  },
  components: {
    Slider,
    Loading
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable'
.recommend
  position fixed
  width 100%
  top 88px
  bottom 0
  .recommend-content
    height 100%
    overflow hidden
    .slider-wrapper
      position relative
      width 100%
      overflow hidden
    .recommend-list
      .list-title
        height 65px
        line-height 65px
        text-align center
        font-size $font-size-medium
        color $color-theme
      .item
        display flex
        box-sizing border-box
        align-items center
        padding 0 20px 20px 20px
        .icon
          flex 0 0 60px
          width 60px
          padding-right 20px
        .text
          display flex
          flex-direction column
          justify-content center
          flex 1
          line-height 20px
          overflow hidden
          font-size $font-size-medium
          .name
            margin-bottom 10px
            color $color-text
          .desc
            display flex
            flex-direction row
            justify-content space-between
            color $color-text-d
    .loading-container
      position absolute
      width 100%
      top 50%
      transform translateY(-50%)
</style>