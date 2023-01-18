const { setupDistributionExtension, QueryClient } = require("@cosmjs/stargate");
const { Tendermint34Client } = require("@cosmjs/tendermint-rpc");
const { chainData } = require('../storage/chainData')
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
                            total
                        }
                    }
                }
              `
        },
    })
    return res.data
}

module.exports.createRecords = async (dataString, total) => {
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
                            total: ${total}
                        }
                    ) {
                            date,
                            rewards,
                            total
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
        for (let key in chainData) {
            try {
                const rpc = rpcs[chainData[key].id]
                let res = await getRewards(rpc, chainData[key].address)
                assets[`${chainData[key].name}`] = res
            }
            catch (e) {
                assets[`${chainData[key].name}`] = {}
                assets[`${chainData[key].name}`].err = e.message
            }
        }
        return assets
    }
    catch (e) {
        console.log(e.message)
    }
}

