/* jshint esversion:6, node: true */

'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();

app.set('port', (process.env.PORT || 5000));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// parse application/json
app.use(bodyParser.json());

// index
app.get('/', function (req, res) {
	res.send('hello world i am a secret bot');
});

// for facebook verification
app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
		res.send(req.query['hub.challenge']);
	} else {
		res.send('Error, wrong token');
	}
});

// to post data
app.post('/webhook/', function (req, res) {
	var results;

	let messaging_events = req.body.entry[0].messaging;
	for (let i = 0; i < messaging_events.length; i++) {
		let event = req.body.entry[0].messaging[i];
		let sender = event.sender.id;
		//requestSearchType(sender);

		if (event.message && event.message.text) {
			let text = event.message.text;
			if (text == 'Generic') {
				sendGenericMessage(sender);
				continue;
			}
			else if(text == 'hi' || text =='hey'){
				requestSearchType(sender);
				continue;
			}
			else if (text.includes("product: ")){
				var headers = {
				    'Authorization': 'bearer fd887ce5-7b15-4c1e-93a0-dc91ce883ec6'
				};

				//Extract the search key
				var str = text.replace('product: ',' ');
				console.log(str);
				var url = 'https://www.loblaws.ca/ecommerce/v2/loblaw/products/search?q=';
				url = url.concat(str.trim(), '&page=0&pageSize=10&sort=recommended');
				console.log(url);

				var options = {
				    url: url,
				    headers: headers
				};
				function callback(error, response, body) {
				    if (!error && response.statusCode == 200) {
				        console.log(body);
				        var resp = JSON.parse(body);
				        results = resp["searchResults"];
				        console.log(results[0]);
				        console.log(results.products.totalNumberOfResults);

				        if(results.products.totalNumberOfResults != 0)
							sendProductMessage(sender, results);
						else{
							sendTextMessage(sender, "There are no results for that search.", token);
						}
				    }
				}

				request(options, callback);

			}
			//sendTextMessage(sender, "echo: " + text.substring(0, 200));
		}
		if (event.postback) {
			switch(JSON.stringify(event.postback)){
				case "searchProduct":
					sendTextMessage(sender, "Search by product", token);
					break;
				case "searchRecipe":
					sendTextMessage(sender, "Search by recipe", token);
					break;
				case "searchBarcode":
					sendTextMessage(sender, "Search by barcode", token);
					break;	
			}
			continue;
		}
	}
	res.sendStatus(200);
});

//Request for product, image, or recipe search
function requestSearchType(sender){
	let messageData = {
		
		"attachment": {
			"type": "template",
			"payload":{
		        "template_type":"button",
		        "text":"What do you want to do next?",
		        "buttons":[
		          {
			        "type":"postback",
			        "title":"By Product",
			        "payload":"searchProduct",
			      },
			      {
			        "type":"postback",
			        "title":"By Recipe",
			        "payload":"searchRecipe",
			      },
			      {
			      	"type":"postback",
			      	"title": "By Barcode",
			      	"payload": "searchBarcode"
			      }
        		]
      		}
		}
	};

	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: sender,
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


// recommended to inject access tokens as environmental variables, e.g.
const token = process.env.PAGE_ACCESS_TOKEN;
//const token = "<PAGE_ACCESS_TOKEN>"

function sendTextMessage(sender, text) {
	let messageData = { text:text };

	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
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
				}]
			}
		}
	};



	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
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
				/*"elements": [{
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
				}] */
			}
		}
	};

	//Send message
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
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
function loadElements(products){
	var elements = []; //Create blank array

	console.log("Length: " + products.length);

	for (var i = 0; i < products.length; i++){
		var element = {
			"title": products[i].productName, //Sets title
			"subtitle": products[i].description, //Sets description
			"image_url": products[i].primaryImage, //Sets image
		};

		elements.push(element); //Add the element to the array
	}

	return elements;
}

// Start the server
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'));
});
