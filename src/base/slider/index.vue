<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot></slot>
    </div>
    <div class="dots">
      <span
        class="dot"
        :class="{active:currentPageIndex===index}"
        v-for="(item,index) in dots"
        :key="item"
      ></span>
    </div>
  </div>
</template>

<script>
import { addClass } from "common/js/dom";
import BScroll from "@better-scroll/core";
import Slider from "@better-scroll/slide";

// 解决滚动
BScroll.use(Slider);

export default {
  data() {
    return {
      slider: null,
      currentPageIndex: 0,
      dots: [],
      playTimer: 0
    };
  },
  props: {
    // 是否可以循环轮播
    loop: {
      type: Boolean,
      default: true
    },
    // 是否自动轮播
    autoPlay: {
      type: Boolean,
      default: true
    },
    // 间隔
    interval: {
      type: Number,
      default: 3000
    }
  },
  mounted() {
    // 保证dom渲染成功
    this.$nextTick(() => {
      this._addItemClass();
      this._initSlider();
      this._initDots();
      if (this.autoPlay) this._autoGoNext();
    });
    // 监听窗体缩放，改变轮播图
    window.addEventListener("resize", () => {
      if (!this.slider) return;
      this._addItemClass();
      this.slider.refresh();
      this._autoGoNext();
    });
  },
  methods: {
    _addItemClass() {
      this.children = this.$refs.sliderGroup.children;
      for (let i = 0; i < this.children.length; i++) {
        const child = this.children[i];
        addClass(child, "slider-item");
        child.style.width = this.$refs.slider.clientWidth + "px";
      }
    },
    _initSlider() {
      this.slider = new BScroll(this.$refs.slider, {
        scrollX: true,
        scrollY: false,
        click: true,
        slide: {
          loop: true,
          threshold: 0.3
        },
        useTransition: true, // 使用CSS3 transition动画
        bounce: false, // 循环衔接出现闪烁
        momentum: false, // 解决快速闪烁
        stopPropagation: true, // 阻止冒泡事件
        probeType: 2 // 为2时派发scroll事件
      });

      this.slider.on("slideWillChange", page => {
        this.currentPageIndex = page.pageX;
      });
      this.slider.on("beforeScrollStart", () => {
        clearTimeout(this.playTimer);
      });
      this.slider.on("scrollEnd", () => {
        if (this.autoPlay) this._autoGoNext();
      });
    },
    _initDots() {
      if (this.children.length >= 2)
        this.dots = new Array(this.children.length - 2);
    },
    _autoGoNext() {
      clearTimeout(this.playTimer);
      this.playTimer = setTimeout(() => {
        this.slider.next();
      }, this.interval);
    }
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';

.slider {
  min-height: 1px;
  overflow: hidden;

  .slider-group {
    position: relative;
    white-space: nowrap;

    .slider-item {
      display: inline-block;
      width: 100%;
      box-sizing: border-box;
      overflow: hidden;
      text-align: center;

      a {
        display: block;
        width: 100%;
        overflow: hidden;
        text-decoration: none;
      }

      img {
        display: block;
        width: 100%;
      }
    }
  }

  .dots {
    position: absolute;
    right: 0;
    left: 0;
    bottom: 12px;
    text-align: center;
    font-size: 0;

    .dot {
      display: inline-block;
      margin: 0 4px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: $color-text-l;

      &.active {
        width: 20px;
        border-radius: 5px;
        background: $color-text-ll;
      }
    }
  }
}
</style>