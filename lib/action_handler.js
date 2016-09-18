/* jshint esversion:6, node: true */

const search = require('./actions/search.js');
const receipe = require('./actions/receipe.js');
const picture = require('./actions/picture.js');

const cart = new Cart();
const objects = require('./objects.js');

const cart = new objects.Cart();
var currentPrompt;

function start() {
    currentPrompt = new Prompt('welcome', "Hello! I'm the Loblaws Messenger bot!");
    currentPrompt = new Prompt('prompt', "You can search for a product, search for a receipe, or order a product from a product barcode. Say \'Search\', \'Receipe\', or just send a picture of a barcode.", ['search, receipe']);
}

/*
 * Handles received text messages.
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

/*
 * Receives picture information from index.js.
 *
 * Arguments:
 *   picture_url (String): URL to the picture that was sent.
 *   sender (String): ID of the user who sent the picture.
 */
function handlePicture(picture_url, sender) {

}

/*
 * Checks if the object is null.
 *
 * Arguments:
 *   obj (Object): The object to check.
 */
function isNull(obj) {
    return !(obj && obj !== 'null' && obj !== 'undefined');
}

start();

modules.exports.currentPrompt = currentPrompt;
modules.exports.handlePicture = handlePicture;
