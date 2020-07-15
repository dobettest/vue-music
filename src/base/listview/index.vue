<template>
  <div class="listview" ref="listview">
    <div class="list-group">
      <ul>
        <h2 class="list-group-title">{{tagTitle}}</h2>
        <li
          v-for="item in singers"
          :key="item.id"
          class="list-group-item"
          @click="selectItem(item)"
        >
          <img v-lazy="item.singer_pic" class="avatar" />
          <span class="name">{{item.singer_name}}</span>
        </li>
      </ul>
    </div>
    <div
      class="list-shortcut"
      @touchstart.stop.prevent="cutTouchStart"
      @touchmove.stop.prevent="cutTouchMove"
      @touchend.stop.prevent="cutTouchEnd"
    >
      <ul>
        <li
          v-for="(item,index) in letters"
          :key="item.id"
          :data-index="index"
          class="item"
          :class="{'current':currentIndex === index}"
        >{{item}}</li>
      </ul>
    </div>
    <div class="list-fixed" v-show="listShow">
      <h1 class="fixed-title">{{tagTitle}}</h1>
    </div>
    <div class="group-fixed" v-show="groupShow">
      <div class="group-title">
        <h1>{{tagTitle}}</h1>
      </div>
      <div class="triangle"></div>
    </div>
    <div class="loading-container" v-show="!data.length">
      <loading></loading>
    </div>
  </div>
</template>

<script>
import BScroll from "@better-scroll/core";
import { getSingerList } from "api/singer";
import Loading from "base/loading/index";
import { getData } from "common/js/dom";
export default {
  data() {
    return {
      letters: [
        "热",
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
        "W",
        "X",
        "Y",
        "Z",
        "#"
      ],
      currentIndex: 0,
      touch: {},
      listShow: true,
      groupShow: false,
      getSingers: [],
      bscroll: null
    };
  },
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  mounted() {
    this._initScroll();
  },
  methods: {
    _initScroll() {
      this.bscroll = new BScroll(this.$refs.listview, {
        scrollY: true,
        click: true,
        probeType: 3
      });
      // 监听滚轮，控制tagTitle的显示
      this.bscroll.on("scroll", e => {
        if (e.y > 0) {
          this.listShow = false;
        } else {
          this.listShow = true;
        }
      });
    },
    cutTouchStart(e) {
      // string 化成 int
      const clickIndex = getData(e.target, "index") | 0;
      // 改变点击的样式
      this.currentIndex = clickIndex;
      // 保存点击下的信息
      this.touch.y1 = e.touches[0].pageY;
      this.touch.index = clickIndex;
    },
    cutTouchMove(e) {
      // 获取差值，计算出
      this.touch.y2 = e.touches[0].pageY;
      const delta = ((this.touch.y2 - this.touch.y1) / 18) | 0;
      this.currentIndex = delta + this.touch.index;
      // 滑动显示图标
      this.groupShow = true;
    },
    cutTouchEnd() {
      let area = 200; // 选择内地歌手，全部的话部分没有头像图片
      let clickIndex = this.currentIndex;
      if (this.currentIndex === 0) {
        clickIndex = -100;
        area = -100;
      }
      getSingerList(clickIndex, area).then(res => {
        this.getSingers = res.singerList.data.singerlist;
        // 获取数据后重新计算滚轮
        setTimeout(() => {
          this.scroll.refresh();
        }, 20);
      });
      this.groupShow = false;
    },
    refresh() {
      this.bscroll.refresh();
    },
    selectItem(item) {
      this.$emit("select", item);
    }
  },
  computed: {
    tagTitle() {
      let title = "";
      if (this.currentIndex == 0) title = "热门";
      else title = this.letters[this.currentIndex];
      return title;
    },
    singers() {
      if (this.getSingers.length > 0) return this.getSingers;
      else return this.data;
    }
  },
  beforeDestroy() {
    this.bscroll.destroy();
  },
  components: {
    Loading
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';

.listview {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: $color-background;

  .list-group {
    padding-bottom: 30px;

    .list-group-title {
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: $font-size-small;
      color: $color-text-l;
      background: $color-highlight-background;
    }

    .list-group-item {
      display: flex;
      align-items: center;
      padding: 20px 0 0 30px;

      .avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
      }

      .name {
        margin-left: 20px;
        color: $color-text-l;
        font-size: $font-size-medium;
      }
    }
  }

  .list-shortcut {
    position: absolute;
    z-index: 30;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    padding: 20px 0;
    border-radius: 10px;
    text-align: center;
    background: $color-background-d;
    font-family: Helvetica;

    .item {
      padding: 3px;
      line-height: 1;
      color: $color-text-l;
      font-size: $font-size-small;

      &.current {
        color: $color-theme;
        background-color: $color-text-d;
        border-radius: 50%;
      }
    }
  }

  .list-fixed {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;

    .fixed-title {
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: $font-size-small;
      color: $color-text-l;
      background: $color-highlight-background;
    }
  }

  .group-fixed {
    position: absolute;
    top: 50%;
    width: 100%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: row;
    justify-content: center;

    .group-title {
      width: 60px;
      height: 60px;
      text-align: center;
      line-height: 60px;
      border-radius: 50%;
      background-color: $color-dialog-background;
      color: $color-background;
      z-index: 10;
    }

    .triangle {
      width: 0;
      height: 0;
      border-top: 25px solid transparent;
      border-left: 50px solid $color-dialog-background;
      border-bottom: 25px solid transparent;
      margin-left: -14px;
      margin-top: 5px;
    }
  }

  .loading-container {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
