const validator = require('validator')
const mongoose = require('mongoose')


let UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            validate: (value) => {
                return validator.isEmail(value)
            }
        },
        password: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }

    },
    {
        collection: "NotesApp",
        versionKey: false
    }
)

let userModel = mongoose.model("NotesApp", UserSchema)
module.exports = { userModel }