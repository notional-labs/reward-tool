const { formatReward } = require('./formatter')
const {createRecords} = require('./query')

const storeRecord = async (newData) => {
    try{
        const {newRewards, sum} = await formatReward(newData)
        await createRecords(JSON.stringify(newRewards), parseInt(sum))
    }
    catch (e) {
        console.log(e.message)
    }
}

module.exports.storeRecord = storeRecord
