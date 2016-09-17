/* jshint esversion:6, node: true */

class Prompt {
    /* Args:
     *   message: String
     *   responses: String array of response options.
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
