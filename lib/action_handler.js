/* jshint esversion:6, node: true */

const search = require('./actions/search.js');
const receipe = require('./actions/receipe.js');
const cart_handler = require('./cart_handler.js');
const prompt = require('./prompt.js');

var currentPrompt;

function start() {
    currentPrompt = new prompt.Prompt('welcome', "Hello! I'm the Loblaws Messenger bot!");
    currentPrompt = new prompt.Prompt('prompt', "You can search for a product, search for a receipe, or order a product from a product barcode. Say \'Search\', \'Receipe\', or just send a picture of a barcode.", ['search, receipe']);
}

/*
 * Handles received text messages.
 *
 * Arguments:
 *   message (String): The message received.
 */
function handleMessage(message) {
    // TODO NLP could go here..

    if (isNull(currentPrompt) || currentPrompt.getID() === 'prompt') {
        switch (message) {
            case 'search':
                search.requestSearch();
                break;
            case 'receipe':
                receipe.requestReceipe();
                break;
        }
    }
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

module.exports = {
    currentPrompt: currentPrompt,
    handleMessage: handleMessage
};
