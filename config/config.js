require('dotenv').config()
const mongoose = require('mongoose')

const username = process.env.ATLAS_USERNAME
const password = process.env.ATLAS_PASSWORD
const url = `mongodb+srv://${username}:${password}@cluster0.wxuoeen.mongodb.net/profile`
// const url = 'mongodb://localhost/'
mongoose.connect( url ).then( () => {
    console.log('Database is successfully connected.')
} ).catch( (e) => {
    console.log(e.message)
});