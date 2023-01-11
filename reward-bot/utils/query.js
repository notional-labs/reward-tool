const { setupDistributionExtension, QueryClient } =  require("@cosmjs/stargate");
const { Tendermint34Client } = require("@cosmjs/tendermint-rpc");
const { chainData } = require('../storage/chainData')

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
            catch(e) {
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
