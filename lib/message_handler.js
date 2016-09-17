// Arguments:
// message: String array: command [args]
function handleMessage(message) {
    switch (message[0]) {
        case "show":
            handleShow(message);
            break;
        case "search":
            handleSearch(message);
            break;
        case "cart":
            handleCart(message);
            break;
        case "checkout":
            handleCheckout();
            break;
        default:
            // TODO: Send error response.
    }
}
