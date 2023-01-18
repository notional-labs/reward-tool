const express = require('express')
const app = express()
const axios = require('axios')

require('dotenv').config()

const graphqlReq = axios.create({
    baseURL: "https://graphql.fauna.com/graphql",
    headers: {
        Authorization: `Bearer ${process.env.FAUNADB_SECRET}`,
    },
});

const getRecords = async () => {
    const res = await graphqlReq({
        method: "POST",
        data: {
            query: `
                query{
                    getRecords {
                        data {
                            date,
                            rewards,
                            total
                        }
                    }
                }
              `
        },
    })
    return res.data
}

const port = 3002

const formatData = (list) => {
    let formatList = []
    list.forEach(e => {
        formatList.unshift({
            ...e,
            rewards: JSON.parse(e.rewards)
        })
    });

    return formatList
}

app.get('/', async (_, res) => {
    try{
        const { data } = await getRecords()
        const rewards = data !== null && data.getRecords && data.getRecords !== null && data.getRecords.data
        if (rewards !== null) {
            res.json({
                data: formatData(rewards)
            })
        }
        else {
            res.status(404).send({
                err: "data not found"
            })
        }
    }
    catch (e) {
        res.status(400).send({
            err: e.message
        })
    }
})

app.listen(port, async () => {
    console.log(`Example app listening on port ${port}`)
})
