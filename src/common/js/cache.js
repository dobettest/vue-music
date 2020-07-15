import storage from 'good-storage'

const SEARCH_KEY = '__search__'
const PLAY_KEY = '__play__'
const FAVORITE_KEY = '__favorite__'

function insertArr(arr, val, compare, maxlen) {
    const index = arr.findIndex(compare)
    if (index === 0) return
    if (index > 0) arr.splice(index, 1)
    arr.unshift(val)
    if (maxlen && arr.length > maxlen) arr.pop()
}

export function saveSearch(query) {
    let searches = storage.get(SEARCH_KEY, [])
    insertArr(searches, query, item => {
        return item === query
    }, 15)
    storage.set(SEARCH_KEY, searches)
    return searches
}

function deleteArr(arr, compare) {
    const index = arr.findIndex(compare)
    if (index > -1) arr.splice(index, 1)

}

export function deleteSearch(query) {
    let searches = storage.get(SEARCH_KEY, [])
    deleteArr(searches, (item) => {
        return item === query
    })
    storage.set(SEARCH_KEY, searches)
    return searches
}

export function clearSearch() {
    storage.remove(SEARCH_KEY)
    return []
}

export function getSearchHistory() {
    return storage.get(SEARCH_KEY, [])
}

export function savePlay(song) {
    let songs = storage.get(PLAY_KEY, [])
    insertArr(songs, song, (item) => {
        return item.id === song.id
    }, 50)
    storage.set(PLAY_KEY, songs)
    return songs
}

export function getPlay() {
    return storage.get(PLAY_KEY, [])
}

export function saveFavorite(song) {
    let songs = storage.get(FAVORITE_KEY, [])
    insertArr(songs, song, item => {
        return song.id === item.id
    }, 50)
    storage.set(FAVORITE_KEY, songs)
    return songs
}

export function deleteFavorite(song) {
    let songs = storage.get(FAVORITE_KEY, [])
    deleteArr(songs, item => {
        return song.id === item.id
    }, 50)
    storage.set(FAVORITE_KEY, songs)
    return songs
}

export function getFavorite() {
    return storage.get(FAVORITE_KEY, [])
}