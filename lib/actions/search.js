/* jshint esversion:6, node: true */

/*
 * Loblaws Messenger - search.js
 *
 * Product search hander.
 */

const request = require('request'),
      state   = require('../state.js'),
      index   = require('../index.js');

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
                sendTextMessage(sender, "There are no results for that search.");
            }
        }
    });

    console.log(state.currentState);
    console.log(state.State);
    console.log(state.State.IDLE);
    state.currentState = state.State.IDLE;
}

/*
 * Results is the api response
 * Makes a carouel displaying tile, description, and image
 */
function sendProductMessage(sender, results) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": loadElements(results.products) //Load the products into an object that messenger api can handle
            }
        }
    };

    //Send message
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: index.AUTH_TOKEN },
        method: 'POST',
        json: {
            recipient: { id: sender },
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
}

/*
 * Load products into an array that can be handled by messenger api
 * Makes carousel as long as number of responses
 */
function loadElements(products) {
    let elements = []; // Create blank array

    console.log("Length: " + products.length);

    for (let i = 0; i < products.length; i++){
        let element = {
            "title": products[i].productName, // Sets title
            "subtitle": products[i].description, // Sets description
            "image_url": products[i].primaryImage, // Sets image
        };

        elements.push(element); //Add the element to the array
    }

    return elements;
}

/* Sends a text emesssage to the user. */
function sendTextMessage(sender, text) {
    let messageData = { text: text };

    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: index.AUTH_TOKEN },
        method: 'POST',
        json: {
            recipient: { id: sender },
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
}

module.exports.requestProduct = requestProduct;
