const Bot = require('./utils/worker')

require('dotenv').config()
rpcString = process.env.RPC_INTERNAL

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const bot = new Bot()

sleep(1000).then(async () => {
    while (1) {
       await bot.work()
    }
});


