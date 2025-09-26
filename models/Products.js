//Core Module
const path = require("path");
//Local Modules
const db = require("../utils/dataBaseUtils");
const rootDir = require("../utils/pathUtils");
const { table } = require("console");

module.exports = class Products {
  constructor(
    id,
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
  ) {
    // console.log("Constructor called");
    this.id = id ? id : null;
    this.product_name = product_name ? product_name : "";

    this.short_description = short_description ? short_description : "";

    this.long_description = long_description ? long_description : "";

    this.regular_price = regular_price;

    this.sale_price = sale_price;
    this.taxable = taxable ? taxable : "No";
    this.tax_class = tax_class ? tax_class : "";
    this.sku = sku ? sku : "";
    this.gtin = gtin ? gtin : "";
    this.stock_status = stock_status ? stock_status : "In Stock";
    this.quantity = quantity ? quantity : 10;
    this.order_limit = order_limit ? order_limit : "";
    this.delivery_charge = delivery_charge;
    this.upsell = upsell ? upsell : "";
    this.cross_sell = cross_sell ? cross_sell : "";
    this.sizes = sizes ? sizes : "";
    this.colors = colors ? colors : "";
    this.purchase_note = purchase_note ? purchase_note : "";
    this.product_image = product_image ? product_image : "";
    this.product_gallery = product_gallery ? product_gallery : "";
    this.category = category ? category : "";
    this.attributes = attributes ? attributes : "";
    this.tags = tags ? tags : "";
    this.brand = brand ? brand : "";

    this.sub_brand = sub_brand ? sub_brand : "";
    this.image_name = image_name ? image_name : "",
      this.gallery_name = gallery_name ? gallery_name : "",
      this.user_id = user_id ? user_id : ""
  }

  save() {
    db.execute(
      `INSERT INTO products (
      product_id,
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
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        this.id,
        this.product_name,
        this.short_description ? this.short_description : "",
        this.long_description ? this.long_description : null,
        Number(this.regular_price),
        Number(this.sale_price),
        this.taxable ? this.taxable : "No",
        this.tax_class ? this.tax_class : null,
        this.sku ? this.sku : null,
        this.gtin ? this.gtin : null,
        this.stock_status ? this.stock_status : "In Stock",
        this.quantity ? this.quantity : 10,
        this.order_limit ? this.order_limit : null,
        this.delivery_charge ? this.delivery_charge : 0,
        this.upsell ? this.upsell : null,
        this.cross_sell ? this.cross_sell : null,
        this.sizes ? this.sizes : null,
        this.colors ? this.colors : null,
        this.purchase_note ? this.purchase_note : null,
        this.product_image ? this.product_image : null,
        this.product_gallery ? JSON.stringify(this.product_gallery) : null,
        this.category ? this.category : null,
        this.attributes ? this.attributes : null,
        this.tags ? this.tags : null,
        this.brand ? this.brand : null,
        this.sub_brand ? this.sub_brand : null,
        this.image_name ? this.image_name : null,
        this.gallery_name ? JSON.stringify(this.gallery_name) : null,
        this.user_id ? this.user_id : null,
      ]
    );
  }
  update() {
    return db.execute(
      `UPDATE products SET product_name=?, short_description=?,long_description=?, regular_price=?, sale_price=?, taxable=?,tax_class=?,sku=?,gtin=?,stock_status=?,quantity=?,order_limit=?,delivery_charge=?,upsell=?,cross_sell=?,sizes=?,colors=?,purchase_note=?,product_image=?, product_gallery=?,category=?,attributes=?, tags=?,brand=?,sub_brand=?, image_name =?, gallery_name=?, user_id = ? WHERE product_id = ?`,
      [
        this.product_name,
        this.short_description ? this.short_description : "",
        this.long_description ? this.long_description : null,
        Number(this.regular_price),
        Number(this.sale_price),
        this.taxable ? this.taxable : "No",
        this.tax_class ? this.tax_class : null,
        this.sku ? this.sku : null,
        this.gtin ? this.gtin : null,
        this.stock_status ? this.stock_status : "In Stock",
        this.quantity ? this.quantity : 10,
        this.order_limit ? this.order_limit : null,
        this.delivery_charge ? this.delivery_charge : 0,
        this.upsell ? this.upsell : null,
        this.cross_sell ? this.cross_sell : null,
        this.sizes ? this.sizes : null,
        this.colors ? this.colors : null,
        this.purchase_note ? this.purchase_note : null,
        this.product_image ? this.product_image : null,
        this.product_gallery ? JSON.stringify(this.product_gallery) : null,
        this.category ? this.category : null,
        this.attributes ? this.attributes : null,
        this.tags ? this.tags : null,
        this.brand ? this.brand : null,
        this.sub_brand ? this.sub_brand : null,
        this.image_name ? this.image_name : null,
        this.gallery_name ? JSON.stringify(this.gallery_name) : null,
        this.user_id ? this.user_id : null,
        this.id,
      ]
    );
  }
  static fetchAll() {
    return db.execute("SELECT * FROM products");
  };

  static delete(id) {
    return db.execute(`DELETE FROM products WHERE product_id = ?`, [id]);
  }

  static findById(id) {
    // console.log("ID",id, typeof id);
    return db.execute(`SELECT * FROM products WHERE product_id = ?`, [id])
  }

  static findByUser(id) {
    return db.execute(`SELECT * FROM products WHERE user_id = ?`, [id]);
  }
};

// let x = [product_name=?, short_description=?,long_description=?, regular_price=?, sale_price=?, taxable=?,tax_class=?,sku=?,gtin=?,stock_status=?,quantity=?,order_limit=?,delivery_charge=?,upsell=?,cross_sell=?,sizes=?,colors=?,purchase_note=?,product_image=?, product_gallery=?,category=?,attributes=?, tags=?,brand=?,sub_brand=?]