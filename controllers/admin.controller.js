const Product = require("../models/product.model");
const cookieParser = require("../util/cookieparser");
const { validationResult } = require("express-validator");

exports.getProducts = (req, res) => {
  Product.find({
    userid: req.user._id,
  })
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getAddProduct = (req, res) => {
  res.render("admin/add-product", {
    path: "/admin/add-product",
    pageTitle: "Add Product",
    editing: false,
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.postAddProduct = (req, res) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {

    return res.render("admin/add-product", {
      path: "/admin/add-product",
      pageTitle: "Add Product",
      editing: false,
      isAuthenticated: req.session.isLoggedIn,
      
    });
  }

  const newProduct = new Product({
    title: title,
    price: price,
    imageUrl: imageUrl,
    description: description,
    userId: req.user,
  });

  newProduct.save().then((result) => {
    console.log("Product Created");
    res.redirect("/");
  });
};

exports.getEditProduct = (req, res) => {
  const editMode = req.query.edit;

  if (!editMode) {
    return res.redirect("/");
  }

  const prodId = req.params.productId;

  Product.findById(prodId)
    .then((p) => {
      if (!p || p.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }

      res.render("admin/add-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: p,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postEditProduct = (req, res) => {
  const prodId = req.body.productId;

  const updatedTitle = req.body.title;
  const updatedImageUrl = req.body.imageUrl;
  const updatedPrice = req.body.price;
  const updatedDescription = req.body.description;

  Product.findById(prodId).then((p) => {
    if (p.userId.toString() !== req.user._id.toString()) {
      return res.redirect("/");
    }
    p.title = updatedTitle;
    p.description = updatedDescription;
    p.price = updatedPrice;
    p.imageUrl = updatedImageUrl;

    return p.save().then((r) => {
      console.log("Product Updated");
      res.redirect("/");
    });
  });
};

exports.deleteProduct = (req, res) => {
  const prodId = req.body.productId;

  Product.deleteOne({ _id: prodId, userId: req.user._id })
    .then((result) => {
      console.log("Product Deleted");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};
