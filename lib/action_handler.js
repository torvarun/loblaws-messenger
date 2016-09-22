/* jshint esversion:6, node: true */

/*
 * Loblaws Messenger - action_handler.js
 *
 * Handles incoming data from the user sent to the server.
 */
const net_handler   = require('./net_handler.js'),
      search  = require('./actions/search.js'),
      recipe  = require('./actions/recipe.js');

/* Hanldes when a user sends a message. */
function handleMessageReceive(sender, text) {
    console.log("[EVENT] " + sender + ": Received message from user: \'" + text + "\'");

    // If the user has requested to search for product by name..
    if (net_handler.currentState == net_handler.State.WAITING_FOR_PRODUCT) {
        search.requestProduct(sender, text);

    // If the user has requested to search for a recipe..
    } else if (net_handler.currentState == net_handler.State.WAITING_FOR_RECIPE) {
        recipe.requestRecipe(sender, text);


    } else if (net_handler.currentState == net_handler.State.IDLE) {
        promptUserSearch(sender);
    }
}

/* Hanldes when a user pressed a button. */
function handleButton(sender, payload) {
    console.log("[EVENT] " + sender + ": Received postback (button click) from user");
    console.log("[EVENT] " + sender + ":     -> postback data: " + payload);

    if (payload.includes("recipeSelected")) {
        loadIngredients(payload);
        ingredientsActive = true;
    }

    switch (payload) {
        case "searchProduct":
            console.log("[EVENT] " + sender + ": Requested to search for products by name");
            sendTextMessage(sender, "What product are you looking for?");
            net_handler.currentState = net_handler.State.WAITING_FOR_PRODUCT;
            break;

        case "searchRecipe":
            console.log("[EVENT] " + sender + ": Requested to search for recipes");
            sendTextMessage(sender, "What recipe are you looking for?");
            net_handler.currentState = net_handler.State.WAITING_FOR_RECIPE;
            break;
    }
}

/* Prompts the user to select the type of search (ie product or recipe). */
function promptUserSearch(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": "How would you like to search?",
                "buttons": [
                    {
                        "type": "postback",
                        "title": "By Product",
                        "payload": "searchProduct",
                    }, {
                        "type": "postback",
                        "title": "By Recipe",
                        "payload": "searchRecipe",
                    }
                ]
              }
        }
    };

    console.log("[INFO] " + sender + ": Greeted bot");

    if (net_handler.sendFBRequest(sender, messageData)) {
        console.log("[INFO] " + sender + ": Sent search option prompt");
    }
}

/* Sends a text messsage to the user. */
function sendTextMessage(sender, text) {
    let messageData = { text: text };

    if (net_handler.sendFBRequest(sender, messageData)) {
        console.log("[INFO] " + sender + ": Sent message: \'" + text + "\'");
    }
}

module.exports = {
    handleMessageReceive: handleMessageReceive,
    handleButton: handleButton,
};
