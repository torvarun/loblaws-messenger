/* jshint esversion:6, node: true */

/*
 * Loblaws Messenger - search.js
 *
 * Product search hander.
 */

const index = require('../index.js');
const request = require('request');

function requestProduct(sender, query) {
    console.log("[EVENT] " + sender + ": Requested search for product with query: \'" + query + "\'");

    // Produces URL to make search request with Loblaws
    let url = 'https://www.loblaws.ca/ecommerce/v2/loblaw/products/search?q=';
    url = url.concat(query.trim(), '&page=0&pageSize=10&sort=recommended');

    // Array to be sent with request
    let options = {
        url: url,
        headers: {
            'Authorization': 'bearer fd887ce5-7b15-4c1e-93a0-dc91ce883ec6'
        }
    };

    // Send the search request
    request(options, function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            let results = JSON.parse(body).searchResults;

            console.log("[INFO] " + "Received response from product query with: " + results.pagination.totalNumberOfResults + " results");
            //console.log(results[0]);
            //console.log(body);

            if (results.pagination.totalNumberOfResults !== 0) {
                sendProductMessage(sender, results);
            } else {
                action_handler.sendTextMessage(sender, "There are no results for that search.");
            }
        }
    });

    action_handler.currentState = action_handler.State.IDLE;
}

module.exports.requestProduct = requestProduct;
