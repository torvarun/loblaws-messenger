/* jshint esversion:6, node: true */

/* Args:
 *   id (String): Type of prompt
 *   message (String): The message to show the user.
 *   responses (String array): Array of possible responses.
 */
function Prompt(id, message) {
    this.id = id;
    this.message = message;

    this.sendPrompt = function() {
        // TODO Send prompt
    };

    this.getMessage = function() {
        return this.message;
    };

    this.getResponses = function() {
        return this.response;
    };

    this.getID = function() {
        return this.id;
    };

}

module.exports.Prompt = Prompt;
