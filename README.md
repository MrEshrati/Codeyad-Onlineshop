# CodeYad Online Shop

An e-commerce course project built with Express, EJS templates, and MongoDB via Mongoose. It includes a product catalog, cart, checkout, order history and invoices, account flows, and product-management screens. The code also includes email and a payment sandbox integration.

## Run locally

1. Start a local MongoDB instance.
2. Create a local `.env` and set `HOST` to your MongoDB host and port, such as `127.0.0.1:27017`, and `DATABASE_NAME` to your development database. Set `PORT` if you need a port other than `3000`.
3. Run `npm ci`, then `node app.js` from the repository root.
4. Open `http://localhost:3000` or the port you selected.

Treat this as a local course project. Email and payment flows require separate development configuration and service accounts.
