/* jshint esversion:6, node: true */

const action_handler = require('../action_handler.js');

function requestProduct() {
    action_handler.currentPrompt = new Prompt('receipe', "Looking up barcode..");
    
}
