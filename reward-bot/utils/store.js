const { formatReward } = require('./formatter')
const {createRecords} = require('./query')

const storeRecord = async (newData) => {
    try{
        const {newRewards, sum, avaliable} = await formatReward(newData)
        console.log(newRewards)
        await createRecords(JSON.stringify(newRewards), sum, parseInt(avaliable))
    }
    catch (e) {
        console.log(e.message)
    }
}

module.exports.storeRecord = storeRecord
