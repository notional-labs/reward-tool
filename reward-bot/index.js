const Bot = require('./utils/worker')

const bot = new Bot()

const run = async () => {
    while (bot.active) {
       await bot.work()
    }
}

run()

