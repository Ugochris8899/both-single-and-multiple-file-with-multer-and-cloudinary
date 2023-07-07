const express = require('express')
require('./config/config')
const productRouter = require('./routes/productRouter')
const PORT = 2025

const app = express()
app.use(express.json())
app.use('/uploads', express.static('uploads'))


app.use('/api', productRouter)

app.listen(PORT, () => {
        console.log(`Server is listening to port: ${PORT}`);
})