const { fetchCategories } = require("./models")

exports.getCategories = (req, res, next) => {
    fetchCategories().then((response) => {
        res.status(200).send({categories: response})
    })
    // .catch((err) => {
    //     console.log(err)
    // })
}