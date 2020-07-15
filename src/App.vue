<template>
  <div>
    <m-header></m-header>
    <Tab></Tab>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <player></player>
  </div>
</template>

<script>
import MHeader from 'components/m-header/index'
import Tab from 'components/tab/index'
import Player from 'components/player/index'
export default {
  components: {
    MHeader,
    Tab,
    Player
  }
};
</script>

<style lang="stylus"></style>