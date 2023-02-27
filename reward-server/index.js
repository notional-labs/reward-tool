const express = require('express')
const app = express()
const axios = require('axios')
const { denomToId } = require('./data')

require('dotenv').config()

const graphqlReq = axios.create({
    baseURL: "https://graphql.fauna.com/graphql",
    headers: {
        Authorization: `Bearer ${process.env.FAUNADB_SECRET}`,
    },
});

var queryString = 'https://api.coingecko.com/api/v3/simple/price?include_24hr_change=false&vs_currencies=usd&ids=agoric,stride-staked-atom,akash-network,darc,omniflix-network,konstellation,axelar,usd-coin,tether,bostrom,dai,wei,matic-network,avalanche-2,polkadot,band-protocol,bzedge,bitcanna,bitsong,switcheo,cerberus-2,cheqd-network,chihuahua-token,comdex,cosmos,crescent-network,crypto-com-chain,decentr,desmos,dig-chain,echelon,e-money,evmos,fetch-ai,injective-protocol,iris-network,ixo,jackal,juno-network,kava,ki,kujira,lambda,likecoin,lum-network,nym,odin-protocol,geodb,osmosis,ion,somm,persistence,point-network,provenance-blockchain,rebus,regen,rizon,secret,sentinel,certik,sifchain,stafi,stafi-ratom,stargaze,starname,stride,teritori,terra-luna,terrausd,terrakrw,white-whale,terra-luna-2,umee,unification,vidulum'

const getRecords = async () => {
    const res = await graphqlReq({
        method: "POST",
        data: {
            query: `
                query{
                    getRecords {
                        data {
                            date,
                            rewards,
                            available_asset,
                            total_asset
                        }
                    }
                }
              `
        },
    })
    return res.data
}

const port = 3002


const formatData = async (list) => {
    let formatList = []
    if (list.length >= 2) {
        for (let i = 0; i < list.length; i++) {
            let change_in_24h = 0
            let token_gain_in_24h = 0
            let token_change_in_24h 
            if (i >= 1) {
                change_in_24h = list[i].total_asset - list[i - 1].total_asset
                const { changeList, changeSum } = await getRewardsDiff(JSON.parse(list[i].rewards), JSON.parse(list[i - 1].rewards))
                token_change_in_24h = changeList
                token_gain_in_24h = changeSum
            }
            formatList.unshift({
                date: list[i].date,
                rewards: JSON.parse(list[i].rewards),
                list_token_change_in_24h: token_change_in_24h,
                'token_gain_in_24h (usd)': token_gain_in_24h,
                'available_asset (usd)': list[i].available_asset,
                'total_asset (usd)': list[i].total_asset,
                'asset_change_in_24h (usd)': change_in_24h,
            })
        }
    }
    else {
        list.forEach(e => {
            formatList.unshift({
                ...e,
                rewards: JSON.parse(e.rewards)
            })
        });
    }
    return formatList
}

var fetchCounter = Math.floor(Date.now() / 1000), price

const getRewardsDiff = async (reward_1, reward_2) => {
    let changeList = {}
    let changeSum = 0
    const tokenList_1 = getTotal(reward_1)
    const tokenList_2 = getTotal(reward_2)
    console.log(fetchCounter)
    if ((Math.floor(Date.now() / 1000) - fetchCounter) % 120 === 0 || price === undefined) {
        price = await axios.get(queryString)
        fetchCounter = Math.floor(Date.now() / 1000)
    }
    const usdRates = price.data
    for (let key in tokenList_1) {
        let tokenChangeList = {}
        for (let k in tokenList_1[key]) {
            const id = denomToId[k]
            tokenChangeList[k] = {}
            const rate = usdRates[id] ? (usdRates[id].usd && usdRates[id].usd.value) ? 0 : usdRates[id].usd || 0 : 0
            const amt_1 = tokenList_1[key] ? tokenList_1[key][k] ? tokenList_1[key][k] : 0 : 0
            const amt_2 = tokenList_2[key] ? tokenList_2[key][k] ? tokenList_2[key][k] : 0 : 0
            const diff = amt_1 - amt_2
            tokenChangeList[k].amount = diff
            tokenChangeList[k].usd = (diff * rate).toFixed(2)
            changeSum += diff * rate
        }
        changeList[key] = tokenChangeList
    }
    return { changeList, changeSum }
}

const getTotal = (reward) => {
    let tokenList = {}
    for (const index in reward) {
        let denomList = {}
        reward[index].total.reward && reward[index].total.reward.length > 0 && reward[index].total.reward.map(re => {
            if (!denomList[re.denom] || denomList[re.denom] === null) {
                denomList[re.denom] = 0
            }
            denomList[re.denom] += parseFloat(re.amount)
        })
        reward[index].total.commission && reward[index].total.commission.length > 0 && reward[index].total.commission.map(com => {
            if (!denomList[com.denom] || denomList[com.denom] === null) {
                denomList[com.denom] = 0
            }
            denomList[com.denom] += parseFloat(com.amount)
        })
        reward[index].total.stake_amount && reward[index].total.stake_amount.length > 0 && reward[index].total.stake_amount.map(stake => {
            if (!denomList[stake.denom] || denomList[stake.denom] === null) {
                denomList[stake.denom] = 0
            }
            denomList[stake.denom] += parseFloat(stake.amount)
        })
        tokenList[index] = denomList
    }
    return tokenList
}

app.get('/', async (_, res) => {
    try {
        const { data } = await getRecords()
        const rewards = data !== null && data.getRecords && data.getRecords !== null && data.getRecords.data
        if (rewards !== null) {
            res.json({
                data: await formatData(rewards)
            })
        }
        else {
            res.status(404).send({
                err: "data not found"
            })
        }
    }
    catch (e) {
        console.log(e.message)
        res.status(400).send({
            err: e.message
        })
    }
})

app.listen(port, async () => {
    console.log(`Example app listening on port ${port}`)
})
