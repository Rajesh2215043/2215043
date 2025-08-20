# URL Shortener and Logger Microservice

This repo contains a Node.js-based backend project implementing a URL shortener service and a logging microservice. The URL shortener allows users to generate short URLs with customizable codes and set expiry times, and tracks clicks and analytics. The logging microservice is used to send log data to an external API endpoint with authentication.

## Features

* Express.js server for creating and retrieving short URLs.
* Custom or random shortcodes, with expiration control.
* Tracks statistics (clicks, creation and expiry time, referer, IP).
* Logging microservice that posts log data to an evaluation API with Bearer authentication.
* Code organization includes clear routes and error handling.

## Structure

* `/Backend_test_submission` – Main Express server code (server.js)
* `/logging_microservice` – Logger module for centralized logging (logger.js)

## How to Run

* Requires Node.js >=14
* `npm install`
* Run with: `node Backend_test_submission/server.js`
* Environment variables (optional): HOST_BASE, PORT

## Example Usage

* POST /shorturls with `{ "url": "http://example.com", "validity": 60 }`
* Visit generated shortlink to test redirection/tracking

## Author

Rajesh M (GitHub: Rajesh2215043)

## License

[add if any]
