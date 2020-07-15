<template>
  <div class="search">
    <div class="search-box-wrapper">
      <search-box ref="searchBox" @query="queryChange"></search-box>
    </div>
    <div class="shortcut-wrapper" v-show="!query" ref="shortcutWrapper">
      <div class="shortcut" ref="shortcut">
        <div>
          <div class="hot-key">
            <h1 class="title">热门搜索</h1>
            <ul>
              <li class="item" v-for="item in hotKey" :key="item.id" @click="addQuery(item.k)">
                <span>{{item.k}}</span>
              </li>
            </ul>
          </div>
          <div class="search-history" v-show="searchHistory.length">
            <h1 class="title">
              <span class="text">搜索历史</span>
              <span class="clear" @click="clearAll">
                <i class="icon-clear"></i>
              </span>
            </h1>
            <search-list :searches="searchHistory" @select="addQuery" @delete="deleteOne"></search-list>
          </div>
        </div>
      </div>
    </div>
    <div class="search-result" v-show="query">
      <suggest :query="query" @selectItem="saveSearch"></suggest>
    </div>
    <confirm ref="confirm" text="删除所有历史" @confirm="confirm"></confirm>
    <router-view></router-view>
  </div>
</template>

<script>
import SearchBox from "base/search-box/index";
import Suggest from "components/suggest/index";
import SearchList from "base/search-list/index";
import Confirm from "base/confirm/index";
import BScroll from "@better-scroll/core";
import ScrollBar from "@better-scroll/scroll-bar";
import { getHotSearch } from "api/search";
import { mapActions } from "vuex";
import { playlistMixin,searchMixin} from "common/js/mixin";
BScroll.use(ScrollBar);
export default {
  mixins: [playlistMixin,searchMixin],
  created() {
    this._getHotSearch();
  },
  mounted() {
    // 初始化滑动组件
    setTimeout(() => {
      this._initBscroll();
    }, 20);
  },
  data() {
    return {
      hotKey: [],
      bscroll: null
    };
  },
  methods: {
    // 初始化滚动
    _initBscroll() {
      this.bscroll = new BScroll(this.$refs.shortcut, {
        scrollY: true,
        probeType: 1,
        scrollbar: true,
        click: true
      });
    },
    // mixin 处理 滚动刷新
    handlePlayList(playlist) {
      const bottom = playlist.length > 0 ? "60px" : "";
      this.$refs.shortcutWrapper.style.bottom = bottom;
      if (this.$refs.bscroll) this.$refs.bscroll.refresh();
    },
    _getHotSearch() {
      getHotSearch().then(res => {
        // 截取十个数据
        if (res.code === 0) this.hotKey = res.data.hotkey.slice(0, 10);
      });
    },

    // 单曲删除
    deleteOne(item) {
      this.deleteSearchHistory(item);
    },
    // 对话框显示
    clearAll() {
      this.$refs.confirm.show();
    },
    // 确认删除
    confirm() {
      this.clearSearchHistory();
    },
    ...mapActions([
      "clearSearchHistory"
    ])
  },
  watch: {
    searchHistory() {
      if (this.hotKey.length) {
        setTimeout(() => {
          this.bscroll.refresh();
        }, 20);
      }
    },
    hotKey() {
      if (this.searchHistory.length) {
        setTimeout(() => {
         this.bscroll.refresh();
        }, 20);
      }
    },
    query(newQuery) {
      if (!newQuery) {
        setTimeout(() => {
          this.bscroll.refresh();
        }, 20);
      }
    }
  },
  components: {
    SearchBox,
    Suggest,
    SearchList,
    Confirm
  }
};
</script>

<style lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';
@import '~common/stylus/mixin';

.search {
  .search-box-wrapper {
    margin: 20px;
  }

  .shortcut-wrapper {
    position: fixed;
    top: 178px;
    bottom: 0;
    width: 100%;

    .shortcut {
      height: 100%;
      overflow: hidden;

      .hot-key {
        margin: 0 20px 20px 20px;

        .title {
          margin-bottom: 20px;
          font-size: $font-size-medium;
          color: $color-text-l;
        }

        .item {
          display: inline-block;
          padding: 5px 10px;
          margin: 0 20px 10px 0;
          border-radius: 6px;
          background: $color-highlight-background;
          font-size: $font-size-medium;
          color: $color-text-d;
        }
      }

      .search-history {
        position: relative;
        margin: 0 20px;

        .title {
          display: flex;
          align-items: center;
          height: 40px;
          font-size: $font-size-medium;
          color: $color-text-l;

          .text {
            flex: 1;
          }

          .clear {
            extend-click();

            .icon-clear {
              font-size: $font-size-medium;
              color: $color-text-d;
            }
          }
        }
      }
    }
  }

  .search-result {
    position: fixed;
    width: 100%;
    top: 178px;
    bottom: 0;
  }
}
</style>