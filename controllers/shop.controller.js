const Product = require("../models/product.model");
const Order = require("../models/order.model");
const cookieParser = require("../util/cookieparser");
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const ZarinpalCheckout = require("zarinpal-checkout");

const merchantId = process.env.ZARINPAL_MERCHANT_ID;
const zarinpal = merchantId ? ZarinpalCheckout.create(merchantId, true) : null;
const ITEMS_PER_PAGE = 2;
let totalItems;

exports.getHome = (req, res, next) => {
  const pageNumber = Number(req.query.page) || 1;
  Product.find()
    .count()
    .then((productsNum) => {
      totalItems = productsNum;
      return Product.find()
        .skip((pageNumber - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((p) => {
      res.render("shop/index", {
        pageTitle: "Home",
        path: "/",
        prods: p,
        isAuthenticated: req.session.isLoggedIn,
        totalProducts: totalItems,
        currentPage: pageNumber,
        hasNextPage: ITEMS_PER_PAGE * pageNumber < totalItems,
        hasPreviousPage: pageNumber > 1,
        nextPage: pageNumber + 1,
        previousPage: pageNumber - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
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
  const pageNumber = Number(req.query.page) || 1;
  Product.find()
    .count()
    .then((productsNum) => {
      totalItems = productsNum;
      return Product.find()
        .skip((pageNumber - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((p) => {
      res.render("shop/product-list", {
        pageTitle: "Products",
        path: "/products",
        prods: p,
        isAuthenticated: req.session.isLoggedIn,
        totalProducts: totalItems,
        currentPage: pageNumber,
        hasNextPage: ITEMS_PER_PAGE * pageNumber < totalItems,
        hasPreviousPage: pageNumber > 1,
        nextPage: pageNumber + 1,
        previousPage: pageNumber - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
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
        refId: req.flash("refId")[0],
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  const invoiceName = "invoice-" + orderId + ".pdf";

  const invoicePath = path.join("public", "invoices", invoiceName);

  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("Order not Found!"));
      }

      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("Unauthorized"));
      }

      const pdfDoc = new PDFDocument();
      pdfDoc.pipe(fs.createWriteStream(invoicePath));

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "inline;filename='" + invoiceName + "'",
      );
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text("Invoices", {
        underline: true,
      });
      pdfDoc.text("---------------------");

      let totalPrice = 0;
      order.products.forEach((p) => {
        totalPrice += p.quantity * p.product.price;

        pdfDoc.text(p.quantity + " x " + p.product.price + " $");
      });
      pdfDoc.text("Total Price: " + totalPrice);
      pdfDoc.end();

      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) {
      //     return next(err);
      //   }

      //   res.setHeader("Content-Type", "application/pdf");
      //   res.setHeader(
      //     "Content-Disposition",
      //     "inline;filename='" + invoiceName + "'",
      //   );
      //   res.send(data);
      // });

      // const file = fs.createReadStream(invoicePath);
      // res.setHeader("Content-Type", "application/pdf");
      // res.setHeader(
      //   "Content-Disposition",
      //   "inline;filename='" + invoiceName + "'",
      // );
      // file.pipe(res);
    })
    .catch((err) => next(err));
};

exports.getCheckout = async (req, res, next) => {
  const userProducts = await req.user.populate("cart.items.productId");
  const products = userProducts.cart.items;
  let totalPrice = 0;
  products.forEach((p) => {
    totalPrice += p.quantity * p.productId.price;
  });
  res.render("shop/checkout", {
    pageTitle: "Checkout",
    path: "/checkout",
    products: userProducts.cart.items,
    isAuthenticated: req.session.isLoggedIn,
    totalSum: totalPrice,
  });
};

exports.getPayment = async (req, res, next) => {
  if (!zarinpal) {
    return res.status(503).send("Payment service is not configured.");
  }

  const userProducts = await req.user.populate("cart.items.productId");
  const products = userProducts.cart.items;
  let totalPrice = 0;
  products.forEach((p) => {
    totalPrice += p.quantity * p.productId.price;
  });

  zarinpal
    .PaymentRequest({
      Amount: totalPrice,
      CallbackURL: "http://localhost:3000/checkPayment",
      Description: "تست اتصال به درگاه پرداخت",
      Email: userProducts.email,
      Mobile: "09xxxxxxxxx",
    })
    .then((response) => {
      res.redirect(response.url);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.checkPayment = async (req, res, next) => {
  if (!zarinpal) {
    return res.status(503).send("Payment service is not configured.");
  }

  const authority = req.query.Authority;
  const status = req.query.Status;

  const userProducts = await req.user.populate("cart.items.productId");
  const products = userProducts.cart.items;
  let totalPrice = 0;
  products.forEach((p) => {
    totalPrice += p.quantity * p.productId.price;
  });

  if (status == "OK") {
    zarinpal
      .PaymentVerification({
        Amount: totalPrice,
        Authority: authority,
      })
      .then((response) => {
        if (response.status == 100) {
          req.user
            .populate("cart.items.productId")
            .then((user) => {
              const products = user.cart.items.map((i) => {
                return {
                  quantity: i.quantity,
                  product: { ...i.productId._doc },
                };
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
              req.flash('refId',response.refId)
              res.redirect("/orders");
            })
            .catch((err) => {
              const error = new Error(err);
              error.httpStatusCode = 500;
              return next(error);
            });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } else if(status == "NOK") {
    res.redirect('/cart');
  }
};
