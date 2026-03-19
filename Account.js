// Account class represents a user account
class Account{
    #transactions;
    #name;
    #password;
    #accountType;

    constructor(name, password, accountType, transactions = []) {
        this.name = name;
        this.password = password;
        this.accountType = accountType; // 'Student', 'Administrator', 'Librarian'
        this.transactions = transactions;
    }
    get getName() {
        return this.name;
    }
    get getPassword() {
        return this.password;
    }
    get getAccountType() {
        return this.accountType;
    }
    get getTransactions() {
        return this.#transactions;
    }
    set setName(name) {
        this.name = name;
    }
    set setPassword(password) {
        this.password = password;
    }
    set setAccountType(accountType) {
        this.accountType = accountType;
    }
    set addTransaction(transaction) {
        this.#transactions.push(transaction);
    }
}