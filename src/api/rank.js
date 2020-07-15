import axios from 'axios'
import jsonp from 'common/js/jsonp'
import {
    commonParams,
    options,
    baseUrl
} from './config'
export function getRank() {
    const url = baseUrl + 'api/getRank'
    return axios.post(url).then(res => {
        return Promise.resolve(res.data.req_0)
    })
}

export function getMusicList(topid) {
    const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg'
    const data = Object.assign({}, commonParams, {
        topid,
        needNewCode: 1,
        uin: 0,
        tpl: 3,
        page: 'detail',
        type: 'top',
        platform: 'h5'
    })
    return jsonp(url, data, options)
}

// 这两个都是最新的接口，但是要配合使用，比较麻烦
export function getRankSongs(topId) {
    const url = baseUrl + 'api/getRankSongs'
    const data = Object.assign({}, commonParams, {
        '-': 'getUCGI33960706188873346',
        loginUin: 0,
        hostUin: 0,
        platform: 'yqq.json',
        needNewCode: 0,
        data: {
            "detail": {
                "module": "musicToplist.ToplistInfoServer",
                "method": "GetDetail",
                "param": {
                    "topId": topId,
                    "offset": 0,
                    "num": 50,
                    "period": "2019-08-26"
                }
            },
            "comm": {
                "ct": 24,
                "cv": 0
            }
        }
    })
    return axios.get(url, {
        params: data
    }).then(res => {
        return Promise.resolve(res.data)
    })
}

export function getRankDetail(albummid) {
    const url = baseUrl + 'api/getRankDetail'
    const data = Object.assign({}, commonParams, {
        ct: 24,
        albummid: albummid,
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