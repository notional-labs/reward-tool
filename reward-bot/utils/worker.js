const { storeRecord } = require('./store')
const { getAsset } = require('./query')

class Bot {
    constructor() {
        this.timeStamp = new Date(Date.now())
        this.active = true
        this.isLock = false
    }

    lock() {
        this.isLock = true
    }

    unlock() {
        console.log(this.isLock)
        this.isLock = false
    }

    async work() {
        // if(this.checkNewMonth(currentDate)) {
        //     wipeData()
        // }
        if (this.checkNewDay(this.timeStamp)) {
            console.log("running...")
            let result = await getAsset()
            this.timeStamp = new Date(Date.now())
            await storeRecord(result)
        }
    }
    checkNewDay(dateLast) {
        const current = new Date(Date.now())
        if (current.getDate() == dateLast.getDate()) {
            //it's the same day
            return false
        } else {
            //another day, so midnight has passed
            return true
        }
    }

    checkNewMonth(dateLast) {
        const current = new Date()
        if (current.getMonth() == dateLast.getMonth()) {
            //it's the same day
            return false
        } else {
            //another day, so midnight has passed
            return true
        }
    }
}

module.exports = Bot