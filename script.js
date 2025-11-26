document.addEventListener("DOMContentLoaded", () => {

    const loginContent = document.getElementById("loginContent");
    const protectedContent = document.getElementById("protectedContent");
    const logoutButton = document.getElementById("logoutBtn");

       

         //Check auth token
        let authToken = getCookie("authToken");
        // const authToken = localStorage.getItem("authToken")
        console.log("TOKEN IS: ", authToken);
        // const loginContent = document.getElementById("loginContent");
        // const transactionTable = document.getElementById("transactionTable");
        const transactionContent = document.querySelectorAll(".transactionContent");

        if(authToken){
            if(loginContent) loginContent.style.display = "none";
            showProtected();
            fetchTransactions(authToken);
        } else {
            // transactionTable.style.display = "none";
            showLogin();
            // loginContent.style.display = "block";
        }
    


        // AUTHENTICATE USER
        const loginForm = document.getElementById("loginForm");
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            showLoader();
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            console.log("Sending:", { email, password });

            // client side validation
            if(!email || !password){
                document.getElementById("loginError").innerText = "Please fill in all fields!";
                return;
            }

            const payload = {
                partnerUserID: email,
                partnerUserSecret: password
            };

            
            try {
                const res = await fetch("proxy.php?action=authenticate", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(payload),
                    credentials: "include"
                });
                
              


                const data = await res.json();
                 console.log("RAW AUTH RESPONSE:", data);
                 console.log("===========================>>>>>>>");

           
                if(data.authToken){
                    // document.cookie = `authToken=${data.authToken}; path=/;`;
                    const authToken = data.authToken;
                    console.log("[COOKIE IS SET AFTER LOGIN]: ", authToken);

                    // document.getElementById("loginContent").style.display = "none";
                    // document.getElementById("transactionTable").style.display = "block";
                    // transactionContent.forEach(element => element.style.display = "block");
                    showProtected();


                    showProtected();
                    fetchTransactions(data.authToken);
                    
                } else if(data.errorCode) {
                    document.getElementById("loginError").innerText = `Login failed (${data.errorCode}): ${data.message || "Unknown error"}`;
                    if(error.code = 401){
                        document.getElementById("loginError").innerText = "Invalid password! Try again.";
                    } else if (error.code = 404){
                        document.getElementById("loginError").innerText = "Account not found! Please check your email!";
                    }
                    hideLoader();
                } else {
                    document.getElementById("loginError").innerText = "Login failed: Unknown error";
                    hideLoader();
                }
            } catch (e){
                document.getElementById("loginError").innerText = "Server Error!";
            }
        });


        function getCookie(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
            console.log(`[COOKIE READ] ${name}:`, value);
            return null;
        }

        function showProtected(){
            loginContent.style.display="none";
            protectedContent.style.display="block";
            logoutButton.style.display = "inline-block";

        }

        function showLogin(){
            loginContent.style.display="block";
            protectedContent.style.display="none";
            transactionContent.forEach(element => element.style.display = "none");

        }



        // CREATE TRANSACTION 

        const createTransactionForm = document.querySelector("#modal form");
        // const createTransactionBtn = document.getElementById("saveTransaction");
        createTransactionForm.addEventListener("submit", async (e) => {

            e.preventDefault();
            document.getElementById("createTransactionError").innerText = "";

            const merchant = document.getElementById("merchant").value;
            const created = document.getElementById("date").value;
            const amountInput = document.getElementById("amount").value;

            const validateNameResult = validateMerchantName(merchant);
            const validateAmountResult = validateAmount(amountInput);

            const amount = Math.round(parseFloat(amountInput) * 100);

            if(!validateNameResult.isValid){
                document.getElementById("createTransactionError").innerText = validateNameResult.error;
                return;
            }

            if(!validateAmountResult.isValid){
                document.getElementById("createTransactionError").innerText = validateAmountResult.error;
                return;
            }

            const payload = {
                authToken,
                created,
                amount,
                merchant
            }

            try {
                const res = await fetch("proxy.php?action=createTransaction", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(payload),
                    credentials: "include"
                });

                const data = await res.json();

                if(data.errorCode){
                    if(data.errorCode === 407){
                        expiredAuthToken();
                    }
                    console.error("API Error:", data.errorCode, data.message);
                    alert(`Error: ${data.errorCode} - ${data.message || "Unknown error occured"}`);
                    return;
                }

                if(data.success || data.transactionID){
                    modal.classList.remove("open");
                    createTransactionForm.reset();
                }

            

                console.log("CREATE TRANSACTION RECORD: ", data);
            } catch{
                console.log("hello World")
            }
        });

        //GET TRANSACTIONS
        async function fetchTransactions(authToken, startDate = "", endDate = ""){
            showLoader();

            console.log("INSIDE FETCH FUNCTION FETCHIN.............!")
            try {
                const url = `proxy.php?action=getTransactions&authToken=${encodeURIComponent(authToken)}&returnValueList=transactionList` + (startDate ? `&startDate=${startDate}` : "") + (endDate ? `&endDate=${endDate}` : "");
                const res = await fetch(url, {
                    method: "GET",
                    credentials: "include"
                });

                const data = await res.json();
                console.log("GET DATA.....................: ", data);
                hideLoader();
                if(data.errorCode){
                    if(data.errorCode === 407){
                        expiredAuthToken();
                    }
                    console.error("API Error:", data.errorCode, data.message);
                    alert(`Error: ${data.errorCode} - ${data.message || "Unknown error occured"}`);
                    return;
                }
                renderTransactions(data.transactionList);
            } catch (e){
                hideLoader();
                console.error("Internal Server Error!");
            }
        }

        function formatMoney(amount){
            return (amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }

        function renderTransactions(transactions){

            const transactionBody = document.getElementById("transactionTableBody");
            transactionBody.innerHTML = '';

            
            transactions.forEach(transaction => {
                const tr = document.createElement("tr");

                tr.innerHTML = `<td>${transaction.created}</td>
                                <td class="merchant-cell">${transaction.merchant}</td>
                                <td class="money-column">${formatMoney(transaction.amount)}</td>`

                transactionBody.appendChild(tr);
            });

        }

        
        const modal = document.getElementById("modal");
        const openModal = document.getElementById("createTransBtn");
        const closeModal = document.getElementById("closeModal");

        openModal.addEventListener("click", () => {
            console.log("Open modal button clicked!");
            modal.classList.add("open");
        })

        closeModal.addEventListener("click", () => {
            modal.classList.remove("open");
        });

        function showLoader(){
            document.getElementById("spinner").classList.add("show");
        }

        function hideLoader(){
            document.getElementById("spinner").classList.remove("show");
        }


        const logoutBtn = document.getElementById("logoutBtn");
        logoutBtn.addEventListener("click", async () => {
            await fetch("proxy.php?action=logout", {credentials: "include"});
            showLogin();
            // transactionContent.forEach(element => element.style.display = "none");

        });




        let lastCookie = document.cookie;
        setInterval(() => {
            if (document.cookie !== lastCookie) {
                console.log("[COOKIE CHANGED]:", document.cookie);
                lastCookie = document.cookie;
            }
        }, 500); // check every 0.5s

        document.getElementById("filter").addEventListener("click", () => {
            const startDate = document.getElementById("startDate").value;
            const endDate = document.getElementById("endDate").value;

            const authToken = getCookie("authToken");
            fetchTransactions(authToken, startDate, endDate);
        });

        const transactionBody = document.getElementById("transactionTableBody");

        transactionBody.addEventListener("click", function(e){
            if(e.target.classList.contains("merchant-cell")){
                e.target.classList.toggle("expanded");
                console.log("Clicked merchant cell");
            }
        });

        function validateMerchantName(name){

            const trimmedName = name.trim();

            if(trimmedName.length === 0) {
                return {isValid: false, error: "Merchant name cannot be empty!"};
            }


            if(trimmedName.length < 1 ){
                return {isValid: false, error: "Merchant name too short, it should be atleast 3 characters!"};
            }

            if(trimmedName.length > 100){
                return {isValid: false, error: "Merchant name too long, it should be less than 100 characters!"}
            }
            // allow common merchant name characters
            const regex = /^[a-zA-Z0-9\s\u00C0-\u017F.'",&\/()#$@™®-]+$/;
            if(!regex.test(name)) {
                return {isValid: false, error: "Merchant name contains invalid characters! Allowed charaters are letters, numbers, spaces, and . , \' \" & / ( ) # $ @ ™ ® -"}
            }

            // prevent all numbers and symbols
            if (/^\d+$/.test(trimmedName) || /^[\s.'"&\/()#$@™®-]+$/.test(trimmedName)) {
                return {isValid: false, error: "Please enter a valid merchant name. Names cannot consist only of numbers or symbols!"};
            }


            return {isValid: true};
        }

        function validateAmount(input){
            if (!/^\d+(\.\d{1,2})?$/.test(input)) return {isValid: false, error: "Amount can have up to two decimal places and not include invalid characters!"};
            const amount = parseFloat(input);
            if(isNaN(amount)) return {isValid: false, error: "Amount must be a valid number!"};
            if(amount <= 0) return {isValid: false, error: "Amount must be greater than 0!"};
            if(amount > 1000000) return {isValid: false, error: "Amount exceeds maximum limit of 1,000,000!"};
            return {isValid: true};
        }

        async function expiredAuthToken(){
            alert("Your session has expired. Please log in again.");
            await fetch("proxy.php?action=logout", {credentials: "include"});
            showLogin();
            // transactionContent.forEach(element => element.style.display = "none");
        }

});