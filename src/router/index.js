import Vue from 'vue'
import Router from 'vue-router'

import Recommend from 'components/recommend/index'

const Rank = (resolve) => {
  import('components/rank/index').then((module) => {
    resolve(module)
  })
}
const Search = (resolve) => {
  import('components/search/index').then((module) => {
    resolve(module)
  })
}
const Singer = (resolve) => {
  import('components/singer/index').then((module) => {
    resolve(module)
  })
}

const SingerDetail = (resolve) => {
  import('components/singer-detail/index').then((module) => {
    resolve(module)
  })
}

const Disc = (resolve) => {
  import('components/disc/index').then((module) => {
    resolve(module)
  })
}

const TopList = (resolve) => {
  import('components/top-list/index').then((module) => {
    resolve(module)
  })
}

const UserCenter = (resolve) => {
  import('components/user-center/index').then((module) => {
    resolve(module)
  })
}

Vue.use(Router)

export default new Router({
  routes: [{
    path: '/',
    redirect: '/Recommend'
  }, {
    path: '/recommend',
    component: Recommend,
    children: [{
      path: ':id',
      component: Disc
    }]
  }, {
    path: '/rank',
    component: Rank,
    children: [{
      path: ':id',
      component: TopList
    }]
  }, {
    path: '/search',
    component: Search,
    children: [{
      path: ':id',
      component: SingerDetail
    }]
  }, {
    path: '/singer',
    component: Singer,
    children: [{
      path: ':id',
      component: SingerDetail
    }]
  }, {
    path: '/user',
    component: UserCenter
  }]
})