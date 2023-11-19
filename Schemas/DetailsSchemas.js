const mongoose = require('mongoose')



let DetailsSchemas = new mongoose.Schema(
    {
        title: String,
        content: String,
        dob:String,
        createdAt: {
            type: Date,
            default: Date.now
        }

    },
    {
        collection: "user",
        versionKey: false
    }
)

let detailsModel = mongoose.model('user', DetailsSchemas)
module.exports = { detailsModel }