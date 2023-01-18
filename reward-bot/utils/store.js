const fs = require('fs');
const { formatReward } = require('./formatter')
const {createRecords} = require('./query')

function store (newData, callback) {
    fs.readFile('./data.json', async (err, data) => {
        if (err) {
            console.log(err.message)
        }
        let obj = JSON.parse(data)
        const {newRewards, sum} = await formatReward(newData)
        setTimeout(() => {
            console.log('saving ...')
            obj.recent_save = new Date(Date.now()).toString()
            obj.data.unshift({
                date: new Date(Date.now()).toString(),
                rewards: newRewards,
                total: sum.toFixed(2)
            })
            obj.report = ""
            fs.writeFile('./data.json', JSON.stringify(obj, null, 2), err => {
                if (err) {
                    console.log(err.message)
                }
                callback()
            })
        }, 10000)
    });
}

const storeRecord = async (newData) => {
    const {newRewards, sum} = await formatReward(newData)
    await createRecords(JSON.stringify(newRewards), parseInt(sum))
}

module.exports.store = store
module.exports.storeRecord = storeRecord

module.exports.wipeData = () => {
    fs.readFile('./data.json', (err, data) => {
        if (err) {
            console.log(err.message)
        }
        let obj = JSON.parse(data)
        obj.recent_save = new Date(Date.now()).toString()
        obj.data = []
        obj.report = ""
        fs.writeFile('./data.json', JSON.stringify(obj, null, 2), err => {
            if (err) {
                console.log(err.message)
            }
        })
    });
}