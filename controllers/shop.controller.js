const Product = require("../models/product.model");
const Order = require("../models/order.model");
const cookieParser = require("../util/cookieparser");

exports.getHome = (req, res, next) => {
  Product.find()
    .then((p) => {
      res.render("shop/index", {
        pageTitle: "Home",
        path: "/",
        prods: p,
        isAuthenticated: req.session.isLoggedIn,
        // csrfToken: req.csrfToken(),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((p) => {
      res.render("shop/product-list", {
        pageTitle: "Products",
        path: "/products",
        prods: p,
        isAuthenticated: req.session.isLoggedIn,
        // csrfToken: req.csrfToken(),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;

  Product.findById(prodId)
    .then((p) => {
      res.render("shop/product-details", {
        product: p,
        pageTitle: p.title,
        path: "/products",
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res) => {
  const prodId = req.body.productId;

  Product.findById(prodId).then((product) => {
    req.user.addTocart(product);

    res.redirect("/cart");
  });
};

exports.getCart = async (req, res) => {
  const userProducts = await req.user.populate("cart.items.productId");
  res.render("shop/cart", {
    pageTitle: "Cart",
    path: "/cart",
    products: userProducts.cart.items,
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.postRemovefromCart = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });

      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user._id,
        },
        products: products,
      });

      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        pageTitle: "Orders",
        path: "/orders",
        orders: orders,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
