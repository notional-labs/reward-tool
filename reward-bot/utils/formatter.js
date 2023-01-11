const { specialDenom, chainData, denomToId } = require('../storage/chainData')
const axios = require('axios')

const SI_prefix = {
    "d": 1,
    "c": 2,
    "m": 3,
    "u": 6,
    "n": 9,
    "p": 12,
    "f": 15,
    "a": 18,
    "z": 21,
    "y": 24
}

var queryString = 'https://api.coingecko.com/api/v3/simple/price?include_24hr_change=false&vs_currencies=usd&ids=agoric,stride-staked-atom,akash-network,darc,omniflix-network,konstellation,axelar,usd-coin,tether,bostrom,dai,wei,matic-network,avalanche-2,polkadot,band-protocol,bzedge,bitcanna,bitsong,switcheo,cerberus-2,cheqd-network,chihuahua-token,comdex,cosmos,crescent-network,crypto-com-chain,decentr,desmos,dig-chain,echelon,emoney,e-money-eur,evmos,fetch-ai,injective-protocol,iris-network,ixo,jackal,juno-network,kava,ki,kujira,lambda,likecoin,lum-network,nym,odin-protocol,geodb,osmosis,ion,somm,persistence,point-network,provenance-blockchain,rebus,regen,rizon,secret,sentinel,certik,sifchain,stafi,stafi-ratom,stargaze,starname,stride,teritori,terra-luna,terrausd,terrakrw,white-whale,terra-luna-2,umee,unification,vidulum'

module.exports.formatReward = async (rewards) => {
    let newRewards = {}
    const res = await axios.get(queryString)
    const usdRates = res.data
    let sum = 0
    for (var key in rewards) {
        let newTotal = []
        if (rewards[key].err) {
            newRewards[key] = {
                err: rewards[key].err
            }
            continue
        }
        let api = chainData[key].api_service
        rewards[key].total.map(async total => {
            let newDenom
            if (total.denom.substring(0, 3) === "ibc" && api !== null) {
                newDenom = await getDenom(api, total.denom.substring(4))
            }
            else {
                newDenom = total.denom
            }
            const displayDenom = getDisplayDenom(newDenom)
            if (newDenom && newDenom !== 'unknown' && displayDenom !== 'unknown') {
                const value = (getValueFromDenom(newDenom, total.amount)).toFixed(2)
                const id = denomToId[displayDenom]
                const rate = usdRates[id] ? ( usdRates[id].usd && usdRates[id].usd.value ) ? 0 : usdRates[id].usd || 0  : 0
                newTotal.unshift({
                    denom: displayDenom,
                    amount: value,
                    usd: (rate * value).toFixed(2)
                })
                sum += parseFloat(rate * value)
            }
        })
        newRewards[key] = {
            total: newTotal
        }
    }
    return {
        newRewards,
        sum
    }
}

const getDenom = async (api, ibcDenom) => {
    try {
        const { data } = await axios.get(`${api}ibc/apps/transfer/v1/denom_traces/${ibcDenom}`)
        const denom = data.denom_trace ? data.denom_trace.base_denom : "unknown"
        return denom
    }
    catch (e) {
        return 'unknown'
    }
}

const getDisplayDenom = (denom) => {
    if (denom in specialDenom) {
        return specialDenom[`${denom}`].denom
    }
    if (denom === 'unknown') {
        return denom
    }
    else {
        const prefix = denom.substring(0, 1)
        const displayDenom = prefix === 'u'
            || prefix === 'n'
            || prefix === 'a'
            ? denom.substring(1) : 'unknow'
        return displayDenom
    }
}

const getValueFromDenom = (denom, value) => {
    let convertValue
    if (denom in specialDenom) {
        const exponent = specialDenom[`${denom}`].exponent
        convertValue = parseInt(value, 10) / Math.pow(10, 18 + exponent)
    }
    else {
        const prefix = denom.substring(0, 1)
        switch (prefix) {
            case 'u':
                convertValue = parseInt(value, 10) / Math.pow(10, 24)
                break
            case 'p':
                convertValue = parseInt(value, 10) / Math.pow(10, 30)
                break
            case 'a':
                convertValue = parseInt(value, 10) / Math.pow(10, 36)
                break
            case 'n':
                convertValue = parseInt(value, 10) / Math.pow(10, 27)
                break
            default:
                convertValue = parseInt(value, 10) / Math.pow(10, 24)
                break
        }
    }
    return convertValue
}
