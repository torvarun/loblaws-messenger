/* jshint esversion:6, node: true */

const action_handler = require('../action_handler.js');

function requestReceipe() {
    action_handler.currentPrompt = new Prompt('receipe', "What are you looking for?");
}

module.exports.requestReceipe = requestReceipe;
