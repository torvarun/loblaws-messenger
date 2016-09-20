/* jshint esversion:6, node: true */

/*
 * Loblaws Messenger - recipe.js
 *
 * Recipe search handler.
 */

const index = require('../index.js');
const request = require('request');
const action_handler = require('../action_handler.js');

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
            let recipes = JSON.parse(body).recipes;

            //console.log(body);
            console.log("[INFO] " + "Received response from product query with: " + results.count + " results");

            if (results.count !== 0) {
                sendRecipeResults(recipes);
            } else {
                action_handler.sendTextMessage(sender, "There are no results for that search.");
            }
        }
    });

    action_handler.currentState = action_handler.State.IDLE;
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

	// Send the rec
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

function loadRecipeElements(recipes) {
	let elements = []; // Create blank array

	console.log("Length: " + recipes.length);

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
					"payload": "recipeSelected - " + recipes[i].recipe_id,
				},{
					"type": "web_url",
					"title": "More Info",
					"url": recipes[i].source_url,
				}
			],
		};

		elements.push(element); // Add the element to the array
	}

	return elements;
}

module.exports.requestRecipe = requestRecipe;
