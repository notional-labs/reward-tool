const fs = require('fs');
const { formatReward } = require('./formatter')

module.exports.store = (newData) => {
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
            })
        }, 10000)
    });
}

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