/* jshint esversion:6, node: true */

/*
 * Loblaws Messenger - action_handler.js
 *
 * Handles incoming data from the user sent to the server.
 */
const index   = require('./index.js'),
      state   = require('./state.js'),
      cart    = require('./cart_handler.js'),
      search  = require('./actions/search.js'),
      recipe  = require('./actions/recipe.js');

/* Hanldes when a user sends a message. */
function handleMessageReceive(sender, text) {
    console.log("[EVENT] " + sender + ": Received message from user: \'" + text + "\'");

    // If the user has requested to search for product by name..
    if (state.currentState == state.State.WAITING_FOR_PRODUCT) {
        search.requestProduct(sender, text);

    // If the user has requested to search for a recipe..
    } else if (state.currentState == state.State.WAITING_FOR_RECIPE) {
        recipe.requestRecipe(sender, text);


    } else if (state.currentState == state.State.IDLE) {
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
            sendTextMessage(sender, "Please enter a product name to search for");
            state.currentState = state.State.WAITING_FOR_PRODUCT;
            break;

        case "searchRecipe":
            console.log("[EVENT] " + sender + ": Requested to search for recipes");
            sendTextMessage(sender, "Search by recipe");
            state.currentState = state.State.WAITING_FOR_RECIPE;
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

    if (index.sendFBRequest(sender, messageData)) {
        console.log("[INFO] " + sender + ": Sent search option prompt");
    }
}

/* Sends a text messsage to the user. */
function sendTextMessage(sender, text) {
    let messageData = { text: text };

    if (index.sendFBRequest(sender, messageData)) {
        console.log("[INFO] " + sender + ": Sent message: \'" + text + "\'");
    }
}

module.exports = {
    handleMessageReceive: handleMessageReceive,
    handleButton: handleButton,
    sendTextMessage: sendTextMessage,
};
