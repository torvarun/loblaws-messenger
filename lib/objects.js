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
    constructor(name, id, price) {
        this.name = name;
        this.id = id;
        this.price = price;
        this.quantity = 1;
    }

    increaseQuantity() {
        this.quantity++;
    }

    getPrice() {
        return this.price;
    }

    getID() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getQuantity() {
        return this.quantity;
    }
}