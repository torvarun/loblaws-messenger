// Used for Atom editor
/* jshint esversion: 6, node: true */

'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();

app.set('port', (process.env.PORT || 5000));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Set default index reponse
app.get('/', function (req, res) {
    res.send('LOBLAWS-MESSENGER');
});

// Facebook webhook verification
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === 'loblaws-webhook') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Error, wrong token');
    }
});

// Start the express server
app.listen(app.get('port'), function() {
    console.log('Running on port', app.get('port'));
});

app.post('/webhook', function (req, res) {
    var events = req.body.entry[0].messaging;

    console.log('Received POST to webhook from: ', req.connection.remoteAddress);

    for (var i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.message && event.message.text) {
            sendMessage(event.sender.id, {text: "Echo: " + event.message.text});
        }
        sendMessage(event.sender.id, {text: "This is a response"});
    }

    res.sendStatus(200);
});

function sendMessage(recipientId, message) {
    console.log('Sending message: \'', message.text, '\' to ', recipientId);

    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: 1155120611225431},
            message: message,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
}
