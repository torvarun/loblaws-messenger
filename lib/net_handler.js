/* jshint esversion:6, node: true */

/*
 * Loblaws Messenger - net_handler.js
 *
 * Hanldes the current state of the bot & provides net utilities.
 */

const request = require('request');

// Token used to send messages.
const AUTH_TOKEN = process.env.PAGE_ACCESS_TOKEN;

const State = {
    WAITING_FOR_SEARCH_TYPE: 1, // The server is waiting search selection (ie product or recipe)
    WAITING_FOR_PRODUCT: 2,     // The server is waiting product search
    WAITING_FOR_RECIPE: 3   // The server is waiting recipe search
};

// A dictionary of the state for each user, where key in the user ID,
// and the value is the state of the user (see above). If the user is not in the
// dictionary, it implies the user is idle or has not picked a search type.
let userStates = {};

/*
 * Sends a POST request to facebook's servers with the provided message data.
 *   sender (String): The user to be sent to
 *   data (JSON Object): The data to be sent
 */
function sendFBRequest(sender, data) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: AUTH_TOKEN },
        method: 'POST',
        json: {
            recipient: { id: sender },
            message: data,
        }
    }, function callback(error, response, body) {
        if (error) {
            console.log("[ERROR] " + sender + ": Error sending data (Network): \'" + error + "\'");
            return false;
        } else if (body.error) {
            console.log("[ERROR] " + sender + ": Error sending data (Facebook): \'" + body.error + "\'");
            return false;
        }
    });

    return true;
}

module.exports = {
    State: State,
    userStates: userStates,
    sendFBRequest: sendFBRequest
};
