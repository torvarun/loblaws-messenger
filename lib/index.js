/* jshint esversion:6, node: true, loopfunc: true */

/*
 * Loblaws Messenger - index.js
 *
 * Program entry point.
 */
const express    = require('express'),
      bodyParser = require('body-parser'),
      app        = express();

const action_handler = require('./action_handler.js');

// The ID of the page
const PAGE_ID = "1798728427077717";

// Set the port
app.set('port', (process.env.PORT || 5000));

// Server configuration
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

console.log("[INFO] Starting Loblaws-Messenger..");

// Set handler for page root
console.log("[INFO] Express: Initializing \'/\' (root) handler");
app.get('/', function(request, response) {
    response.send('hello world i am a secret bot');
});

// Set handler for facebook verification
console.log("[INFO] Express: Initializing \'/webhook\' for facebook verification");
app.get('/webhook/', function(request, response) {
    if (response.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
        response.send(request.query['hub.challenge']);
    } else {
        response.send('Error, wrong token');
    }
});

// Set handler for webhook events
console.log("[INFO] Express: Initializing \'/webhook\' for webhook notifications");
app.post('/webhook/', function(request, response) {
    let messaging_events = response.body.entry[0].messaging;

    for (let i = 0; i < messaging_events.length; i++) {
        let event = response.body.entry[0].messaging[i];
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
    console.log('[INFO] Express: Started server, running on port:', app.get('port'));
});
