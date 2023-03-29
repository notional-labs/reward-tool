const { setupDistributionExtension, QueryClient, setupStakingExtension } = require("@cosmjs/stargate");
const { Tendermint34Client } = require("@cosmjs/tendermint-rpc");
const { chainData, data } = require('../storage/chainData')
const axios = require('axios')

require('dotenv').config()
const rpcString = process.env.RPC_INTERNAL

const graphqlReq = axios.create({
    baseURL: "https://graphql.fauna.com/graphql",
    headers: {
        Authorization: `Bearer ${process.env.FAUNADB_SECRET}`,
    },
});

const getRewards = async (rpc, address) => {
    try {
        const tendermint = await Tendermint34Client.connect(rpc)
        const baseQuery = new QueryClient(tendermint)
        const extension = setupDistributionExtension(baseQuery)
        const res = await extension.distribution.delegationTotalRewards(address)
        return res
    }
    catch (e) {
        throw e
    }
}

const getCommision = async (rpc, address) => {
    try {
        const tendermint = await Tendermint34Client.connect(rpc)
        const baseQuery = new QueryClient(tendermint)
        const extension = setupDistributionExtension(baseQuery)
        const res = await extension.distribution.validatorCommission(address)
        return res
    }
    catch (e) {
        throw e
    }
}

const getSelfStake = async (rpc,address) => {
    try {
        const tendermint = await Tendermint34Client.connect(rpc)
        const baseQuery = new QueryClient(tendermint)
        const extension = setupStakingExtension(baseQuery)
        const res = await extension.staking.delegatorDelegations(address)
        return res
    }
    catch (e) {
        throw e
    }
}

module.exports.getRecords = async () => {
    const res = await graphqlReq({
        method: "POST",
        data: {
            query: `
                query{
                    getRecords {
                        data {
                            id,
                            date,
                            rewards,
                            total_asset,
                            available_asset
                        }
                    }
                }
              `
        },
    })
    return res.data
}

module.exports.createRecords = async (dataString, total, avaliable) => {
    const current = new Date(Date.now())
    const res = await graphqlReq({
        method: "POST",
        data: {
            query: `
                mutation{
                    createRecord(
                        data: {
                            date: "${current.toString()}",
                            rewards: """${dataString}""",
                            total_asset: ${total},
                            available_asset: ${avaliable}
                        }
                    ) {
                            date,
                            rewards,
                            total_asset,
                            available_asset
                    }
                }
              `
        },
    })
    return res.data
}


module.exports.getAsset = async () => {
    try {
        let assets = {}
        const rpcs = rpcString.split(',')
        for (let key in data) {
            try {
                const rpc = rpcs[data[key].id]
                assets[`${data[key].name}`] = {}
                let res = await getRewards(rpc, data[key].address)
                assets[`${data[key].name}`].reward = res
                if (data[key].valAddr) {
                    let res = await getCommision(rpc, data[key].valAddr)
                    assets[`${data[key].name}`].commission = res.commission && res.commission.commission
                }
                let stakingRes = await getSelfStake(rpc, data[key].address)
                assets[`${data[key].name}`].stake_amount = stakingRes.delegationResponses
            }
            catch (e) {
                assets[`${data[key].name}`] = {}
                assets[`${data[key].name}`].err = e.message
            }
        }
        return assets
    }
    catch (e) {
        console.log(e.message)
    }
}

