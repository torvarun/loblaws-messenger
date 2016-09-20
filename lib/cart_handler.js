/* jshint esversion:6, node: true */

/*
 * Loblaws Messenger - cart_handler.js
 *
 * Contains Cart & Item objects for managing product purchasing.
 */

const cartObj = new Cart();

function Cart() {
    this.quantity = 0;
    this.items = [];

    /* Returns the total quantity of items in the cart. */
    this.getTotalQuantity = function() {
        let total = 0;

        for (let i = 0; i < this.items.length; i++) {
            total += this.items[i].getQuantity();
        }

        return total;
    };

    /* Returns the total price of all the items in the cart. */
    this.getTotalPrice = function() {
        let total = 0.0;

        for (let i = 0; i < this.items.length; i++) {
            total += this.items[i].getPrice();
        }

        return total;
    };

    /* Add the item to the cart. */
    this.addItem = function(item) {
        this.items[length] = item;
    };

    /* Removes the item from the cart. */
    this.removeItem = function(item) {
        for (let i = 0; i < this.items.length; i++) {
            if (item === this.items[i]) {
                // Swaps the end item to the current item and remove the last.
                this.items[i] = this.items[this.items.length - 1];
                this.items[this.items.length - 1] = null;
            }

        }
    };
}

function Item(name, id, price) {
    this.name = name;
    this.id = id;
    this.price = price;
    this.quantity = 1;

    /* Add 1 to the total quantity of the item. */
    this.increaseQuantity = function() {
        this.quantity++;
    };

    /* Directly set the quantity. */
    this.setQuantity = function(quantity) {
        this.quantity = quantity;
    };

    /* Returns the name of the item. */
    this.getName = function() {
        return this.name;
    };

    /* Returns the product ID of the item. */
    this.getID = function() {
        return this.id;
    };

    /* Returns the price of an individual item. */
    this.getPrice = function() {
        return this.price;
    };

    /* Returns the amount of the item that is in the cart. */
    this.getQuantity = function() {
        return this.quantity;
    };

    /* Returns the total cost of all of this item in the cart. */
    this.getTotalPrice = function() {
        return this.quantity * this.price;
    };
}

module.exports = {
    Cart: Cart,
    Item: Item,
    cartObj: cartObj
};
