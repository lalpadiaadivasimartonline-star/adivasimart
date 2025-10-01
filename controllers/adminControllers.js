//Core Modules
const path = require('path');
const fs = require('fs');
//Local Modules
const Products = require("../models/Products");
const rootDir = require('../utils/pathUtils');
const { console } = require('inspector');
const Users = require('../models/Users');
const Order = require('../models/Orders');



exports.postAddProduct = async (req, res, next) => {
  // console.log("SESSION : ", req.sessionID);
  // console.log("USER ID : ", req.session.userId);
  
try {
  const {
    product_name,
    short_description,
    long_description,
    regular_price,
    sale_price,
    taxable,
    tax_class,
    sku,
    gtin,
    stock_status,
    quantity,
    order_limit,
    delivery_charge,
    upsell,
    cross_sell,
    sizes,
    colors,
    purchase_note,
    // product_image,
    // product_gallery,
    category,
    attributes,
    tags,
    brand,
    sub_brand,
    user_id,
  } = req.body;

  let product_image = "";
  let product_gallery = [];
  let image_name = "";
  let gallery_name = [];

  if (req.files && req.files.image && req.files.image.length > 0) {
    const imageFile = req.files.image[0];
    product_image = `/uploads/${req.productFolder}/${imageFile.filename}`;
    image_name = imageFile.filename;
  }

  if (req.files && req.files.gallery && req.files.gallery.length > 0) {
    product_gallery = req.files.gallery.map(
      (file) => `/uploads/${req.productFolder}/${file.filename}`
    );
    gallery_name = req.files.gallery.map(file => file.filename);
  }

  // const gallery_json = JSON.stringify(product_gallery);

  // console.log("Processed product_image:", product_image);
  // console.log("Processed product_gallery:", gallery_json);

  const product = new Products(
    null,
    product_name,
    short_description,
    long_description,
    regular_price,
    sale_price,
    taxable,
    tax_class,
    sku,
    gtin,
    stock_status,
    quantity,
    order_limit === "" ? null : order_limit,
    delivery_charge === "" ? 0 : delivery_charge,
    upsell,
    cross_sell,
    sizes,
    colors,
    purchase_note,
    product_image,
    product_gallery,
    category,
    attributes,
    tags,
    brand,
    sub_brand,
    image_name,
    gallery_name,
    user_id
  );

  await product.save();
  console.log("Product added successfully!");
  res.json({
    success: true,
    message: "Product added successfully!",
    product: product,
    productFolder: req.productFolder,
    uploadedFiles: {
      image: product_image,
      gallery: product_gallery,
    },
  });
  // res.status(201).json(product);
} catch (error) {
  console.log("Error adding product:", error);
  res.json({
    success: false,
    message: "Failed to add product",
    error: error.message,
  });
}
};
  
exports.editProduct = async (req, res, next) => {
  
  //   console.log("=== EDIT PRODUCT DEBUG ===");
  //   console.log("req.method:", req.method);
  //   console.log("req.url:", req.url);
  //   console.log("req.headers['content-type']:", req.headers["content-type"]);
  //   console.log("req.body:", req.body);
  //   console.log("Object.keys(req.body):", Object.keys(req.body || {}));
  //   console.log("req.files:", req.files);
    console.log("req.params:", req.params);
  //   console.log("=== END DEBUG ===");

  try {
    const edit_Id = req.params.product_id;
    console.log("EDIT_ID", edit_Id);
    console.log(req.body)
    const {
      product_name,
      short_description,
      long_description,
      regular_price,
      sale_price,
      taxable,
      tax_class,
      sku,
      gtin,
      stock_status,
      quantity,
      order_limit,
      delivery_charge,
      upsell,
      cross_sell,
      sizes,
      colors,
      purchase_note,
      category,
      attributes,
      tags,
      brand,
      sub_brand,
      hasNewMainImage,
      hasNewGalleryImages,
    } = req.body;

    const existingProduct = await Products.findById(Number(edit_Id));
    if (!existingProduct || !existingProduct[0] || !existingProduct[0][0]) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    const existing = existingProduct[0][0];
    let product_image = existing.product_image;
    let product_gallery = existing.product_gallery;
    let image_name = existing.image_name;
    let gallery_name = existing.gallery_name;
    let user_id = existing.user_id;

    // console.log("EXISTING", existing);
     if (typeof product_gallery === "string") {
       try {
         product_gallery = JSON.parse(product_gallery);
       } catch (e) {
         product_gallery = [];
       }
    }
     if (typeof gallery_name === "string") {
       try {
         gallery_name = JSON.parse(gallery_name);
       } catch (e) {
         gallery_name = [];
       }
     }


    if (req.files && req.files.image && req.files.image.length > 0) {
      const filePath = path.join(rootDir, existing.product_image);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log("DEL_ERROR", err.message);
          return;
        }
        console.log("File Deleted Successfully");
      });
      const imageFile = req.files.image[0];
      product_image = `/uploads/${req.productFolder}/${imageFile.filename}`;
      image_name = imageFile.filename;
    }
    if (req.files && req.files.gallery && req.files.gallery.length > 0) {
      JSON.parse(existing.product_gallery).map(image => {
        const filePath = path.join(rootDir, image);
        fs.unlink(filePath, err => {
          if (err) {
            console.log("ERROR DEL GALLERY", err);
          }
          console.log("Gallery image deleted succesfully");
        })
      })
      product_gallery = req.files.gallery.map(
        (file) => `/uploads/${req.productFolder}/${file.filename}`
      );
      gallery_name = req.files.gallery.map((file) => file.filename);
    }

   
    // Also parse gallery_name if needed
   

    const updatedProduct = new Products(
      edit_Id,
      product_name || existing.product_name,
      short_description || existing.short_description,
      long_description || existing.long_description,
      regular_price || existing.regular_price,
      sale_price || existing.sale_price,
      taxable || existing.taxable,
      tax_class || existing.tax_class,
      sku || existing.sku,
      gtin || existing.gtin,
      stock_status || existing.stock_status,
      quantity || existing.quantity,
      order_limit || existing.order_limit,
      delivery_charge || existing.delivery_charge,
      upsell || existing.upsell,
      cross_sell || existing.cross_sell,
      sizes || existing.sizes,
      colors || existing.colors,
      purchase_note || existing.purchase_note,
      product_image, // Will be existing or new
      product_gallery, // Will be existing or new
      category || existing.category,
      attributes || existing.attributes,
      tags || existing.tags,
      brand || existing.brand,
      sub_brand || existing.sub_brand,
      image_name,
      gallery_name,
      user_id,
    );

    await updatedProduct.update();
    
    res.json({
      success: true,
      message: "Product updated successfully!",
      product: updatedProduct,
      imagesUpdated: {
        mainImage: req.files && req.files.image && req.files.image.length > 0,
        gallery: req.files && req.files.gallery && req.files.gallery.length > 0
      }
    })
    
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update product details",
      error: err.message,
    });
  }
};

exports.getProducts = async (req, res, next) => {
  const [products] = await Products.fetchAll()
  // console.log("========GETPRODUCT====", req.session);
  res.json(products);
};

exports.getProductById = async (req, res, next) => {
  const product_id  = req.params.product_id;
  // console.log("PRODUCTID", product_id, typeof product_id);
  const product = await Products.findById(Number(product_id));
  // console.log("PRODUCT", product);
  res.json(product[0][0]);
};

exports.getProductsByUser = async (req,res, next) => {
  const user_id = req.params.userId;
  // console.log("USER ID HERE", user_id);
  const product = await Products.findByUser(Number(user_id));
  res.json(product[0]);
};

exports.deleteProduct = async (req, res, next) => {
  const delId = req.params.product_id;
  // console.log("DELID", delId);
  const product = await Products.findById(Number(delId));
  product_image = product[0][0].product_image;
  product_gallery = product[0][0].product_gallery;
  const imageFilePath = path.join(rootDir, product_image);
  fs.unlink(imageFilePath, err => {
    if (err) {
      return;
    }
  })
  JSON.parse(product_gallery)?.map(image => {
    const imageFilePath = path.join(rootDir, image);
    fs.unlink(imageFilePath, err => {
      if (err) {
        return;
      }
    })
  })
  await Products.delete(delId);
  res.status(201).json({ _id: delId });
}

exports.getUserData = async (req, res, next) => {
  const userData = await Users.findUserById(req.params.user_id);
  console.log(req.params.user_id, typeof req.params.user_id)
  res.json(userData[0][0]);
}


exports.getOrders = async (req, res, next) => {
  const [rows] = await Order.findOrders(); 
  res.json({ orders: rows });
};

exports.filterOrders = async (req, res, next) => {
  
}




// console.log("REQBODY", req.body);
  // console.log("REQFILE", req.file);
  // console.log("REQFILES", req.files);

  // console.log("=== REQUEST DEBUG ===");
  // console.log("Headers:", req.headers);
  // console.log("Content-Type:", req.headers["content-type"]);
  // console.log("Body keys:", Object.keys(req.body));
  // console.log("File:", req.file);
  // console.log('Product Folder', req.productFolder);
  // console.log("Files:", req.files);
  // console.log("=== END DEBUG ===");