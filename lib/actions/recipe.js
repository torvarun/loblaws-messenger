/* jshint esversion:6, node: true */

/*
 * Loblaws Messenger - recipe.js
 *
 * Recipe search handler.
 */

const request = require('request'),
      net_handler   = require('../net_handler.js');

function requestRecipe(sender, query) {
    console.log("[INFO] " + sender + ": Requested search for recipe with query: \'" + query + "\'");

    // Produces URL to make search request with Loblaws
    let url = 'https://community-food2fork.p.mashape.com/search?key=9a266ac158d1966f7a00f043259f2c5e&q=';
    url = url.concat(query.trim());

    // Array to be sent with request
    let options = {
        url: url,
        headers: {
            'X-Mashape-Key': 'RNsZ2tiy2pmshxmPkPRrn6viHrUwp1UZ22BjsnbuPVLyEnTS57',
            'Accept': 'application/json'
        }
    };

    // Send the search request
    request(options, function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            let results = JSON.parse(body);

            //console.log(body);
            console.log("[INFO] " + "Received response from product query with: " + results.count + " results");

            if (results.count !== 0) {
                sendRecipeResults(results.recipes);
            } else {
                sendTextMessage(sender, "There are no results for that search.");
            }
        }
    });

    net_handler.currentState = net_handler.State.IDLE;
}

function sendRecipeResults(recipes, sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": loadRecipeElements(recipes) // Load the products into an object that messenger api can handle
            }
        }
    };

    if (net_handler.sendFBRequest(sender, messageData)) {
        console.log("[INFO] " + sender + ": Sent recipe results");
    }
}

function loadRecipeElements(recipes) {
    let elements = []; // Create blank array
    let length = recipes.length > 10 ? 10 : recipes.length;

    for (let i = 0; i < length; i++) {
        let element = {
            "title": recipes[i].title, // Sets title
            "subtitle": recipes[i].publisher, // Sets description
            "image_url": recipes[i].image_url, // Sets image
            "buttons": [
                {
                    "type": "postback",
                    "title": "Let's make this!",
                    "payload": "recipeSelected - " + recipes[i].recipe_id
                },{
                    "type": "web_url",
                    "title": "More Info",
                    "url": recipes[i].source_url
                }
            ]
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
    requestRecipe: requestRecipe
};
