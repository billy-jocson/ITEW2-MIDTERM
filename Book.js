// Book class represents a book in the library
class Book{
    constructor(imgLink, name, author, category, stock=1){
        this.imgLink = imgLink;
        this.name = name;
        this.author = author;
        this.category = category;
        this.stock = stock; // default stock is 1, can be expanded to allow multiple copies
    }
}