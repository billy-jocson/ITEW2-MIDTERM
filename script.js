$(document).ready(function(){
    let user = localStorage.getItem('currentUser');
    if(user != null){
        localStorage.removeItem('currentUser');
    }
    $('#loginSignUpPage').hide();
    let books, accounts;
    $('#loginSignUpPage').show('fast');
    if (localStorage.getItem('library_initialized') === null) {
        books = [
            new Book('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVE35HnIwnFCSmHI095IKXtQLK_DaPbshUA35y7yH95mf1vDhl93hlCJAXpXnQzotZizg7ADh3ygVpoTtx8t8WGc7_sL5dZoMuXs-6TDA&s=10', 'The Great Gatsby', 'F. Scott Fitzgerald', 'Classic', 1),
            new Book('https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1555447414i/44767458.jpg','Dune', 'Frank Herbert', 'Sci-Fi', 3),
            new Book('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmZcRcqXbXEX5FM8YqGx1Qk2jRLPFRxlI-Ig&s', 'The Hobbit', 'J.R.R. Tolkien', 'Fantasy', 2),
            new Book('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4jkZzutdicyETrkle365u4QkR-c-868qnbg&s', 'Atomic Habits', 'James Clear', 'Self-Help', 4),
            new Book('https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1578337456i/45360527.jpg', 'The Silent Patient', 'Alex Michaelides', 'Thriller', 1),
            new Book('https://images-na.ssl-images-amazon.com/images/I/713jIoMO3UL.jpg', 'Sapiens', 'Yuval Noah Harari', 'History', 2),
            new Book('https://upload.wikimedia.org/wikipedia/en/a/ad/Project_Hail_Mary%2C_First_Edition_Cover_%282021%29.jpg', 'Project Hail Mary', 'Andy Weir', 'Sci-Fi', 3),
            new Book('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqVKL5B19tH3jazWurXxGH1S3vSq36i7DlWA&s', 'Circe', 'Madeline Miller', 'Mythology', 4),
            new Book('https://images-na.ssl-images-amazon.com/images/I/81WojUxbbFL.jpg', 'Educated', 'Tara Westover', 'Memoir', 1),
            new Book('https://cdn.kobo.com/book-images/ac1472da-9e15-4fd9-b0a3-31ab0648a4fb/1200/1200/False/the-night-circus.jpg', 'The Night Circus', 'Erin Morgenstern', 'Fantasy', 2),
            new Book('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRob32lCVQQchPrLb8qEI7g3sjMzMiFL1y8QA&s', '1984', 'George Orwell', 'Dystopian', 3),
            new Book('https://images-na.ssl-images-amazon.com/images/I/71aFt4+OTOL.jpg', 'The Alchemist', 'Paulo Coelho', 'Adventure', 4),
            new Book('https://imgv2-1-f.scribdassets.com/img/word_document/182569769/original/216x287/fb2c0855e3/1764652337?v=1', 'Thinking, Fast and Slow', 'Daniel Kahneman', 'Psychology', 1),
            new Book('https://img1.od-cdn.com/ImageType-400/0439-1/%7B42631B71-955C-447D-B942-23CD63C897F6%7DIMG400.JPG', 'The Seven Husbands of Evelyn Hugo', 'Taylor Jenkins Reid', 'Historical Fiction', 2),
            new Book('https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1582287822l/46000520.jpg', 'The Thursday Murder Club', 'Richard Osman', 'Mystery', 3)
        ];

        accounts = [];
        accounts.push(new Account('Juan dela Cruz', '123', 'Student'));
        accounts.push(new Account('admin', '123', 'Administrator'));
        accounts.push(new Account('librarian', '123', 'Librarian'));
        
        localStorage.setItem(`books`, JSON.stringify(books));
        localStorage.setItem(`accounts`, JSON.stringify(accounts));
        localStorage.setItem('library_initialized', 'true');
    }
    
    // Redirect to create account page
    $('#btnRedirectToCreateAcc').click(function(){
        $('.accPage').toggle('fast');
    });

    // Back button on account creation
    $('#btnBack').click(function(){
        $('#incorrectPassword').hide();
        $('.accPage').toggle('fast');
    });

    // Create account button handler
    $('#btnCreateAccount').click(function(){
        let accounts = JSON.parse(localStorage.getItem('accounts'));
        let username = $('#txtUsernameCreate');
        let password = $('#txtPasswordCreate');
        let confirmPass = $('#txtPasswordRetype');
        let accType = $('#accType');

        if(password.val().length <= 5 && confirmPass.val().length <= 5){
            alert("Password must be at least 6 characters long.");
            return;
        }

        if(confirmPass.val() != password.val()){
            password.css('border-color', 'red');
            confirmPass.css('border-color', 'red');
            alert('Passwords don\'t match!');
            return;
        }

        // Validation
        if(username.val() == "" || password.val() == "" || confirmPass.val() == ""){   
            if(username.val() == ""){
                username.css('border-color', 'red');
            }
            if(password.val() == ""){
                password.css('border-color', 'red');
            }
            if(confirmPass.val() == ""){
                confirmPass.css('border-color', 'red');
            }
            return;
        } 

        let newAcc = new Account(username.val(), password.val(), accType.val(), []);

        username.css('border-color', '');
        password.css('border-color', '');
        confirmPass.css('border-color', '');

        accounts.push(newAcc);
        localStorage.setItem('accounts', JSON.stringify(accounts));
        $('#txtUsernameCreate, #txtPasswordCreate, #txtPasswordRetype').val('');
        $('#accType').prop('setSelected', '0');
        alert('Account was created!');
        $('#btnBack').click();
    });

    // Login button handler
    $('#btnLogin').click(function(){
        let username = $('#txtUsername');
        let password = $('#txtPassword');
        $('#txtUsername, #txtPassword').css('border-color', '');

        if(username.val() == "" || password.val() == ""){
            if(username.val() == ""){
                username.css('border-color', 'red');
            }
            if(password.val() == ""){
                password.css('border-color', 'red');
            }
            return;
        }

        let correctUser, correctPassword;
        // Check credentials against stored accounts
        let accounts = JSON.parse(localStorage.getItem('accounts'));
        
        for(let i=0; i < accounts.length; i++){
            if(accounts[i].name == username.val() && 
                accounts[i].password == password.val()){
                $('#loginSignUpPage').toggle('fast');
                correctUser = correctPassword = true;
                $('#incorrectPassword').hide();
                localStorage.setItem('currentUser', JSON.stringify({
                    user: accounts[i].name,
                    accountType: accounts[i].accountType
                }));
                window.location.href = 'dashboard.html';
                return;
            }
        }
        $('#incorrectPassword').show();
        alert('Incorrect password!');
    });
});