<template>
  <transition name="slide">
    <div class="add-song" v-show="showFlag" @click.stop>
      <div class="header">
        <h1 class="title">添加歌曲到列表</h1>
        <div class="close" @click="hide">
          <i class="icon-close"></i>
        </div>
      </div>
      <div class="search-box-wrapper">
        <search-box ref="searchBox" placeholder="搜索歌曲" @query="queryChange"></search-box>
      </div>
      <div class="shortcut" v-show="!query">
        <switches :switches="switches" :currentIndex="currentIndex" @switch="changeSwitch"></switches>
        <div class="list-wrapper">
          <div class="list-scroll" ref="listScroll" v-if="currentIndex === 0">
            <div class="list-inner">
              <song-list :songs="playHistory" @select="selectSong"></song-list>
            </div>
          </div>
          <div class="list-scroll" ref="listScroll" v-if="currentIndex === 1">
            <div class="list-inner">
              <search-list
                @delete="deleteSearchHistory"
                @select="addQuery"
                :searches="searchHistory"
              ></search-list>
            </div>
          </div>
        </div>
      </div>
      <div class="search-result" v-show="query">
        <suggest :query="query" :showSinger="showSinger" @selectItem="selectItem"></suggest>
      </div>
      <top-tip ref="topTip">
        <div class="tip-title">
          <i class="icon-ok"></i>
          <span class="text">歌曲添加成功</span>
        </div>
      </top-tip>
    </div>
  </transition>
</template>

<script>
import SearchBox from "base/search-box/index";
import Suggest from "components/suggest/index";
import { searchMixin } from "common/js/mixin";
import Switches from "base/switches/index";
import SongList from "base/song-list/index";
import SearchList from "base/search-list/index";
import BScroll from "@better-scroll/core";
import ScrollBar from "@better-scroll/scroll-bar";
import { mapGetters, mapActions } from "vuex";
import Song from "common/js/song";
import TopTip from "base/top-tip/index";
BScroll.use(ScrollBar);
export default {
  mixins: [searchMixin],
  computed: {
    ...mapGetters(["playHistory"])
  },
  data() {
    return {
      showFlag: false,
      showSinger: false,
      currentIndex: 0,
      switches: [{ name: "最近播放" }, { name: "搜索历史" }],
      bscroll: null
    };
  },
  mounted() {
    this._initBscroll();
  },
  methods: {
    // 初始化滚动
    _initBscroll() {
      this.bscroll = new BScroll(this.$refs.listScroll, {
        scrollY: true,
        probeType: 1,
        scrollbar: true,
        click: true
      });
    },
    // 显示和隐藏
    show() {
      this.showFlag = true;
      setTimeout(() => {
        this.bscroll.refresh();
      }, 20);
    },
    hide() {
      this.showFlag = false;
    },
    // 保存选择历史
    selectItem() {
      this.saveSearch();
      this.showTip()
    },
    // 改变选择最近播放 搜索历史
    changeSwitch(index) {
      this.currentIndex = index;
    },
    // 选择歌曲到播放
    selectSong(song, index) {
      if (index !== 0) {
        this.insertSong(new Song(song));
        this.showTip()
      }
    },
    // 展示提示
    showTip() {
        this.$refs.topTip.show()
    },
    ...mapActions(["insertSong"])
  },
  components: {
    SearchBox,
    Suggest,
    Switches,
    SongList,
    SearchList,
    TopTip
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';
@import '~common/stylus/mixin';

.add-song {
  position: fixed;
  top: 0;
  bottom: 0;
  width: 100%;
  z-index: 200;
  background: $color-background;

  &.slide-enter-active, &.slide-leave-active {
    transition: all 0.3s;
  }

  &.slide-enter, &.slide-leave-to {
    transform: translate3d(100%, 0, 0);
  }

  .header {
    position: relative;
    height: 44px;
    text-align: center;

    .title {
      line-height: 44px;
      font-size: $font-size-large;
      color: $color-text;
    }

    .close {
      position: absolute;
      top: 0;
      right: 8px;

      .icon-close {
        display: block;
        padding: 12px;
        font-size: 20px;
        color: $color-theme;
      }
    }
  }

  .search-box-wrapper {
    margin: 20px;
  }

  .shortcut {
    .list-wrapper {
      position: absolute;
      top: 165px;
      bottom: 0;
      width: 100%;

      .list-scroll {
        height: 100%;
        overflow: hidden;

        .list-inner {
          padding: 20px 30px;
        }
      }
    }
  }

  .search-result {
    position: fixed;
    top: 124px;
    bottom: 0;
    width: 100%;
  }

  .tip-title {
    text-align: center;
    padding: 18px 0;
    font-size: 0;

    .icon-ok {
      font-size: $font-size-medium;
      color: $color-theme;
      margin-right: 4px;
    }

    .text {
      font-size: $font-size-medium;
      color: $color-text;
    }
  }
}
</style>