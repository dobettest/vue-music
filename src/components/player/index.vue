<template>
  <div class="player"
       v-show="playList.length>0">
    <transition name="normal"
                @enter="enter"
                @leave="leave">
      <div class="normal-player"
           v-show="fullScreen">
        <div class="background">
          <img width="100%"
               height="100%"
               :src="currentSong.image" />
        </div>
        <div class="top">
          <div class="back"
               @click="close">
            <i class="icon-back"></i>
          </div>
          <h1 class="title"
              v-html="currentSong.name"></h1>
          <h2 class="subtitle"
              v-html="currentSong.singer"></h2>
        </div>
        <div class="middle"
             @touchstart.prevent="middleTouchStart"
             @touchmove.prevent="middleTouchMove"
             @touchend="middleTouchEnd">
          <div class="middle-l"
               ref="middleL">
            <div class="cd-wrapper"
                 ref="cdWrapper">
              <div class="cd"
                   :class="cdClass">
                <img class="image"
                     :src="currentSong.image" />
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>
          <div class="middle-r"
               ref="lyricList">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p ref="lyricLine"
                   class="text"
                   v-for="(line,index) in currentLyric.lines"
                   :class="{'current':currentLineNum === index}"
                   :key="line.id">{{line.txt}}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot"
                  :class="{'active':currentShow==='cd'}"></span>
            <span class="dot"
                  :class="{'active':currentShow==='lyric'}"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent"
                            @percentChange="progressChange"></progress-bar>
            </div>
            <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left"
                 @click="changeMode">
              <i :class="modeIcon"></i>
            </div>
            <div class="icon i-left"
                 :class="disableClass">
              <i class="icon-prev"
                 @click="previous"></i>
            </div>
            <div class="icon i-center"
                 :class="disableClass">
              <i :class="playIcon"
                 @click="togglePlaying"></i>
            </div>
            <div class="icon i-right"
                 :class="disableClass">
              <i class="icon-next"
                 @click="next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon"
                 :class="getFavoriteIcon(currentSong)"
                 @click="clickFavorite(currentSong)"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <transition name="mini">
      <div class="mini-player"
           v-show="!fullScreen"
           @click="open">
        <div class="icon">
          <img :src="currentSong.image"
               width="40"
               height="40"
               :class="cdClass" />
        </div>
        <div class="text">
          <h2 class="name"
              v-html="currentSong.name"></h2>
          <p class="desc"
             v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle :percent="percent"
                           :radius="radius">
            <i @click.stop="togglePlaying"
               class="icon-mini"
               :class="miniIcon"></i>
          </progress-circle>
        </div>
        <div class="control"
             @click.stop="showPlayList">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <audio :src="musicUrl"
           ref="audio"
           @play="ready"
           @error="error"
           @timeupdate="timeUpdate"
           @ended="end"></audio>
    <play-list ref="playlist"></play-list>
    <confirm text="出现资源异常,估计为VIP列表不可播放"
             ref="confirm"
             @confirm="errRefresh"
             @cancel="errRefresh"></confirm>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from "vuex";
import Confirm from "base/confirm/index";
import anime from "animejs/lib/anime.es";
import ProgressBar from "base/progress-bar/index";
import ProgressCircle from "base/progress-circle/index";
import { getSongVkey } from "api/singer";
import Lyric from "lyric-parser";
import PlayList from "components/play-list/index";
import BScroll from "@better-scroll/core";
import ScrollBar from "@better-scroll/scroll-bar";
import { playerMixin } from "common/js/mixin";
BScroll.use(ScrollBar);

export default {
  mixins: [playerMixin],
  data () {
    return {
      musicUrl: "",
      songReady: false,
      currentTime: 0,
      radius: 32,
      currentLyric: null,
      currentLineNum: 0,
      bscroll: null,
      playingLyric: "",
      touch: {},
      currentShow: "cd",
      errNum: 0,
      tiemr: null
    };
  },
  mounted () {
    this._initBscroll();
  },
  computed: {
    // 播放暂停 切换图标
    playIcon () {
      return this.playing ? "icon-pause" : "icon-play";
    },
    miniIcon () {
      return this.playing ? "icon-pause-mini" : "icon-play-mini";
    },
    cdClass () {
      return this.playing ? "play" : "play pause";
    },
    disableClass () {
      return this.songReady ? "" : "disable";
    },
    percent () {
      return this.currentTime / this.currentSong.duration;
    },
    ...mapGetters(["fullScreen", "playing", "currentIndex"])
  },
  methods: {
    // 歌曲异常刷新
    errRefresh () {
      this.$router.go(0);
    },
    // 横向滑动
    middleTouchStart (e) {
      this.touch.initiated = true;
      // 用来判断是否是一次移动
      this.touch.moved = false;
      const touch = e.touches[0];
      this.touch.startX = touch.pageX;
      this.touch.startY = touch.pageY;
    },
    middleTouchMove (e) {
      if (!this.touch.initiated) {
        return;
      }
      const touch = e.touches[0];
      const deltaX = touch.pageX - this.touch.startX;
      const deltaY = touch.pageY - this.touch.startY;
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        return;
      }
      if (!this.touch.moved) {
        this.touch.moved = true;
      }
      const left = this.currentShow === "cd" ? 0 : -window.innerWidth;
      const offsetWidth = Math.min(
        0,
        Math.max(-window.innerWidth, left + deltaX)
      );
      this.touch.percent = Math.abs(offsetWidth / window.innerWidth);
      this.$refs.lyricList.style.transform = `translate3d(${offsetWidth}px,0,0)`;
      this.$refs.lyricList.style.transitionDuration = 0;
      this.$refs.middleL.style.opacity = 1 - this.touch.percent;
      this.$refs.middleL.style.transitionDuration = 0;
    },
    middleTouchEnd () {
      if (!this.touch.moved) {
        return;
      }
      let offsetWidth;
      let opacity;
      if (this.currentShow === "cd") {
        if (this.touch.percent > 0.1) {
          offsetWidth = -window.innerWidth;
          opacity = 0;
          this.currentShow = "lyric";
        } else {
          offsetWidth = 0;
          opacity = 1;
        }
      } else {
        if (this.touch.percent < 0.9) {
          offsetWidth = 0;
          this.currentShow = "cd";
          opacity = 1;
        } else {
          offsetWidth = -window.innerWidth;
          opacity = 0;
        }
      }
      const time = 300;
      this.$refs.lyricList.style.transform = `translate3d(${offsetWidth}px,0,0)`;
      this.$refs.lyricList.style.transitionDuration = `${time}ms`;
      this.$refs.middleL.style.opacity = opacity;
      this.$refs.middleL.style.transitionDuration = `${time}ms`;
      this.touch.initiated = false;
    },
    // 初始化纵向滚动
    _initBscroll () {
      this.bscroll = new BScroll(this.$refs.lyricList, {
        scrollY: true,
        scrollbar: true,
        probeType: 1
      });
    },
    // 获取歌词，并且解析歌词
    getLyric () {
      this.currentSong
        .getLyric()
        .then(lyric => {
          if (this.currentSong.lyric !== lyric) return;
          this.currentLyric = new Lyric(lyric, this._callbackLyric);
          if (this.playing) {
            this.currentLyric.play();
            setTimeout(() => {
              this.bscroll.refresh();
            }, 20);
          }
        })
        .catch(() => {
          this.currentLyric = null;
          this.playingLyric = "";
          this.currentLineNum = 0;
        });
    },
    // 解析歌词的回调函数
    _callbackLyric ({ lineNum, txt }) {
      this.currentLineNum = lineNum;
      this.playingLyric = txt;
      if (lineNum > 5) {
        let lineEl = this.$refs.lyricLine[lineNum - 5];
        this.bscroll.scrollToElement(lineEl, 1000);
      } else {
        this.bscroll.scrollToElement(0, 0, 1000);
      }
    },
    // 收起播放器，切换为mini播放器
    close () {
      this.setFullScreen(false);
    },
    // 打开播放器，关闭mini播放器
    open () {
      this.setFullScreen(true);
    },
    // 进度条改变
    progressChange (percent) {
      this.$refs.audio.currentTime = percent * this.currentSong.duration;
      if (!this.playing) {
        this.togglePlaying();
      }
      if (this.currentLyric) {
        this.currentLyric.seek(this.$refs.audio.currentTime * 1000);
      }
    },
    // 切换上一首
    previous () {
      if (!this.songReady) {
        return;
      }
      if (0 === this.currentIndex) {
        this.setIndex(this.playList.length - 1);
        return;
      }
      this.setIndex(this.currentIndex - 1);
      if (!this.playing) {
        this.togglePlaying();
      }
      this.songReady = false;
    },
    // 切换下一首
    next () {
      if (!this.songReady) {
        return;
      }
      if (this.playList.length - 1 === this.currentIndex) {
        this.setIndex(0);
        return;
      }
      this.setIndex(this.currentIndex + 1);
      if (!this.playing) {
        this.togglePlaying();
      }
      this.songReady = false;
    },
    // 打开播放列表
    showPlayList () {
      this.$refs.playlist.show();
    },
    _getPosAndScale () {
      // mini 唱片的宽度
      const miniWidth = 40;
      // mini 距离左边和底部距离
      const miniLeft = 40;
      const miniBottom = 30;
      // large 唱片的宽度
      const largeWidth = window.innerWidth * 0.8;
      // large 距离顶部距离
      const largeTop = 80;
      // 缩放比例
      const scale = miniWidth / largeWidth;
      // 计算最后的偏移量
      const x = -(window.innerWidth / 2 - miniLeft);
      const y = window.innerHeight - largeTop - largeWidth / 2 - miniBottom;
      return { x, y, scale };
    },
    // mini飞向大唱片
    enter () {
      anime({
        targets: this.$refs.cdWrapper,
        translateX: 0,
        translateY: 0,
        scale: 1,
        duration: 400,
        easing: "cubicBezier(.5,.05,.1,.3)"
      });
    },
    // 大唱片飞向mini
    leave () {
      const { x, y, scale } = this._getPosAndScale();
      anime({
        targets: this.$refs.cdWrapper,
        translateX: x,
        translateY: y,
        scale: scale,
        duration: 400,
        easing: "cubicBezier(.5,.05,.1,.3)"
      });
    },
    // 暂停播放
    togglePlaying () {
      this.setPlaying(!this.playing);
      if (this.currentLyric) {
        this.currentLyric.togglePlay();
      }
    },
    // 歌曲资源加载成功时
    ready () {
      this.songReady = true;
      this.savePlayHistory(this.currentSong);
    },
    // 歌曲资源加载失败时
    error () {
      this.songReady = false;
    },
    // 歌曲结束时
    end () {
      // 如果是单曲循环调用 loop
      if (this.mode === 1) this._loop();
      else this.next();
    },
    _loop () {
      this.$refs.audio.currentTime = 0;
      this.$refs.audio.play();
    },
    // 时间戳转换分和秒
    format (interval) {
      interval = interval | 0;
      const min = (interval / 60) | 0;
      let sec = interval % 60;
      if (sec < 10) sec = "0" + sec;
      return `${min}:${sec}`;
    },
    // 歌曲进度时间
    timeUpdate (e) {
      this.currentTime = e.target.currentTime;
    },
    ...mapMutations({
      setFullScreen: "SET_FULLSCREEN"
    }),
    ...mapActions(["savePlayHistory"])
  },
  watch: {
    async currentSong (Song, old) {
      if (!Song.id) return;
      if (Song.id === old.id) return;
      if (this.currentLyric) this.currentLyric.stop();
      // 歌曲变化时，拿取vkey，拼接播放链接
      let vkey = await getSongVkey(Song.mid)
      if (!vkey) vkey = await getSongVkey(Song.mid)
      if (vkey) {
        this.errNum = 0;
        this.musicUrl = "http://ws.stream.qqmusic.qq.com/" + vkey;
        if (this.currentLyric) {
          this.currentLyric.stop();
          this.currentTime = 0;
          this.playingLyric = "";
          this.currentLineNum = 0;
        }
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.$refs.audio.play();
          this.getLyric();
        }, 1000);
      } else {
        this.errNum = this.errNum + 1;
        if (this.errNum === 4) {
          this.errNum = 0;
          this.$refs.confirm.show();
          this.songReady = false;
          return;
        }
        this.songReady = true;
        this.next();
      }

    },
    playing (key) {
      const audio = this.$refs.audio;
      this.$nextTick(() => {
        key ? audio.play() : audio.pause();
      });
    }
  },
  components: {
    ProgressBar,
    ProgressCircle,
    Confirm,
    PlayList
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable'
@import '~common/stylus/mixin'
.player
  .normal-player
    position fixed
    left 0
    right 0
    top 0
    bottom 0
    z-index 150
    background $color-background
    .background
      position absolute
      left 0
      top 0
      width 100%
      height 100%
      z-index -1
      opacity 0.6
      filter blur(20px)
    .top
      position relative
      margin-bottom 25px
      .back
        position absolute
        top 0
        left 6px
        z-index 50
        .icon-back
          display block
          padding 9px
          font-size $font-size-large-x
          color $color-theme
          transform rotate(-90deg)
      .title
        width 70%
        margin 0 auto
        line-height 40px
        text-align center
        no-wrap()
        font-size $font-size-large
        color $color-text
      .subtitle
        line-height 20px
        text-align center
        font-size $font-size-medium
        color $color-text
    .middle
      position fixed
      width 100%
      top 80px
      bottom 170px
      white-space nowrap
      font-size 0
      .middle-l
        display inline-block
        vertical-align top
        position relative
        width 100%
        height 0
        padding-top 80%
        .cd-wrapper
          position absolute
          left 10%
          top 0
          width 80%
          height 100%
          .cd
            width 100%
            height 100%
            box-sizing border-box
            border 10px solid rgba(255, 255, 255, 0.1)
            border-radius 50%
            &.play
              animation rotate 20s linear infinite
            &.pause
              animation-play-state paused
            .image
              position absolute
              left 0
              top 0
              width 100%
              height 100%
              border-radius 50%
        .playing-lyric-wrapper
          width 80%
          margin 30px auto 0 auto
          overflow hidden
          text-align center
          .playing-lyric
            height 20px
            line-height 20px
            font-size $font-size-medium
            color $color-text-l
      .middle-r
        display inline-block
        vertical-align top
        width 100%
        height 100%
        overflow hidden
        .lyric-wrapper
          width 80%
          margin 0 auto
          overflow hidden
          text-align center
          .text
            line-height 32px
            color $color-text-l
            font-size $font-size-medium
            &.current
              color $color-text
    .bottom
      position absolute
      bottom 50px
      width 100%
      .dot-wrapper
        text-align center
        font-size 0
        .dot
          display inline-block
          vertical-align middle
          margin 0 4px
          width 8px
          height 8px
          border-radius 50%
          background $color-text-l
          &.active
            width 20px
            border-radius 5px
            background $color-text-ll
      .progress-wrapper
        display flex
        align-items center
        width 80%
        margin 0px auto
        padding 10px 0
        .time
          color $color-text
          font-size $font-size-small
          flex 0 0 30px
          line-height 30px
          width 30px
          &.time-l
            text-align left
          &.time-r
            text-align right
        .progress-bar-wrapper
          flex 1
      .operators
        display flex
        align-items center
        .icon
          flex 1
          color $color-theme
          &.disable
            color $color-theme-d
          i
            font-size 30px
        .i-left
          text-align right
        .i-center
          padding 0 20px
          text-align center
          i
            font-size 40px
        .i-right
          text-align left
        .icon-favorite
          color $color-sub-theme
    &.normal-enter-active, &.normal-leave-active
      transition all 0.7s
      .top, .bottom
        transition all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
    &.normal-enter, &.normal-leave-to
      opacity 0
      .top
        transform translate3d(0, -100px, 0)
      .bottom
        transform translate3d(0, 100px, 0)
  .mini-player
    display flex
    align-items center
    position fixed
    left 0
    bottom 0
    z-index 180
    width 100%
    height 60px
    background $color-highlight-background
    &.mini-enter-active, &.mini-leave-active
      transition all 0.4s
    &.mini-enter, &.mini-leave-to
      opacity 0
    .icon
      flex 0 0 40px
      width 40px
      padding 0 10px 0 20px
      img
        border-radius 50%
        &.play
          animation rotate 10s linear infinite
        &.pause
          animation-play-state paused
    .text
      display flex
      flex-direction column
      justify-content center
      flex 1
      line-height 20px
      overflow hidden
      .name
        margin-bottom 2px
        no-wrap()
        font-size $font-size-medium
        color $color-text
      .desc
        no-wrap()
        font-size $font-size-small
        color $color-text-d
    .control
      flex 0 0 30px
      width 30px
      padding 0 10px
      .icon-play-mini, .icon-pause-mini, .icon-playlist
        font-size 30px
        color $color-theme-d
      .icon-mini
        font-size 32px
        position absolute
        left 0
        top 0
@keyframes rotate
  0%
    transform rotate(0)
  100%
    transform rotate(360deg)
</style>