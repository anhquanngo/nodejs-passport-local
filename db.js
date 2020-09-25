const mongoose = require('mongoose')
mongoose.Promise = global.Promise

mongoose.connect("mongodb://localhost/auth")

const userSchema = new mongoose.Schema({
    id: String,
    name: String,
    email: String
})
const user = mongoose.model('user', userSchema, 'user')

module.exports = user