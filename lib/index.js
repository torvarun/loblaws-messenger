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

		if (event.message && event.message.text) {
			let text = event.message.text;
			if (text === 'Generic') {
				sendGenericMessage(sender);
				continue;
			}

			else if (text == 'cookies'){
				var headers = {
				    'Authorization': 'bearer fd887ce5-7b15-4c1e-93a0-dc91ce883ec6'
				};

				var options = {
				    url: 'https://www.loblaws.ca/ecommerce/v2/loblaw/products/search?q=apple&page=0&pageSize=10&sort=recommended&filters=category:LSL001006000000',
				    headers: headers
				};
				function callback(error, response, body) {
				    if (!error && response.statusCode == 200) {
				        //console.log(body);
				        var resp = JSON.parse(body);
				        results = resp["searchResults"];
				        console.log(results[0]);
				        console.log(results.products[0].productName);

				        sendProductMessage(sender, results);
				    }
				}

				request(options, callback);

			}
			sendTextMessage(sender, "echo: " + text.substring(0, 200));
		}
		if (event.postback) {
			let text = JSON.stringify(event.postback);
			sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token);
			continue;
		}
	}
	res.sendStatus(200);
});


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

function sendProductMessage(sender, results) {
	let messageData = {
		"attachment": {
			"type": "template",
			"payload": {
				"template_type": "generic",
				"elements": loadElements(results.products)
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

function loadElements(products){
	var elements = [];

	console.log("Length: " + products.length);

	for (var i = 0; i < products.length; i++){
		var element = {
			"title": products[i].productName,
			"subtitle": products[i].description,
			"image_url": products[i].primaryImage,
		}

		elements.push(element);
	}

	return elements;
}

// spin spin sugar
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'));
});
