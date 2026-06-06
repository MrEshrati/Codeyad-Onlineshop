const Product = require("../models/product.model");
const Order = require("../models/order.model");
const cookieParser = require("../util/cookieparser");

exports.getHome = (req, res) => {
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
    .catch((e) => {
      console.log(e);
    });
};

exports.getProducts = (req, res) => {
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
    .catch((e) => {
      console.log(e);
    });
};

exports.getProduct = (req, res) => {
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
      console.log(err);
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

exports.postRemovefromCart = (req, res) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postOrder = (req, res) => {
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
      console.log(err);
    });
};

exports.getOrders = (req, res) => {
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
      console.log(err);
    });
};
