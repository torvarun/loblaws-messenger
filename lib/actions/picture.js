/* jshint esversion:6, node: true */

const action_handler = require('../action_handler.js');
<<<<<<< HEAD

function requestProduct() {
    action_handler.currentPrompt = new Prompt('receipe', "Looking up barcode..");

=======
const index = require('../index.js');

function requestProduct(image_url) {
    action_handler.currentPrompt = new Prompt('receipe', "Looking up barcode..");

    // Send the barcode API POST req
    index.request({
		url: 'http://api.havenondemand.com/1/api/sync/recognizebarcodes/v1',
		method: 'POST',
        headers: {
            apikey: '3ce6b6c8-c25a-4b62-950d-e4927404ea22'
        },
        params: {
            url: image_url
        }
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error);
		} else if (response.body.error) {
			console.log('Error: ', response.body.error);
		} else {
            console.log(response.barcode.text);
        }
	});
>>>>>>> 1c1ba9fe44083df91825dee609914e3275d8967f
}
