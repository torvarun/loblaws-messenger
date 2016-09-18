/* jshint esversion:6, node: true */

const action_handler = require('../action_handler.js');

function requestSearch() {
    action_handler.currentPrompt = new Prompt('search', "What are you looking for?");
}

module.exports.requestSearch = requestSearch;
