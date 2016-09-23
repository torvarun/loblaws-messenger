/* jshint esversion:6, node: true */

/*
 * Loblaws Messenger - search.js
 *
 * Product search hander.
 */

const request = require('request'),
      net_handler = require('../net_handler.js');

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
        if (error) {
            console.log("[ERROR] " + sender + ": Error sending data (Network): \'" + error + "\'");
            sendTextMessage(sender, "Oh uh! Unfortunetly there was an error searching for your product.");
        } else if (response.statusCode != 200) {
            console.log("[ERROR] " + sender + ": Received response code: " + response.statusCode + " from Loblaws API");
            sendTextMessage(sender, "Oh uh! Unfortunetly there was an error searching for your product.");
        } else {
            let results = JSON.parse(body).searchResults;
            let numberOfResults = results.pagination.totalNumberOfResults;

            console.log("[INFO] " + "Received response from product query with: " + numberOfResults + " results");

            if (numberOfResults !== 0) {
                sendProductMessage(sender, results);
            } else {
                sendTextMessage(sender, "There are no results for that search.");
            }
        }
    });

    // Removes the user from the dictionary.
    delete net_handler.userStates.sender;
}

/*
 * Process the returned Loblaws response, then sends it to the user.
 * Makes a carouel displaying tile, description, and image.
 *   sender (String): The user to be sent to
 *   results (JSON Object): The response from Loblaws
 */
function sendProductMessage(sender, results) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": loadElements(results.products)
            }
        }
    };

    if (net_handler.sendFBRequest(sender, messageData)) {
        console.log("[INFO] " + sender + ": Sent product results");
    }
}

/*
 * Load products into an array that can be handled by messenger API.
 * Makes carousel as long as the number of responses.
 */
function loadElements(products) {
    let elements = []; // Create blank array

    for (let i = 0; i < products.length; i++) {
        let element = {
            "title": products[i].productName, // Sets name
            "subtitle": products[i].description, // Sets description
            "image_url": products[i].primaryImage // Sets image
        };

        elements.push(element); // Add the element to the array
    }

    return elements;
}

/* Sends a text messsage to the user. */
function sendTextMessage(sender, text) {
    let messageData = { text: text };

    if (net_handler.sendFBRequest(sender, messageData)) {
        console.log("[INFO] " + sender + ": Sent message: \'" + text + "\'");
    }
}

module.exports = {
    requestProduct: requestProduct
};
