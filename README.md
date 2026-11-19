# CodeYad Online Shop

An e-commerce course project built with Express, EJS templates, and MongoDB via Mongoose. It includes a product catalog, cart, checkout, order history and invoices, account flows, and product-management screens. The code also includes email and a payment sandbox integration.

## Run locally

1. Start a local MongoDB instance.
2. Copy `.env.example` to `.env`. Set `SESSION_SECRET` to a randomly generated secret and adjust the MongoDB host, database, and port for your local setup.
3. Run `npm ci`, then `node app.js` from the repository root.
4. Open `http://localhost:3000` or the port you selected.

Treat this as a local course project. Email and payment flows require separate development configuration and service accounts.

Create an account through the signup page. Configure `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM` to send email. Set `ZARINPAL_MERCHANT_ID` to your sandbox merchant ID to use the payment example.

## License

The [ISC License](LICENSE) covers MrEshrati's original code and documentation, consistent with `package.json`. CodeYad course materials, third-party starter code, and bundled media are outside this grant.
