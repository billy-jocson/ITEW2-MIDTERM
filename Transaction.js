class Transaction {
    constructor(user, title, borrowDate, returnDate, requestReturn, id) {
        this.user = user;
        this.title = title;
        this.borrowDate = borrowDate;
        this.returnDate = returnDate;
        this.requestReturn = requestReturn;
        this.id = id || Date.now() + Math.random(); // Generates a unique ID
    }
}