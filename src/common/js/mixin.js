import {
    mapGetters,
    mapMutations,
    mapActions
} from "vuex";
import {
    shuffle
} from "common/js/util";

export const playlistMixin = {
    computed: {
        ...mapGetters(['playList'])
    },
    mounted() {
        this.handlePlayList(this.playList)
    },
    // keep-alive切换时触发
    activated() {
        this.handlePlayList(this.playList)
    },
    watch: {
        playList(newValue) {
            this.handlePlayList(newValue)
        }
    },
    methods: {
        handlePlayList() {
            throw new Error('component 必须要实现 handlePlayList()')
        }
    },
}

export const playerMixin = {
    computed: {
        modeIcon() {
            return this.mode === 0 ?
                "icon-sequence" :
                this.mode === 1 ?
                "icon-loop" :
                "icon-random";
        },
        ...mapGetters(["sequenceList", "currentSong", "mode", "playList", "favoriteList"])
    },
    methods: {
        // 改变播放模式 顺序播放 循环播放 随机播放
        changeMode() {
            const mode = (this.mode + 1) % 3;
            this.setMode(mode);
            let list = null;
            if (mode === 2) {
                list = shuffle(this.sequenceList);
            } else {
                list = this.sequenceList;
            }
            // 这步比较重要，要做一个映射
            this._resetCurrentIndex(list);
            this.setPlayList(list);
        },
        // 刷新当前index 在随机播放和顺序播放之间
        _resetCurrentIndex(list) {
            let index = list.findIndex(item => {
                return item.id === this.currentSong.id;
            });
            this.setIndex(index);
        },
        // 收藏图标切换
        getFavoriteIcon(song) {
            if (this.ifFavorite(song)) return 'icon-favorite'
            return 'icon-not-favorite'
        },
        clickFavorite(song) {
            if (this.ifFavorite(song)) this.deleteFavoriteList(song)
            else this.saveFavoriteList(song)
        },
        ifFavorite(song) {
            const index = this.favoriteList.findIndex(item => {
                return item.id === song.id
            })
            return index > -1
        },
        ...mapMutations({
            setPlaying: "SET_PlAYING",
            setIndex: "SET_CURRENTINDEX",
            setMode: "SET_MODE",
            setPlayList: "SET_PLAYLIST"
        }),
        ...mapActions(['saveFavoriteList', 'deleteFavoriteList'])
    },
}

export const searchMixin = {
    data() {
        return {
            query: ''
        }
    },
    computed: {
        ...mapGetters(["searchHistory"])
    },
    methods: {
        // 保存搜索结果
        saveSearch() {
            this.saveSearchHistory(this.query);
        },
        // 获取到query
        queryChange(query) {
            this.query = query;
        },
        // 点击热门到输入框
        addQuery(query) {
            this.$refs.searchBox.setQuery(query);
        },
        ...mapActions([
            "saveSearchHistory",
            "deleteSearchHistory"
        ])
    },
}