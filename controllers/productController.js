const productModel = require('../models/productModel');
const cloudinary = require('../utils/cloudinary')
const fs = require('fs')
const validator = require('fastest-validator')

// Create a new product
const createProduct = async (req, res) => {
    try {
        const { name, price } = req.body;
        const imageUrls = [];
        const publicIds = [];
        if (req.files && req.files.images) {
            for (const image of req.files.images) {
                const file = await cloudinary.uploader.upload(image.path, { folder: 'Class-Drill' });
                imageUrls.push(file.secure_url);
                publicIds.push(file.public_id);
                await fs.unlinkSync(image.path);
            }
        }

        let avatarUrl;
        if (req.files && req.files.avatar) {
            const avatarFile = await cloudinary.uploader.upload(req.files.avatar[0].path, { folder: 'Class-Drill' });
            avatarUrl = avatarFile.secure_url;
            await fs.unlinkSync(req.files.avatar[0].path);
        } else {
            // Handle the case when the avatar field is missing
            return res.status(400).json({
                Error: "Avatar image is required.",
            });
        }

        const product = new productModel({
            name,
            price,
            avatar: avatarUrl,
            images: imageUrls,
            public_id: publicIds,
        });
        
        // validate users input using the fastest-validtor
        const validateSchema = {
            name: { type: "string", optional: false, min: 4, max: 50 },
            price: { type: "number", optional: false, min: 3, max: 9999000000 },
            avatar: { type: "string", optional: false, max: 1 },
            images: { type: "array", items: "string", optional: false }
        };
        const v = new validator();
        const validation = v.validate(req.body, validateSchema)
        if (!validation) {
            res.status(400).json({
                message: 'Error trying to validate',
                Error: validation[0].message
            })
            return;
        }

        // save  the corresponding input into the database
        const savedProduct = await product.save()
        if (!savedProduct) {
            res.status(400).json({
                message: 'Product not created'
            })
        } else {
            res.status(201).json({
                message: 'Product created successfully',
                data: savedProduct
            })
        }
    } catch (error) {
        res.status(500).json({
            Error: error.message
        })
    }
}

// Get all products
const getAll = async (req, res) => {
    try {
        const allProducts = await productModel.find()
        if (allProducts.length === null) {
            res.status(200).json({
                message: 'There are no products in this databse'
            })
        } else {
            res.status(200).json({
                message: `List of all products in this databse`,
                data: allProducts,
                totalProducts: `The total number of products are ${allProducts.length}`
            })
        }
    } catch (error) {
        res.status(500).json({
            Error: error.message
        })
    }
}


// Getting one product
const getOne = async (req, res) => {
    try {
        const productId = req.params.id
        const oneProduct = await productModel.findById(productId)

        if (!oneProduct) {
            res.status(404).json({
                message: `Product with id: ${productId} not found`
            })
        } else {
            res.status(200).json({
                message: 'Product information displaying',
                data: oneProduct
            })
        }
    } catch (error) {
        res.status(500).json({
            Error: error.message
        })
    }
}

// updating a product
const updateProduct = async (req, res) => {
    try {
      const productId = req.params.id;
      const product = await productModel.findById(productId);
  
      if (!product) {
        return res.status(404).json({
          message: `Product with id: ${productId} not found`,
        });
      }
  
      const { name, price } = req.body;
      const data = {
        name: name || product.name,
        price: price || product.price,
      };
  
      // handles the image update
      if (req.files && req.files.images) {
        const updatedImageUrls = [];
        const updatedPublicIds = [];
  
        // delete existing images in Cloudinary
        for (const publicId of product.public_id) {
          await cloudinary.uploader.destroy(publicId);
        }
  
        // upload new images and store their URLs and public IDs
        for (const image of req.files.images) {
          const file = await cloudinary.uploader.upload(image.path, { folder: 'Class-Drill' });
          updatedImageUrls.push(file.secure_url);
          updatedPublicIds.push(file.public_id);
          await fs.unlinkSync(image.path);

        }
  
        // Replace the image URLs and public IDs with the updated ones
        data.images = updatedImageUrls;
        data.public_id = updatedPublicIds;
      }

      if (req.files && req.files.avatar) {
            const avatarPublicId = product.avatar.split('/').pop().split('.')[0]
            await cloudinary.uploader.destroy(avatarPublicId)

            const avatarFile = await cloudinary.uploader.upload(req.files.avatar[0].path, { folder: 'Class-Drill' });
            data.avatar = avatarFile.secure_url;
            await fs.unlinkSync(req.files.avatar[0].path);
        } 
  
      const updatedProduct = await productModel.findByIdAndUpdate(productId, data, { new: true });
  
      if (updatedProduct) {
        res.status(200).json({
          message: `Product successfully updated`,
          data: updatedProduct,
        });
      } else {
        res.status(400).json({
          message: 'Can not update product',
        });
      }
    } catch (error) {
      res.status(500).json({
        Error: error.message,
      });
    }
  };
  


// deleting a product
const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id
        const product = await productModel.findById(productId)
        if (!product) {
            res.status(404).json({
                message: `Product with id: ${productId} not found`
            })
        } else {
            
            for (const publicId of product.public_id) {
                await cloudinary.uploader.destroy(publicId);
              }

            const avatarPublicId = product.avatar.split('/').pop().split('.')[0]
            console.log(avatarPublicId)
            await cloudinary.uploader.destroy(avatarPublicId)
            
            const deletedProduct = await productModel.findByIdAndDelete(productId)
            if (deletedProduct) {
                res.status(200).json({
                    message: `Product successfully deleted`,
                    data: deletedProduct
                })
            } else {
                res.status(400).json({
                    message: 'Can not delete product'
                })
            }
        }
    } catch (error) {
        res.status(500).json({
            Error: error.message
        })
    }
}










module.exports = {
    createProduct,
    getAll,
    getOne,
    updateProduct,
    deleteProduct,
}