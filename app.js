const express = require("express")
const {getCategories} = require("./controllers")

const app = express()

app.use(express.json())

app.get(`/api/categories`, getCategories)

app.use(`/*`, (req, res) => {
    res.status(404)
    .send({message: "not found"})
})

module.exports = app