<template>
  <transition name="list-fade">
    <div class="playlist" v-show="showFlag" @click="hide">
      <div class="list-wrapper" @click.stop>
        <div class="list-header">
          <h1 class="title">
            <i class="icon" :class="modeIcon" @click="changeMode"></i>
            <span class="text">{{textMode}}</span>
            <span class="clear" @click="showConfirm">
              <i class="icon-clear"></i>
            </span>
          </h1>
        </div>
        <div class="list-content" ref="listContent">
          <transition-group name="list" tag="ul">
            <li
              class="item"
              v-for="(item,index) in sequenceList"
              :key="item.id"
              @click="selectItem(item,index)"
              ref="listItem"
            >
              <i class="current" :class="getCurrentIcon(item)"></i>
              <span class="text">{{item.name}}</span>
              <span class="like" @click.stop="clickFavorite(item)">
                <i :class="getFavoriteIcon(item)"></i>
              </span>
              <span class="delete" @click.stop="deleteOne(item)">
                <i class="icon-delete"></i>
              </span>
            </li>
          </transition-group>
        </div>
        <div class="list-operate">
          <div class="add" @click="addSong">
            <i class="icon-add"></i>
            <span class="text">添加歌曲到队列</span>
          </div>
        </div>
        <div class="list-close" @click="hide">
          <span>关闭</span>
        </div>
      </div>
      <confirm ref="confirm" text="是否清空列表" confirmBtnText="清空" @confirm="confirm"></confirm>
      <add-song ref="addSong"></add-song>
    </div>
  </transition>
</template>

<script>
import { mapActions } from "vuex";
import BScroll from "@better-scroll/core";
import Confirm from "base/confirm/index";
import AddSong from "components/add-song/index";
import { playerMixin } from "common/js/mixin";
export default {
  mixins: [playerMixin],
  data() {
    return {
      showFlag: false,
      bscroll: null
    };
  },
  mounted() {
    this._initScroll();
  },
  computed: {
    textMode() {
      return this.mode === 0
        ? "顺序播放"
        : this.mode === 1
        ? "单曲循环"
        : "随机播放";
    }
  },
  methods: {
    // 初始化滚动条
    _initScroll() {
      this.bscroll = new BScroll(this.$refs.listContent, {
        scrollY: true,
        probeType: 1,
        click: true
      });
    },
    // 控制显示和隐藏
    show() {
      this.showFlag = true;
      setTimeout(() => {
        this.bscroll.refresh();
        this.scrollToCurrent(this.currentSong);
      }, 20);
    },
    hide() {
      this.showFlag = false;
    },
    // 清空提示
    showConfirm() {
      this.$refs.confirm.show();
    },
    // 确定清空
    confirm() {
      this.showFlag = false;
      this.clearAllSong();
    },
    // 添加歌曲到队列
    addSong(){
      this.$refs.addSong.show()
    },
    // 设置正在播放的音乐图标
    getCurrentIcon(item) {
      if (item.id === this.currentSong.id) return "icon-play";
      return "";
    },
    // 点击切换歌曲
    selectItem(item, index) {
      if (this.mode === 2) {
        index = this.playList.findIndex(song => {
          return song.id === item.id;
        });
      }
      this.setIndex(index);
      this.setPlaying(true);
    },
    // 滚动到当前播放的歌曲
    scrollToCurrent(current) {
      const index = this.sequenceList.findIndex(song => {
        return song.id === current.id;
      });
      this.bscroll.scrollToElement(this.$refs.listItem[index], 1000);
    },
    // 删除当前点击的歌曲
    deleteOne(item) {
      this.deleteSong(item);
      if (!this.playList.length) this.hide();
      this.bscroll.refresh();
    },
    ...mapActions(["deleteSong", "clearAllSong"])
  },
  watch: {
    currentSong(newSong, oldSong) {
      if (!this.showFlag || newSong.id === oldSong.id) return;
      else this.scrollToCurrent(newSong);
    }
  },
  components: {
    Confirm,
    AddSong
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';
@import '~common/stylus/mixin';

.playlist {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 200;
  background-color: $color-background-d;

  &.list-fade-enter-active, &.list-fade-leave-active {
    transition: opacity 0.3s;

    .list-wrapper {
      transition: all 0.3s;
    }
  }

  &.list-fade-enter, &.list-fade-leave-to {
    opacity: 0;

    .list-wrapper {
      transform: translate3d(0, 100%, 0);
    }
  }

  &.list-fade-enter, .list-wrapper {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    background-color: $color-highlight-background;

    .list-header {
      position: relative;
      padding: 20px 30px 10px 20px;

      .title {
        display: flex;
        align-items: center;

        .icon {
          margin-right: 10px;
          font-size: 30px;
          color: $color-theme-d;
        }

        .text {
          flex: 1;
          font-size: $font-size-medium;
          color: $color-text-l;
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

    .list-content {
      max-height: 240px;
      overflow: hidden;

      .item {
        display: flex;
        align-items: center;
        height: 40px;
        padding: 0 30px 0 20px;
        overflow: hidden;

        &.list-enter-active, &.list-leave-active {
          transition: all 0.1s;
        }

        &.list-enter, &.list-leave-to {
          height: 0;
        }

        .current {
          flex: 0 0 20px;
          width: 20px;
          font-size: $font-size-small;
          color: $color-theme-d;
        }

        .text {
          flex: 1;
          no-wrap();
          font-size: $font-size-medium;
          color: $color-text-d;
        }

        .like {
          extend-click();
          margin-right: 15px;
          font-size: $font-size-small;
          color: $color-theme;

          .icon-favorite {
            color: $color-sub-theme;
          }
        }

        .delete {
          extend-click();
          font-size: $font-size-small;
          color: $color-theme;
        }
      }
    }

    .list-operate {
      width: 140px;
      margin: 20px auto 30px auto;

      .add {
        display: flex;
        align-items: center;
        padding: 8px 16px;
        border: 1px solid $color-text-l;
        border-radius: 100px;
        color: $color-text-l;

        .icon-add {
          margin-right: 5px;
          font-size: $font-size-small-s;
        }

        .text {
          font-size: $font-size-small;
        }
      }
    }

    .list-close {
      text-align: center;
      line-height: 50px;
      background: $color-background;
      font-size: $font-size-medium-x;
      color: $color-text-l;
    }
  }
}
</style>