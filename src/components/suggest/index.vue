<template>
  <div class="suggest" ref="suggest">
    <ul class="suggest-list">
      <li class="suggest-item" v-for="item in result" :key="item.id" @click="selectItem(item)">
        <div class="icon">
          <i :class="getIcon(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getName(item)"></p>
        </div>
      </li>
      <loading v-show="hasMore" title></loading>
    </ul>
    <div class="no-result-wrapper" v-show="!hasMore && !result.length">
      <no-result title="抱歉，暂无搜索结果"></no-result>
    </div>
  </div>
</template>

<script>
import Loading from "base/loading/index";
import { getSearch } from "api/search";
import { createSong } from "common/js/song";
import BScroll from "@better-scroll/core";
import ScrollBar from "@better-scroll/scroll-bar";
import Pullup from "@better-scroll/pull-up";
import NoResult from "base/no-result/index";
import { mapMutations, mapActions } from "vuex";
BScroll.use(ScrollBar);
BScroll.use(Pullup);
export default {
  props: {
    // 查询内容
    query: {
      type: String,
      default: ""
    },
    // 是否要搜索歌手
    showSinger: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      page: 1,
      result: [],
      bscroll: null,
      searchMore: true,
      hasMore: true
    };
  },
  mounted() {
    // 初始化滑动组件
    setTimeout(() => {
      this._initBscroll();
    }, 20);
  },
  methods: {
    // 初始化滚动条
    _initBscroll() {
      this.bscroll = new BScroll(this.$refs.suggest, {
        scrollY: true,
        probeType: 2,
        scrollbar: true,
        pullUpLoad: {
          threshold: 50
        },
        click: true
      });
      this.bscroll.on("pullingUp", this.pullingUpHandler);
    },
    // 下拉事件
    async pullingUpHandler() {
      // 防止疯狂拉取数据
      if (!this.searchMore) {
        this.bscroll.finishPullUp();
        return;
      }
      this.page = this.page + 1;
      await this.search();
      this.bscroll.finishPullUp();
    },
    // 获取搜索结果
    search() {
      this.searchMore = false;
      this.hasMore = true;
      getSearch(this.query, this.page, this.showSinger).then(res => {
        if (res.code === 0) {
          this.result = this.result.concat(this._getResult(res.data));
          this._checkMore(res.data);
        }
      });
    },
    _checkMore(data) {
      const song = data.song;
      if (
        !song.list.length ||
        song.curnum + song.curpage * 20 > song.totalnum
      ) {
        this.searchMore = false;
        this.hasMore = false;
      } else {
        this.searchMore = true;
      }
    },
    _getResult(data) {
      let ret = [];
      if (data.zhida && data.zhida.singerid) {
        ret.push({ ...data.zhida, ...{ type: "singer" } });
      }
      if (data.song) {
        ret = ret.concat(this._normalizeSongs(data.song.list));
      }
      return ret;
    },
    // 获取不同的图标
    getIcon(item) {
      if (item.type === "singer") return "icon-mine";
      return "icon-music";
    },
    // 歌手和歌曲
    getName(item) {
      if (item.type === "singer") return item.singername;
      return `${item.name} - ${item.singer}`;
    },
    // 标准化数据
    _normalizeSongs(list) {
      let ret = [];
      list.forEach(item => {
        ret.push(createSong(item));
      });
      return ret;
    },
    // 选择歌曲或歌手事件
    selectItem(item) {
      if (item.type === "singer") {
        // 数据改造
        let temp = {};
        temp.singer_id = item.singerid;
        temp.singer_mid = item.singermid;
        temp.singer_name = item.singername;
        temp.singer_pic = `http://y.gtimg.cn/music/photo_new/T001R150x150M000${temp.singer_mid}.webp`;
        this.$router.push({
          path: `/search/${temp.singer_id}`
        });
        this.setSinger(temp);
      } else {
        this.insertSong(item);
      }
      this.$emit("selectItem");
    },
    ...mapMutations({
      setSinger: "SET_SINGER"
    }),
    ...mapActions(["insertSong"])
  },
  watch: {
    query() {
      this.page = 1;
      this.result = [];
      this.search();
    },
    result() {
      setTimeout(() => {
        this.bscroll.refresh();
      }, 100);
    }
  },
  components: {
    Loading,
    NoResult
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';
@import '~common/stylus/mixin';

.suggest {
  height: 100%;
  overflow: hidden;

  .suggest-list {
    padding: 0 30px;

    .suggest-item {
      display: flex;
      align-items: center;
      padding-bottom: 20px;
    }

    .icon {
      flex: 0 0 30px;
      width: 30px;

      [class^='icon-'] {
        font-size: 14px;
        color: $color-text-d;
      }
    }

    .name {
      flex: 1;
      font-size: $font-size-medium;
      color: $color-text-d;
      overflow: hidden;

      .text {
        no-wrap();
      }
    }
  }

  .no-result-wrapper {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>