/* jshint esversion:6, node: true */

var search = require('./actions/search.js');
var receipe = require('./actions/receipe.js');
var picture = require('./actions/picture.js');

const cart = new Cart();
var currentPrompt;

function start() {
    currentPrompt = new Prompt('welcome', "Hello! I'm the Loblaws Messenger bot!");
    currentPrompt = new Prompt('prompt', "You can search for a product, search for a receipe, or order a product from a product barcode. Say \'Search\', \'Receipe\', or just send a picture of a barcode.", ['search, receipe']);
}

/*
 * Handles received messages.
 *
 * Arguments:
 *   message (String): The message received.
 */
function handleMessage(message) {
    if (isNull(currentPrompt) || currentPrompt.getID() === 'prompt') {
        switch (message) {
            case 'search':
                search.requestSearch();
                break;
            case 'receipe':
                receipe.requestReceipe();
                break;
            case 'picture':
                picture.requestProduct();
        }
    }
}

function isNull(obj) {
    return !(obj && obj !== 'null' && obj !== 'undefined');
}

start();

modules.exports.currentPrompt = currentPrompt;
