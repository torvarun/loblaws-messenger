/* jshint esversion:6, node: true */

/*
 * Loblaws Messenger - action_handler.js
 *
 * Handles incoming data from the user sent to the server.
 */

const index = require('./index.js');
const request = require('request');
const search = require('./actions/search.js');
const recipe = require('./actions/recipe.js');
const cart = require('./cart_handler.js');

let State = {
	IDLE: 0,
	WAITING_FOR_SEARCH_TYPE: 1, // The server is waiting search selection (ie product or recipe)
	WAITING_FOR_PRODUCT: 2, // The server is waiting product search
	WAITING_FOR_RECIPE: 3 // The server is waiting recipe search
};

let currentState = State.IDLE;

/* Hanldes when a user sends a message. */
function handleMessageReceive(sender, text) {
	console.log("[EVENT] " + sender + ": Received message from user: \'" + text + "\'");

	// If the user has requested to search for product by name..
	if (currentState == State.WAITING_FOR_PRODUCT) {
		search_handler.requestProduct(sender, text);

	// If the user has requested to search for a recipe..
	} else if (currentState == State.WAITING_FOR_RECIPE) {
		recipe_handler.requestRecipe(sender, text);


	} else if (currentState == State.IDLE) {
		promptUserSearch(sender);
	}
}

/* Hanldes when a user pressed a button. */
function handleButton(sender, payload) {
	console.log("[EVENT] " + sender + ": Received postback (button click) from user");
	console.log("[EVENT] " + sender + ":     -> postback data: " + payload);

	if (payload.includes("recipeSelected")) {
		loadIngredients(payload);
		ingredientsActive = true;
	}

	switch (payload) {
		case "searchProduct":
			console.log("[EVENT] " + sender + ": Requested to search for products by name");
			sendTextMessage(sender, "Please enter a product name to search for");
			action_handler.currentState = action_handler.State.WAITING_FOR_PRODUCT;
			break;

		case "searchRecipe":
			console.log("[EVENT] " + sender + ": Requested to search for recipes");
			sendTextMessage(sender, "Search by recipe");
			action_handler.currentState = action_handler.State.WAITING_FOR_RECIPE;
			break;
	}
}

/* Prompts the user to select the type of search (ie product or recipe). */
function promptUserSearch(sender) {
	let messageData = {
		"attachment": {
			"type": "template",
			"payload": {
				"template_type": "button",
				"text": "How would you like to search?",
				"buttons": [
					{
						"type": "postback",
						"title": "By Product",
						"payload": "searchProduct",
					}, {
						"type": "postback",
						"title": "By Recipe",
						"payload": "searchRecipe",
					}
				]
	  		}
		}
	};

	console.log("[INFO] " + sender + ": Greeted bot");

	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: { access_token: index.AUTH_TOKEN },
		method: 'POST',
		json: {
			recipient: { id:sender },
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

module.exports = {
	handleMessageReceive: handleMessageReceive,
	handleButton: handleButton,
    sendTextMessage: sendTextMessage
};
