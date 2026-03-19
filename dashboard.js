$(document).ready(function () {
    // --- INITIALIZATION ---
    // Fetch user and account data from browser storage
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let accounts = JSON.parse(localStorage.getItem('accounts'));
    let bookBeingEdited = ""; // Tracks the title of the book currently in "Edit Mode"
    
    // Display current user's name in the sidebar
    $('#profileName').html(currentUser.user);
    $('#role').html(currentUser.accountType);

    // Template for the category dropdown used during book editing
    let editCategory = $(`<select id="addCategoryEdit" class="form-select w-auto">
                                <option value="">Select Category</option>
                                <option value="Classic">Classic</option>
                                <option value="Sci-Fi">Sci-Fi</option>
                                <option value="Fantasy">Fantasy</option>
                                <option value="Self-Help">Self-Help</option>
                                <option value="Thriller">Thriller</option>
                                <option value="History">History</option>
                                <option value="Mythology">Mythology</option>
                                <option value="Memoir">Memoir</option>
                                <option value="Dystopian">Dystopian</option>
                                <option value="Adventure">Adventure</option>
                                <option value="Psychology">Psychology</option>
                                <option value="Historical Fiction">Historical Fiction</option>
                                <option value="Mystery">Mystery</option>
                            </select>`);

    // Find the current user's specific account object to load their personal transactions
    for (let i = 0; i < accounts.length; i++) {
        if (accounts[i].name == currentUser.user) {
            renderTransactionsTable(accounts[i].transactions);
            break;
        }
    }

    // Set up initial UI state
    $('#editDisplayName').text(currentUser.user);
    $('#studentTable').hide();
    $('#adminLibrarianTable').hide();

    // --- ROLE-BASED ACCESS CONTROL ---
    // Check if user is Admin/Librarian or Student
    if (currentUser.accountType != 'Student') {
        $('#adminLibrarianTable').show();
        $('#adminControls').show();
        renderAdminLibrarianTable(); // Load requests for admins
        renderAdminDashboard();      // Load stats cards
    } else {
        $('#adminControls').hide();
        $('#studentTable').show();    // Show personal transaction table for students
    }

    // --- ADMIN: DYNAMIC UI GENERATION ---
    // If Admin, generate the "Add New Book" form inputs dynamically
    if (currentUser.accountType !== 'Student') {
        let addCategorySelect = $(`<select id="addCategory" class="form-select w-auto">
                                <option value="">Select Category</option>
                                <option value="Classic">Classic</option>
                                <option value="Sci-Fi">Sci-Fi</option>
                                <option value="Fantasy">Fantasy</option>
                                <option value="Self-Help">Self-Help</option>
                                <option value="Thriller">Thriller</option>
                                <option value="History">History</option>
                                <option value="Mythology">Mythology</option>
                                <option value="Memoir">Memoir</option>
                                <option value="Dystopian">Dystopian</option>
                                <option value="Adventure">Adventure</option>
                                <option value="Psychology">Psychology</option>
                                <option value="Historical Fiction">Historical Fiction</option>
                                <option value="Mystery">Mystery</option>
                            </select>`);

        let newDiv = $('<div class="row d-flex flex-column flex-lg-row gap-3"></div>');
        newDiv.append('<input class="form-control col" type="text" placeholder="Enter image URL" id="addImg">');
        newDiv.append('<input class="form-control col" type="text" placeholder="Enter title" id="addTitle">');
        newDiv.append('<input class="form-control col" type="text" placeholder="Enter author" id="addAuthor">');
        newDiv.append(addCategorySelect);
        newDiv.append('<input class="form-control col" type="number" placeholder="Enter stock" min="1" id="addStock">');
        newDiv.append('<button class="btn btn-primary d-block rounded-pill" id="addNewBookBtn">Add book</button>');
        $('#addBook').append(newDiv);
    }

    // Initial render and responsive check
    renderBooks();
    checkWidth();
    $(window).resize(checkWidth);

    // --- NAVIGATION & SIDEBAR ---
    // Switch from Main Content to Profile Edit screen
    $('#profilePicture').click(function () {
        $('#mainContent').fadeOut(200, function () {
            $('#editProfile').fadeIn(200);
        });
    });

    // Toggle Sidebar collapse/expand
    $('#sidebarCollapse').on('click', function () {
        $('#sidePanel').toggleClass('collapsed');

        // Change icon based on state
        const icon = $(this).find('i');
        if ($('#sidePanel').hasClass('collapsed')) {
            icon.removeClass('fa-bars').addClass('fa-chevron-right');
        } else {
            icon.removeClass('fa-chevron-right').addClass('fa-bars');
        }
    });

    // --- ACCOUNT MANAGEMENT ---
    $('#deleteAccBtn').click(function () {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            removeAccount(currentUser.user);
            $('#dashboard').fadeOut('fast');
            setTimeout(function () {
                alert('Account deleted successfully!');
                window.location.href = 'index.html';
            }, 400);
        }
    });

    // --- REPORT GENERATION ---
    // Calculates library statistics and displays them in a card
    $('#generateReportBtn').click(function() {
        let books = JSON.parse(localStorage.getItem('books')) || [];
        let accounts = JSON.parse(localStorage.getItem('accounts')) || [];
        
        let totalBooks = books.length;
        let totalStock = books.reduce((sum, book) => sum + parseInt(book.stock), 0);
        
        let totalBorrows = 0;
        let activeBorrows = 0;
        let completedReturns = 0;
        let pendingApprovals = 0;

        // Iterate through all accounts to tally transaction statuses
        accounts.forEach(acc => {
            if (acc.transactions) {
                acc.transactions.forEach(t => {
                    totalBorrows++;
                    if (t.returnDate) {
                        completedReturns++;
                    } else if (t.requestReturn) {
                        pendingApprovals++;
                    } else {
                        activeBorrows++;
                    }
                });
            }
        });

        // Template for the Report UI
        let reportHtml = `
            <div class="card border-primary shadow-sm">
                <div class="card-header bg-primary text-white d-flex justify-content-between">
                    <h5 class="m-0">Library Status Report</h5>
                    <span>${new Date().toLocaleDateString()}</span>
                </div>
                <div class="card-body">
                    <div class="row text-center">
                        <div class="col-md-4 mb-3">
                            <h6 class="text-muted">Inventory</h6>
                            <p class="h3">${totalBooks} <small class="fs-6">Titles</small></p>
                            <p class="h3">${totalStock} <small class="fs-6">Copies Available</small></p>
                        </div>
                        <div class="col-md-4 mb-3 border-start border-end">
                            <h6 class="text-muted">Borrowing Activity</h6>
                            <p class="text-primary m-0"><strong>Total:</strong> ${totalBorrows}</p>
                            <p class="text-success m-0"><strong>Returned:</strong> ${completedReturns}</p>
                            <p class="text-danger m-0"><strong>Currently Out:</strong> ${activeBorrows}</p>
                        </div>
                        <div class="col-md-4 mb-3">
                            <h6 class="text-muted">Action Required</h6>
                            <p class="h3 text-warning">${pendingApprovals}</p>
                            <p class="small">Pending Return Requests</p>
                        </div>
                    </div>
                    <hr>
                    <button class="btn btn-outline-secondary btn-sm" onclick="$('#reportDisplay').fadeOut()">Close Report</button>
                </div>
            </div>
        `;

        $('#reportDisplay').html(reportHtml).fadeIn();
    });

    // Removes an account from LocalStorage
    function removeAccount(toRemove) {
        let accountsLocalStorage = JSON.parse(localStorage.getItem('accounts')) || [];
        for (let i = 0; i < accountsLocalStorage.length; i++) {
            if (accountsLocalStorage[i].name === toRemove) {
                accountsLocalStorage.splice(i, 1);
                break;
            }
        }
        localStorage.setItem('accounts', JSON.stringify(accountsLocalStorage));
    }

    // --- SEARCH & FILTERING ---
    $('#searchBook').on('input', function () { $('#searchBtn').click(); });
    $('#filterCategory').on('change', function () { $('#searchBtn').click(); });

    $('#searchBtn').click(function () {
        $('#books').html('');
        let bookToSearch = $('#searchBook').val().toLowerCase();
        let category = $('#filterCategory').val();
        let books = JSON.parse(localStorage.getItem('books')) || [];

        for (let i = 0; i < books.length; i++) {
            let book = books[i];
            let matchesName = book.name.toLowerCase().includes(bookToSearch);
            let matchesAuthor = book.author.toLowerCase().includes(bookToSearch);
            let matchesCategory = (category === "" || book.category === category);

            if ((matchesName || matchesAuthor) && matchesCategory) {
                appendBookRow(book);
            }
        }
    });

    // --- BOOK CRUD OPERATIONS ---
    // DELETE BOOK
    $('#books').on('click', '.deleteBtn', function (e) {
        e.preventDefault();
        let card = $(this).closest('.border'); 
        let bookName = card.find('#bookName').text().trim();
        
        if (confirm(`Are you sure you want to delete "${bookName}"?`)) {
            let books = JSON.parse(localStorage.getItem('books')) || [];
            let updatedBooks = books.filter(book => book.name !== bookName);
            localStorage.setItem('books', JSON.stringify(updatedBooks));
            renderBooks();
            if (typeof renderAdminDashboard === "function") renderAdminDashboard();
        }
    });

    // EDIT USER PROFILE
    $('#btnSaveName').click(function () {
        $('#newNameInput, #newPasswordInput').removeClass('is-invalid');
        let newName = $('#newNameInput').val().trim();
        let newPassword = $('#newPasswordInput').val().trim();
        let isValid = true;

        if (newName === "") { $('#newNameInput').addClass('is-invalid'); isValid = false; }
        if (newPassword === "" || newPassword.length < 6) { 
            alert("Password required (min 6 chars)"); 
            $('#newPasswordInput').addClass('is-invalid'); 
            isValid = false; 
        }

        if (!isValid) return;

        let accounts = JSON.parse(localStorage.getItem('accounts')) || [];
        for (let i = 0; i < accounts.length; i++) {
            if (accounts[i].name === currentUser.user) {
                accounts[i].name = newName;
                accounts[i].password = newPassword;
                break;
            }
        }

        currentUser.user = newName;
        localStorage.setItem('accounts', JSON.stringify(accounts));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Update UI names immediately
        $('#editDisplayName, #profileName').text(newName);
        displayNameGreetings();
        $('#newPasswordInput, #newNameInput').val('');
        alert("Profile updated!");
    });

    // ENTER EDIT MODE FOR A BOOK (Inline editing)
    $('#books').on('click', '.editBtn', function () {
        if(bookBeingEdited != ""){
            alert(`You are currently editing ${bookBeingEdited}!`);
            return;
        }
        let card = $(this).closest('.border'); 
        let bookName = card.find('#bookName');
        let bookAuthor = card.find('#bookAuthor');
        let bookCategory = card.find('#bookCategory');
        let bookStock = card.find('#bookStock');
        
        bookBeingEdited = bookName.html();
        let editCategorySelect = $(editCategory).val(bookCategory.html());

        // Replace static text with input fields
        bookName.replaceWith($('<input class="form-control my-1 edit-input-name" id="newName">').val(bookName.html()));
        bookAuthor.replaceWith($('<input class="form-control my-1" id="newAuthor">').val(bookAuthor.html()));
        bookCategory.replaceWith(editCategorySelect);
        bookStock.replaceWith($('<input class="form-control my-1" id="newStock">').val(bookStock.html()));
        
        $(this).removeClass('btn-success editBtn').addClass('btn-primary saveNew').text('Save');
    });

    // SAVE EDITED BOOK DATA
    $('#books').on('click', '.saveNew', function () {
        let books = JSON.parse(localStorage.getItem('books'));
        let card = $(this).closest('.border');
        let newName = card.find('#newName').val();
        let newAuthor = card.find('#newAuthor').val();
        let newCategory = card.find('#addCategoryEdit').val();
        let newStock = card.find('#newStock').val();

        for (let i = 0; i < books.length; i++) {
            if (books[i].name == bookBeingEdited) {
                books[i].name = newName;
                books[i].author = newAuthor;
                books[i].category = newCategory;
                books[i].stock = newStock;
                break;
            }
        }

        localStorage.setItem('books', JSON.stringify(books));
        renderBooks(); 
        bookBeingEdited = "";
    });

    // CREATE NEW BOOK
    $('#addNewBookBtn').click(function () {
        $('.form-control, .form-select').removeClass('is-invalid');
        let imgLink = $('#addImg').val().trim();
        let stock = $('#addStock').val().trim();
        let bookName = $('#addTitle').val().trim();
        let bookAuthor = $('#addAuthor').val().trim();
        let bookCategory = $('#addCategory').val();

        let isValid = true;
        if (!imgLink || !imgLink.startsWith('http')) { $('#addImg').addClass('is-invalid'); isValid = false; }
        if (!bookName) { $('#addTitle').addClass('is-invalid'); isValid = false; }
        if (!bookAuthor) { $('#addAuthor').addClass('is-invalid'); isValid = false; }
        if (!bookCategory) { $('#addCategory').addClass('is-invalid'); isValid = false; }
        if (!stock || parseInt(stock) <= 0) { $('#addStock').addClass('is-invalid'); isValid = false; }

        if (!isValid) return;

        let books = JSON.parse(localStorage.getItem('books')) || [];
        // Assumes a Book constructor exists globally
        let newBook = new Book(imgLink, bookName, bookAuthor, bookCategory, stock);
        
        books.push(newBook);
        localStorage.setItem('books', JSON.stringify(books));
        
        renderBooks();
        renderAdminDashboard();
        $('#addImg, #addStock, #addTitle, #addAuthor').val('');
        $('#addCategory').prop('selectedIndex', 0);
    });

    // --- STUDENT ACTIONS ---
    // BORROW A BOOK
    $('#books').on('click', '.borrowBtn', function () {
        let accounts = JSON.parse(localStorage.getItem('accounts'));
        let books = JSON.parse(localStorage.getItem('books'));
        let book = $(this).closest('.col-12');
        let title = book.find('#bookName').html();

        // Reduce stock in global inventory
        for(let i=0; i<books.length; i++){
            if(books[i].name == title){
                books[i].stock--;
                localStorage.setItem('books', JSON.stringify(books));
                renderBooks();
                break;
            }
        }

        // Add transaction to current student's record
        for(let i=0; i<accounts.length; i++){
            if(accounts[i].name == currentUser.user){
                let transId = Date.now() + Math.random();
                // Assumes a Transaction constructor exists globally
                let newTrans = new Transaction(currentUser.user, title, new Date().toLocaleString(), null, false, transId);
                accounts[i].transactions.push(newTrans);
                
                localStorage.setItem('accounts', JSON.stringify(accounts));
                renderTransactionsTable(accounts[i].transactions);
                break;
            }
        }
    });

    // Toggle Profile Edit View via Sidebar Links
    $('#edit').click(function () {
        $('#mainContent').toggle('fast', function () { 
            $('#editProfile').toggle('fast'); 
        });
    });

    $('#home').click(function () {
        $('#editProfile').toggle('fast', function () { 
            $('#mainContent').toggle('fast'); 
        });
    });

    // LOGOUT
    $('#logOutBtn').click(function () {
        $('#dashboard').fadeOut(300);
        setTimeout(() => { window.location.href = 'index.html'; }, 300);
    });

    // STUDENT: REQUEST TO RETURN A BOOK
    $('#transactionTableBody').on('click', '.reqReturnBtn', function () {
        let transactionId = $(this).attr('data-id'); 
        let accountsData = JSON.parse(localStorage.getItem('accounts')) || [];
        let studentTransactions = [];

        for (let i = 0; i < accountsData.length; i++) {
            if (accountsData[i].name === currentUser.user) {
                for (let j = 0; j < accountsData[i].transactions.length; j++) {
                    if (accountsData[i].transactions[j].id == transactionId) {
                        accountsData[i].transactions[j].requestReturn = true;
                        break; 
                    }
                }
                studentTransactions = accountsData[i].transactions;
                break;
            }
        }
        localStorage.setItem('accounts', JSON.stringify(accountsData));
        renderTransactionsTable(studentTransactions);
    });

    // ADMIN: ACCEPT RETURN REQUEST
    $('#returnRequests').on('click', '.acceptReturn', function () {
        let row = $(this).closest('tr');
        let borrowerName = row.find('td:nth-child(1)').text();
        let bookTitle = row.find('td:nth-child(2)').text();
        let borrowDate = row.find('td:nth-child(3)').text();

        let accounts = JSON.parse(localStorage.getItem('accounts')) || [];
        let books = JSON.parse(localStorage.getItem('books')) || [];
        let updated = false;

        // Mark transaction as returned
        for (let i = 0; i < accounts.length; i++) {
            if (accounts[i].name === borrowerName) {
                for (let j = 0; j < accounts[i].transactions.length; j++) {
                    let t = accounts[i].transactions[j];
                    if (t.title === bookTitle && t.borrowDate === borrowDate && !t.returnDate) {
                        t.returnDate = new Date().toLocaleString();
                        updated = true;
                        break;
                    }
                }
            }
            if (updated) break;
        }

        if (updated) {
            // Put the book back into stock
            for (let k = 0; k < books.length; k++) {
                if (books[k].name === bookTitle) {
                    books[k].stock = parseInt(books[k].stock) + 1;
                    break;
                }
            }
            localStorage.setItem('accounts', JSON.stringify(accounts));
            localStorage.setItem('books', JSON.stringify(books));

            // Refresh all admin views
            renderAdminLibrarianTable();
            renderBooks();
            renderAdminDashboard();
        }
    });

    // --- HELPER FUNCTIONS ---

    // Handles responsive sidebar behavior
    function checkWidth() {
        const windowSize = $(window).width();
        if (windowSize <= 768) {
            $('#sidePanel').addClass('collapsed');
            $('#home, #edit').children('span').hide();
            $('#profilePicture, #logOutBtn, #profileName').hide();
            $('#sidebarCollapse i').removeClass('fa-bars').addClass('fa-chevron-right');
        } else {
            $('#sidePanel').removeClass('collapsed');
            $('#home, #edit').children('span').show();
            $('#profilePicture, #logOutBtn, #profileName').show();
            $('#sidebarCollapse i').removeClass('fa-chevron-right').addClass('fa-bars');
        }
    }

    // Renders the summary cards for Admin
    function renderAdminDashboard() {
        let books = JSON.parse(localStorage.getItem('books')) || [];
        let accounts = JSON.parse(localStorage.getItem('accounts')) || [];
        
        let totalTitles = books.length;
        let totalStock = books.reduce((sum, b) => sum + parseInt(b.stock), 0);
        let pendingReturns = 0;
        let activeLoans = 0;

        accounts.forEach(acc => {
            if (acc.transactions) {
                acc.transactions.forEach(t => {
                    if (!t.returnDate && t.requestReturn) pendingReturns++;
                    if (!t.returnDate && !t.requestReturn) activeLoans++;
                });
            }
        });

        const statsHtml = `
            <div class="col-md-3"><div class="card bg-light border-0 shadow-sm p-3"><small>Unique Titles</small><h2>${totalTitles}</h2></div></div>
            <div class="col-md-3"><div class="card bg-light border-0 shadow-sm p-3"><small>Total Stock</small><h2>${totalStock}</h2></div></div>
            <div class="col-md-3"><div class="card bg-light border-0 shadow-sm p-3"><small class="text-primary">Active Loans</small><h2>${activeLoans}</h2></div></div>
            <div class="col-md-3"><div class="card border-0 shadow-sm p-3 ${pendingReturns > 0 ? 'bg-warning' : 'bg-light'}"><small>Pending Returns</small><h2>${pendingReturns}</h2></div></div>
        `;
        $('#adminDashboard').html(statsHtml).show(); 
    }

    // Renders the full library gallery
    function renderBooks() {
        $('#books').html('');
        let books = JSON.parse(localStorage.getItem('books')) || [];
        for (let i = 0; i < books.length; i++) {
            appendBookRow(books[i]);
        }
    }

    // Renders the table for Admins to manage return requests from students
    function renderAdminLibrarianTable() {
        let tableContainer = $('#adminLibrarianTable');
        tableContainer.find('.row.g-3.mb-4').remove();
        let table = $('#returnRequests');
        table.html('');

        let accountsData = JSON.parse(localStorage.getItem('accounts')) || [];

        for (let i = 0; i < accountsData.length; i++) {
            let accountName = accountsData[i].name;
            for (let j = 0; j < accountsData[i].transactions.length; j++) {
                let trans = accountsData[i].transactions[j];
                let actions = "";

                if (trans.returnDate != null) {
                    actions = `<span class="badge bg-success">Return accepted!</span>`;
                } else if (trans.requestReturn === true) {
                    actions = `<button class="btn btn-primary acceptReturn">Accept return request</button>`;
                } else {
                    actions = `<span class="badge bg-secondary">Still Borrowed</span>`;
                }

                let newRequest = `
                    <tr>
                        <td>${accountName}</td>
                        <td>${trans.title}</td>
                        <td>${trans.borrowDate}</td>
                        <td>${trans.returnDate || 'Not yet returned'}</td>
                        <td>${actions}</td>
                    </tr>`;
                table.append(newRequest);
            }
        }
    }

    // Renders the personal history table for a student
    function renderTransactionsTable(transactions) {
        if (!transactions) return;
        $('#transactionTableBody').html('');

        for (let i = 0; i < transactions.length; i++) {
            let trans = transactions[i];
            let action = ""; 

            if (trans.returnDate) {
                action = `<span class="badge bg-success">Returned</span>`;
            } else if (trans.requestReturn === true) {
                action = `<span class="badge bg-secondary">Waiting for approval.</span>`;
            } else {
                action = `<button class="reqReturnBtn btn btn-primary rounded-3" data-id="${trans.id}">Request Return</button>`;
            }

            let newTransaction = $(`
                <tr>
                    <td>${trans.title}</td>
                    <td>${trans.borrowDate}</td>
                    <td>${trans.returnDate || 'Not yet returned'}</td>
                    <td>${action}</td>
                </tr>`);
            $('#transactionTableBody').append(newTransaction);
        }
    }

    // Generates the HTML for a single book card and adds it to the grid
    function appendBookRow(book) {
        let buttons;

        // Logic for buttons inside the card (Borrow vs Edit/Delete)
        if (currentUser.accountType == 'Student') {
            buttons = $(`<button class="btn btn-primary rounded-pill borrowBtn w-100">Borrow</button>`);
            if (book.stock <= 0) {
                buttons.attr('disabled', 'disabled').text('Out of Stock').removeClass('btn-primary').addClass('btn-secondary');
            }
        } else {
            buttons = $(`
                <div class="col-6"><button class="btn btn-warning editBtn w-100 rounded-pill">Edit</button></div>
                <div class="col-6"><button class="btn btn-danger deleteBtn w-100 rounded-pill">Delete</button></div>`);
        }

        // Build the Bootstrap card structure
        let newDiv = $('<div class="col-12 col-sm-6 col-lg-4 col-xl-3 mb-4 d-flex flex-column"></div>');
        let cardWrapper = $('<div class="border rounded p-3 h-100 d-flex flex-column bg-white shadow-sm"></div>');
        let imgDiv = $('<div class="w-100 mb-2"></div>');
        imgDiv.append($(`<img src="${book.imgLink}" class="rounded w-100" style="aspect-ratio: 2/3; object-fit: cover;">`));
        
        let details = $('<div class="flex-grow-1"></div>');
        details.append($(`<h1 class="fs-5 fw-bold mb-1" id="bookName">${book.name}</h1>`));
        details.append($(`<p class="small mb-1">by <span id="bookAuthor">${book.author}</span></p>`));
        details.append($(`<p class="m-0 fst-italic text-muted small" id="bookCategory">${book.category}</p>`));
        details.append($(`<p class="mt-2"><span class="fw-bold" id="bookStock">${book.stock}</span><span> stock(s)</span></p>`));
        
        let buttonsDiv = $('<div class="row g-2 mt-auto"></div>');
        buttonsDiv.append(buttons);

        cardWrapper.append(imgDiv).append(details).append(buttonsDiv);
        newDiv.append(cardWrapper);
        $('#books').append(newDiv);
    }
});