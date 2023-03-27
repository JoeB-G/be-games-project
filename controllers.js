const { fetchCategories } = require("./models")

exports.getCategories = (req, res) => {
    fetchCategories().then((response) => {
        res.status(200).send({categories: response})
    })
}