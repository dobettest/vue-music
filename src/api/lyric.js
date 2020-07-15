import axios from 'axios'
import {
    commonParams,
    baseUrl
} from './config'
export function getLyric(songmid) {
    const url = baseUrl + 'api/getLyric'
    const data = Object.assign({}, commonParams, {
        '-': 'MusicJsonCallback_lrc',
        pcachetime: 1566728079648,
        songmid: songmid,
        loginUin: 0,
        hostUin: 0,
        platform: 'yqq.json',
        needNewCode: 0
    })
    return axios.get(url, {
        params: data
    }).then(res => {
        return Promise.resolve(res.data)
    })
}