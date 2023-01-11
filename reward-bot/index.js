const Bot = require('./utils/worker')

require('dotenv').config()
rpcString = process.env.RPC_INTERNAL

const bot = new Bot()

const run = async () => {
    while (bot.active) {
       await bot.work()
    }
}

run()


