/* jshint esversion:6, node: true */

function Cart() {
    this.quantity = 0;
    this.items = [];

    this.getTotalQuantity = function() {
        var total = 0;

        for (var i = 0; i < this.items.length; i++) {
            total += this.items[i].getQuantity();
        }

        return total;
    };

    this.addItem = function(item) {
        this.items[length] = item;
    };
}

function Item(name, id, price) {
    this.name = name;
    this.id = id;
    this.price = price;
    this.quantity = 1;

    this.increaseQuantity = function() {
        this.quantity++;
    };

    this.getPrice = function() {
        return this.price;
    };

    this.getID = function() {
        return this.id;
    };

    this.getName = function() {
        return this.name;
    };

    this.getQuantity = function() {
        return this.quantity;
    };
}

module.exports = {
    Cart: Cart,
    Item: Item
};
