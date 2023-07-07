const express = require('express')
const router = express.Router()
const upload  = require('../utils/multer')
const { createProduct, getAll, getOne, updateProduct, deleteProduct,  } = require('../controllers/productController')

router.post('/product', upload.fields([{name: 'images', min: 3}, {name: 'avatar', maxCount: 1}]), createProduct)

router.get('/product', getAll)

router.get('/product/:id', getOne)

router.patch('/product/:id', upload.fields([{name: 'images', min: 3}, {name: 'avatar', maxCount: 1}]), updateProduct)

router.delete('/product/:id', deleteProduct)



module.exports = router