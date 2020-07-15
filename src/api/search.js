import axios from 'axios'
import {
    commonParams,
    baseUrl
} from './config'

export function getHotSearch() {
    const url = baseUrl + 'api/getHotSearch'
    const data = Object.assign({}, commonParams, {
        '-': Date.parse(new Date()),
        platform: 'h5',
        needNewCode: 1,
    })
    return axios.get(url, {
        params: data
    }).then(res => {
        return Promise.resolve(res.data)
    })
}

export function getSearch(query, page = 1, showSinger) {
    const url = baseUrl + 'api/getSearch'
    const data = Object.assign({}, commonParams, {
        '-': Date.parse(new Date()),
        platform: 'h5',
        needNewCode: 1,
        uin: 0,
        w: query,
        zhidaqu: showSinger ? 1 : 0,
        catZhida: 1,
        t: 0,
        flag: 1,
        ie: 'utf-8',
        sem: 1,
        aggr: 0,
        perpage: 20,
        n: 20,
        p: page,
        remoteplace: 'txt.mqq.all',
    })
    return axios.get(url, {
        params: data
    }).then(res => {
        return Promise.resolve(res.data)
    })
}