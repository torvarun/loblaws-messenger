/* jshint esversion:6, node: true, loopfunc: true */

const action_handler = require('./action_handler.js');

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();

// Token used to send messages.
const AUTH_TOKEN = process.env.PAGE_ACCESS_TOKEN;

var productSearchActive = false;
var recipeSearchActive = false;
var ingredientsActive = false;

var sendTo;

// Set the port
app.set('port', (process.env.PORT || 5000));

// Server configuration
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set handler for page root
console.log("[INFO] Express: Initializing \'/\' (root) hanlder");
app.get('/', function(req, res) {
	res.send('hello world i am a secret bot');
});

// Set handler for facebook verification
console.log("[INFO] Express: Initializing \'/webhook\' for facebook verification");
app.get('/webhook/', function(req, res) {
	if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
		res.send(req.query['hub.challenge']);
	} else {
		res.send('Error, wrong token');
	}
});

/*
persistentMenuSetup();

function persistentMenuSetup() {
	console.log("entered persistent menu setup");

	request({
		url: 'https://graph.facebook.com/v2.6/me/thread_settings?access_token=' + token,
		method: 'POST',
		json: {
			setting_type: "call_to_actions",
			thread_state: "existing_thread",
			call_to_actions: [
				{
				  type: "postback",
				  title: "By Product",
				  payload: "searchProduct"
				}, {
				  type: "postback",
				  title: "By Recipe",
				  payload: "searchRecipe"
				}, {
				  type: "web_url",
				  title: "By Barcode",
				  payload: "searchBarcode"
				}
			]
		}
	}, function(error, response, body) {
		//console.log(response);

		if (error) {
			console.log('Error sending messages: ', error);
		} else if (response.body.error) {
			console.log('Error: ', response.body.error);
		}
	}
})

*/
/*

	var headers = { 'Content-Type': 'application/json' };

	console.log("IN OPTIONS FOR PERSISTENT MENU SETUP");

	var options = {
		url: 'https://graph.facebook.com/v2.6/me/thread_settings?access_token=PAGE_ACCESS_TOKEN',
		method: 'POST',
		headers: headers,
		body: JSON.stringify({
			"setting_type": "call_to_actions",
			"thread_state": "existing_thread",
			"call_to_actions": [
				{
					"type": "postback",
					"title": "By Product",
					"payload": "searchProduct",
				},
				{
					"type": "postback",
					"title": "By Recipe",
					"payload": "searchRecipe",
				},
				{
					"type": "postback",
					"title": "By Barcode",
					"payload": "searchBarcode"
				}
			]
		})
	};

	request(options, function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log(body);
			console.log("IN CALLBACK");
		}
	});
}
*/

// Set handler for webhook events
console.log("[INFO] Express: Initializing \'/webhook\' for webhook notifications.");
app.post('/webhook/', function(req, res) {
	let messaging_events = req.body.entry[0].messaging;

	for (let i = 0; i < messaging_events.length; i++) {
		let event = req.body.entry[0].messaging[i];
		let sender = event.sender.id;

		sendTo = sender;
		//requestSearchType(sender);

		// If the event is a message & contains a message..
		if (event.message && event.message.text) {
			let text = event.message.text;
			sendTo = { id: sender };

			console.log("[EVENT] " + sender + ": Received message from user: \'" + text + "\'");

			// If the user has requested to search for product by name..
			if (productSearchActive && text != 'Please enter a product name to search for') {
				console.log("[EVENT] " + sender + ": Requested search for product with query: \'" + text + "\'");

				// Produces URL to make search request with Loblaws
				let url = 'https://www.loblaws.ca/ecommerce/v2/loblaw/products/search?q=';
				url = url.concat(text.trim(), '&page=0&pageSize=10&sort=recommended');

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

						console.log("[INFO] " + "Received response from product query with: " + results.products.totalNumberOfResults + " results");
						//console.log(results[0]);
						//console.log(body);

						if (results.products.totalNumberOfResults !== 0) {
							sendProductMessage(sender, results);
						} else {
							sendTextMessage(sender, "There are no results for that search.", AUTH_TOKEN);
						}
					}
				});

				productSearchActive = false;

			// If the user has requested to search for a recipe..
			} else if (recipeSearchActive && text != 'Search by recipe') {
				console.log("[INFO] " + sender + ": Requested search for recipe with query: \'" + text + "\'");

				// Produces URL to make search request with Loblaws
				let url = 'https://community-food2fork.p.mashape.com/search?key=9a266ac158d1966f7a00f043259f2c5e&q=';
				url = url.concat(text.trim());

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
							sendRecipeMessage(recipes);
						} else {
							sendTextMessage(sender, "There are no results for that search.", AUTH_TOKEN);
						}
					}
				});

				recipeSearchActive = false;

			// If the user has requested a generic messsage..
			} else if (text == 'Generic') {
				console.log("[INFO] " + sender + ": Requested generic product message");
				sendGenericMessage(sender);

			// If the user has greeted the bot..
			} else if (text.toLowerCase().includes('hi') || text.toLowerCase() == 'hey' || text.toLowerCase().includes('hello')) {
				console.log("[INFO] " + sender + ": Greeted bot");
				requestSearchType(sender);
			}

		// If the event is a postback (ie button click)..
		} else if (event.postback) {
			console.log("[EVENT] " + sender + ": Received postback (button click) from user");
			console.log("[EVENT] " + sender + ":     \\-> postback data: " + event.postback);

			if (event.postback.payload.includes("recipeSelected")) {
				loadIngredients(event.postback.payload);
				ingredientsActive = true;
			}

			switch (event.postback.payload) {
				case "searchProduct":
					console.log("[EVENT] " + sender + ": Requested to search for products by name");
					sendTextMessage(sender, "Please enter a product name to search for", AUTH_TOKEN);
					productSearchActive = true;
					break;

				case "searchRecipe":
					console.log("[EVENT] " + sender + ": Requested to search for recipes");
					sendTextMessage(sender, "Search by recipe", AUTH_TOKEN);
					recipeSearchActive = true;
					break;

				case "searchBarcode":
					console.log("[EVENT] " + sender + ": Requested to search for product by barcode");
					sendTextMessage(sender, "Search by barcode", AUTH_TOKEN);
					break;
			}
		}
	}

	// Send success response
	res.sendStatus(200);
});

function loadIngredients(id) {
	var ingredients;

	id = id.replace("recipeSelected - ", "");
	console.log("id", id);

	var headers1 = {
		'X-Mashape-Key': 'RNsZ2tiy2pmshxmPkPRrn6viHrUwp1UZ22BjsnbuPVLyEnTS57',
		'Accept': 'application/json'
	};

	var options = {
		url: 'https://community-food2fork.p.mashape.com/get?key=9a266ac158d1966f7a00f043259f2c5e&rId=' + id,
		headers: headers1
	};

	console.log('https://community-food2fork.p.mashape.com/get?key=9a266ac158d1966f7a00f043259f2c5e&rId=' + id);

	request(options, function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log(body);
			var resp = JSON.parse(body);
			var resps = resp.recipe;
			console.log(resps);
			ingredients = resps.ingredients;
			console.log(ingredients[0]);
			console.log(ingredients.count);

			if (ingredients.count !== 0) {
				displayIngredients(ingredients);
			} else {
				sendTextMessage(sender, "There are no results for that search.", AUTH_TOKEN);
			}
		}
	});
}

function displayIngredients(ingredients) {
	var items = [];
	var headers = {
		'Authorization': 'bearer fd887ce5-7b15-4c1e-93a0-dc91ce883ec6'
	};

	for (let i = 0; i < ingredients.length; i++) {
		var url = 'https://www.loblaws.ca/ecommerce/v2/loblaw/products/search?q=';
		url = url.concat(ingredients[i].split(' ').slice(2).join(' '), '&page=0&pageSize=10&sort=recommended');

		console.log(url);

		var options = {
			url: url,
			headers: headers
		};

		request(options, function callback(error, response, body) {
			if (!error && response.statusCode == 200) {
				console.log(body);
				var resp = JSON.parse(body);
				var results = resp.searchResults;
				console.log(results[0]);
				console.log(results.products.totalNumberOfResults);

				if(results.products.totalNumberOfResults !== 0) {
					console.log("SINGLE ITEM: ", results[0]);
					items.push(results[0]);
				}
				else{
					sendTextMessage(sendTo, "There are no results for that search.", AUTH_TOKEN);
				}
			}
		});
	}

	console.log("Items: ", items);
	showIngredients(items);
}

function showIngredients(ingredients) {
	let messageData = {
		"attachment": {
			"type": "template",
			"payload": {
				"template_type": "generic",
				"elements": loadElements(ingredients) // Load the products into an object that messenger api can handle
			}
		}
	};

	// Send message
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: { access_token: AUTH_TOKEN },
		method: 'POST',
		json: {
			recipient: sendTo,
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

function sendRecipeMessage(recipe) {
	let messageData = {
		"attachment": {
			"type": "template",
			"payload": {
				"template_type": "generic",
				"elements": loadRecipeElements(recipe) // Load the products into an object that messenger api can handle
			}
		}
	};

	// Send message
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: { access_token: AUTH_TOKEN },
		method: 'POST',
		json: {
			recipient: sendTo,
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
	var elements = []; // Create blank array

	console.log("Length: " + recipes.length);

	let length = recipes.length > 10 ? 10 : recipes.length;

	for (var i = 0; i < length; i++) {
		var element = {
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

// Request for product, image, or recipe search
function requestSearchType(sender) {
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
					}, {
						"type": "postback",
						"title": "By Barcode",
						"payload": "searchBarcode"
					}
				]
	  		}
		}
	};

	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: { access_token: AUTH_TOKEN },
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

// To handle picture receive.
app.post('/webhook/', function (req, res) {
	var results;
	let messaging_events = req.body.entry[0].messaging;

	for (let i = 0; i < messaging_events.length; i++) {
		let event = req.body.entry[0].messaging[i];
		let sender = event.sender.id;

		if (event.message && event.message.attachment && event.message.attachment.type === 'image') {
			let image_url = event.message.attachment.paylod.url;

			action_handler.handlePicture(image_url, sender);
		}
	}

	res.sendStatus(200);
});

function sendTextMessage(sender, text) {
	let messageData = { text: text };

	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: { access_token: AUTH_TOKEN },
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

function sendGenericMessage(sender) {
	let messageData = {
		"attachment": {
			"type": "template",
			"payload": {
				"template_type": "generic",
				"elements": [{
					"title": "First card",
					"subtitle": "Element #1 of an hscroll",
					"image_url": "http://messengerdemo.parseapp.com/img/rift.png",
					"buttons": [
						{
							"type": "web_url",
							"url": "https://www.messenger.com",
							"title": "web url"
						}, {
							"type": "postback",
							"title": "Postback",
							"payload": "Payload for first element in a generic bubble",
						}
					],
				}, {
					"title": "Second card",
					"subtitle": "Element #2 of an hscroll",
					"image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
					"buttons": [{
						"type": "postback",
						"title": "Postback",
						"payload": "Payload for second element in a generic bubble",
					}],
				}]
			}
		}
	};

	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: { access_token: AUTH_TOKEN },
		method: 'POST',
		json: {
			recipient: { id: sender },
			message: messageData,
		}
	}, function(error, response, body) { // Callback
		if (error) {
			console.log('Error sending messages: ', error);
		} else if (response.body.error) {
			console.log('Error: ', response.body.error);
		}
	});
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
				"elements": loadElements(results.products), //Load the products into an object that messenger api can handle
				/*"elements": [
					{
						"title": results.products[0].productName,
						"subtitle": results.products[0].description,
						"image_url": results.products[0].primaryImage,
						"buttons": [{
							"type": "web_url",
							"url": "https://www.messenger.com",
							"title": "web url"
						}, {
							"type": "postback",
							"title": "Postback",
							"payload": "Payload for first element in a generic bubble",
						}],
					}, {
						"title": "Second card",
						"subtitle": "Element #2 of an hscroll",
						"image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
						"buttons": [{
							"type": "postback",
							"title": "Postback",
							"payload": "Payload for second element in a generic bubble",
						}],
					}
				] */
			}
		}
	};

	//Send message
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: { access_token: AUTH_TOKEN },
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
	var elements = []; // Create blank array

	console.log("Length: " + products.length);

	for (var i = 0; i < products.length; i++){
		var element = {
			"title": products[i].productName, // Sets title
			"subtitle": products[i].description, // Sets description
			"image_url": products[i].primaryImage, // Sets image
		};

		elements.push(element); //Add the element to the array
	}

	return elements;
}

// Start the server
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'));
});
