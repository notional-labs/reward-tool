const express = require('express')
const app = express()
const fs = require('fs');

const port = 3002

app.get('/', (_, res) => {
    fs.readFile('../reward-bot/data.json', (err, data) => {
        if (err) {
            res.json({
                err: 'fail to fetch data: ' + err.message
            })
        }
        const result = JSON.parse(data)
        res.json(result)
    });
})

app.listen(port, async () => {
    console.log(`Example app listening on port ${port}`)
})
