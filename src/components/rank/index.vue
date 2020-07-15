<template>
  <div class="rank" ref="rank">
    <div class="toplist" ref="toplist">
      <ul>
        <li class="item" v-for="item in topList" :key="item.id" @click="selectItem(item)">
          <div class="icon">
            <img width="100" height="100" v-lazy="item.frontPicUrl" />
          </div>
          <ul class="songlist">
            <li class="song" v-for="(song,index) in item.song" :key="song.id">
              <span>{{index + 1}}</span>
              <span>{{song.title}} - {{song.singerName}}</span>
            </li>
          </ul>
        </li>
      </ul>
      <div class="loading-container" v-show="!topList.length">
        <loading></loading>
      </div>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
import { getRank } from "api/rank";
import { playlistMixin } from "common/js/mixin";
import BScroll from "@better-scroll/core";
import ScrollBar from "@better-scroll/scroll-bar";
import Loading from "base/loading/index";
import { mapMutations } from "vuex";
BScroll.use(ScrollBar);
export default {
  mixins: [playlistMixin],
  data() {
    return {
      topList: [],
      bscroll: null
    };
  },
  created() {
    this._getRank();
  },
  mounted() {
    // 初始化滑动组件
    setTimeout(() => {
      this._initBscroll();
    }, 20);
  },
  methods: {
    // 点击排行榜事件
    selectItem(item) {
      this.setTopList(item)
      this.$router.push({
        path: `/rank/${item.topId}`
      });
    },
    // 获取排行榜数据
    _getRank() {
      getRank().then(res => {
        if (res.code === 0) {
          this.topList = this._normalize(res.data.group);
          setTimeout(() => {
            this.bscroll.refresh();
          }, 200);
        }
      });
    },
    // 标准化数据
    _normalize(list) {
      let arr = [];
      list.forEach(element => {
        const { toplist } = element;
        arr = arr.concat(toplist);
      });
      return arr;
    },
    // 初始化滚动
    _initBscroll() {
      this.bscroll = new BScroll(this.$refs.toplist, {
        scrollY: true,
        probeType: 1,
        scrollbar: true,
        click: true
      });
    },
    // mixin 事件处理
    handlePlayList(playList) {
      const bottom = playList.length > 0 ? "60px" : "";
      this.$refs.rank.style.bottom = bottom;
      if (this.bscroll) this.bscroll.refresh();
    },
    ...mapMutations({
      setTopList: "SET_TOPLIST"
    })
  },
  components: {
    Loading
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';
@import '~common/stylus/mixin';

.rank {
  position: fixed;
  width: 100%;
  top: 88px;
  bottom: 0;

  .toplist {
    height: 100%;
    overflow: hidden;

    .item {
      display: flex;
      margin: 0 20px;
      padding-top: 20px;
      height: 100px;

      &:last-child {
        padding-bottom: 20px;
      }

      .icon {
        flex: 0 0 100px;
        width: 100px;
        height: 100px;
      }

      .songlist {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 0 20px;
        height: 100px;
        overflow: hidden;
        background: $color-highlight-background;
        color: $color-text-d;
        font-size: $font-size-small;

        .song {
          no-wrap();
          line-height: 26px;
        }
      }
    }

    .loading-container {
      position: absolute;
      width: 100%;
      top: 50%;
      transform: translateY(-50%);
    }
  }
}
</style>