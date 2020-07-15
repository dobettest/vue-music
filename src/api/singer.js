import axios from 'axios'
import {
  commonParams,
  baseUrl
} from './config'
import jsonp from 'common/js/jsonp'

export function getSingerList(letter, area = -100) {

  const url = baseUrl + 'api/getSingerList'
  const data = Object.assign({}, commonParams, {
    '-': 'getUCGI15774718990432723',
    loginUin: 0,
    hostUin: 0,
    platform: 'yqq.json',
    needNewCode: 0,
    data: {
      "comm": {
        "ct": 24,
        "cv": 0
      },
      "singerList": {
        "module": "Music.SingerListServer",
        "method": "get_singer_list",
        "param": {
          "area": area,
          "sex": -100,
          "genre": -100,
          "index": letter,
          "sin": 0,
          "cur_page": 1
        }
      }
    }
  })
  return axios.get(url, {
    params: data
  }).then(res => {
    return Promise.resolve(res.data)
  })
}
export function getSingerSongs(singer) {
  const url = baseUrl + 'api/getSingerSongs'
  const data = Object.assign({}, commonParams, {
    uin: 0,
    platform: 'h5page',
    needNewCode: 1,
    order: 'listen',
    from: 'h5',
    num: 15,
    begin: singer.num * 15,
    singerid: singer.singer_id,
    singermid: singer.singer_mid
  })
  return axios.get(url, {
    params: data
  }).then(res => {
    return Promise.resolve(res.data)
  })
}
export function getSongVkey(songmid) {
  const url = baseUrl + 'api/getSongVkey'
  const data = Object.assign({}, commonParams, {
    '-': 'getplaysongvkey06362299039050012',
    loginUin: 0,
    hostUin: 0,
    platform: 'yqq.json',
    needNewCode: 0,
    data: {
      "req": {
        "module": "CDN.SrfCdnDispatchServer",
        "method": "GetCdnDispatch",
        "param": {
          "guid": "6532953658",
          "calltype": 0,
          "userip": ""
        }
      },
      "req_0": {
        "module": "vkey.GetVkeyServer",
        "method": "CgiGetVkey",
        "param": {
          "guid": "6532953658",
          "songmid": [songmid],
          "songtype": [0],
          "uin": "0",
          "loginflag": 1,
          "platform": "20"
        }
      },
      "comm": {
        "uin": 0,
        "format": "json",
        "ct": 24,
        "cv": 0
      }
    }
  })
  return axios.get(url, {
    params: data
  }).then(res => {
    // 返回vkey
    return Promise.resolve(res.data.req_0.data.midurlinfo[0].purl)
  })
}
// jsonp 方法获取vkey 这种方法应该快失效了
export function jsonpVkey(songmid) {
  const url = 'https://c.y.qq.com/base/fcgi-bin/fcg_music_express_mobile3.fcg'
  const data = Object.assign({}, {
    callback: 'musicJsonCallback',
    loginUin: 3051522991,
    format: 'jsonp',
    platform: 'yqq',
    needNewCode: 0,
    cid: 205361747,
    uin: 3051522991,
    guid: 5931742855,
    songmid: songmid,
    filename: `C400${songmid}.m4a`
  })
  return jsonp(url, data)
}