/* jshint esversion:6, node: true, loopfunc: true */

const action_handler = require('./action_handler.js');
const search_handler = require('./actions/search.js');
const receipe_handler = require('./actions/receipe.js');

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();

// Token used to send messages.
const AUTH_TOKEN = process.env.PAGE_ACCESS_TOKEN;
// The ID of the page
const PAGE_ID = "1798728427077717";

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

// Set handler for webhook events
console.log("[INFO] Express: Initializing \'/webhook\' for webhook notifications.");
app.post('/webhook/', function(req, res) {
	let messaging_events = req.body.entry[0].messaging;

	for (let i = 0; i < messaging_events.length; i++) {
		let event = req.body.entry[0].messaging[i];
		let sender = event.sender.id;

		// If the event is a message & contains a message & the sender of the message
		// is not the bot itself..
		if (event.message && event.message.text && sender !== PAGE_ID) {
			action_handler.handleMessageReceive(sender, event.message.text);

		// If the event is a postback (ie button click)..
		} else if (event.postback) {
			action_handler.handleButton(sender, event.postback.payload);
		}
	}

	// Send success response
	res.sendStatus(200);
});

// Start the server
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'));
});

module.exports.AUTH_TOKEN = AUTH_TOKEN;
