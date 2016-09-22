/* jshint esversion:6, node: true */

/*
 * Loblaws Messenger - state.js
 *
 * Hanldes the current state of the bot.
 */

const State = {
    IDLE: 0,
    WAITING_FOR_SEARCH_TYPE: 1, // The server is waiting search selection (ie product or recipe)
    WAITING_FOR_PRODUCT: 2,     // The server is waiting product search
    WAITING_FOR_RECIPE: 3   // The server is waiting recipe search
};

let currentState = State.IDLE;

module.exports = {
    State: State,
    currentState: currentState
};
