/* jshint esversion:6, node: true */

class Prompt {

    /* Args:
     *   id (String): Type of prompt
     *   message (String): The message to show the user.
     *   responses (String array): Array of possible responses.
     */
    constructor(id, message, response) {
        this.id = id;
        this.message = message;

        if (arguments.length == 3) {
            this.response = response;
        }

        // TODO Send prompt
    }

    getMessage() {
        return this.message;
    }

    getResponses() {
        return this.response;
    }

    getID() {
        return this.id;
    }
    
}
