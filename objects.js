/* jshint esversion: 6, node: true */

class Cart {
    constructor() {
        this.quantity = 0;
        this.items = [];
    }

    getTotalQuantity() {
        var total = 0;

        for (var i = 0; i < this.items.length; i++) {
            total += this.items[i].getQuantity();
        }

        return total;
     }
}

class Item {
    constructor(name, price) {
        this.name = name;
        this.price = price;
        this.quantity = 1;
    }

    increaseQuantity() {
        this.quantity++;
    }

    getPrice() {
        return this.price;
    }

    getName() {
        return this.name;
    }

    getQuantity() {
        return this.quantity;
    }
}
