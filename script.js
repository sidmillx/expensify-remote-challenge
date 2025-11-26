import { showLoader, hideLoader, showProtected, showLogin } from "./ui.js";
import { renderTransactions, expiredAuthToken, getCookie } from "./utils.js";
import { validateMerchantName, validateAmount } from "./validate_inputs.js";


document.addEventListener("DOMContentLoaded", () => {
    
    /// VARIABLE DEFINITIONS
    const loginForm = document.getElementById("loginForm");
    const loginError = document.getElementById("loginError");
    const createTransactionForm = document.querySelector("#modal form");
    const modal = document.getElementById("modal");
    const openModal = document.getElementById("createTransBtn");
    const closeModal = document.getElementById("closeModal");


       

    /**************************
     CHECK AUTHENTICATION STATUS
    ***************************/

    /// GET authToken cookie
    const authToken = getCookie("authToken");

    /// CHECK IF AUTHENTICATED
    if(authToken){
        showProtected();
        fetchTransactions(authToken);
    } else {
        showLogin();
    }
    


   /**************************
        LOGIN FUNCTIONALITY 
    ***************************/
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        showLoader();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        // client side validation
        if(!email || !password){
            loginError.innerText = "Please fill in all fields!";
            return;
        }

        // payload sent to proxy
        const payload = {
            partnerUserID: email,
            partnerUserSecret: password
        };

        
        try {

            // Send login request to proxy file
            const res = await fetch("proxy.php?action=authenticate", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload),
                credentials: "include"
            });

            if(!res.ok){
                throw new Error("Network response not okay!");
            }

            const data = await res.json();


            // Fetch transactions and show protected content on successful login
            if(data.authToken){
                showProtected();
                fetchTransactions(data.authToken) ;  
            } 
            
            // Check for error codes on login failure
            else if(data.jsonCode) {
                loginError.innerText = `Login failed (${data.errorCode}): ${data.message || "Unknown error"}`;

                // Check specific error code
                if(data.jsonCode === 401){
                    loginError.innerText = "Invalid password! Try again.";
                } else if (data.jsonCode === 404){
                    loginError.innerText = "Account not found! Please check your email!";
                }
                hideLoader();
            } 
            
            // Unknown error
            else {
                console.error("API ERROR: ", data.jsonCode, data.message);
                loginError.innerText = "Login failed: An Unknown error occured";
                hideLoader();
            }


        } catch (e){
            loginError.innerText = "Internal Server Error!";
        } finally {
            hideLoader();
        }
    });


    /**********************************
        CREATE TRANSACTION FUNCTIONALITY 
    **********************************/
    createTransactionForm.addEventListener("submit", async (e) => {

        // Reset error message
        e.preventDefault();
        document.getElementById("createTransactionError").innerText = "";

        showLoader();

        // Get form values
        const merchant = document.getElementById("merchant").value;
        const created = document.getElementById("date").value;
        const amountInput = document.getElementById("amount").value;

        // Validate inputs
        const validateNameResult = validateMerchantName(merchant);
        const validateAmountResult = validateAmount(amountInput);

        // Convert the amoutn to cents
        const amount = Math.round(parseFloat(amountInput) * 100);

        // Show error messages on validation failure
        if(!validateNameResult.isValid){
            document.getElementById("createTransactionError").innerText = validateNameResult.error;
            return;
        }
        if(!validateAmountResult.isValid){
            document.getElementById("createTransactionError").innerText = validateAmountResult.error;
            return;
        }

        // payload to send to proxy
        const payload = {
            authToken,
            created,
            amount,
            merchant
        }

        try {

            // Send create transaction request to proxy file
            const res = await fetch("proxy.php?action=createTransaction", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload),
                credentials: "include"
            });
            if(!res.ok){
                throw new Error("Network response not okay!");
            }
            const data = await res.json();

            /// Check for Errors
            if(data.jsonCode){
                if(data.jsonCode === 407){
                    expiredAuthToken();
                }
                console.error("API Error:", data.jsonCode, data.message);
                alert(`Error: ${data.message || "Unknown error occured"}`);
                return;
            }

            // Close modal on success and reset the form
            if(data.success || data.transactionID){
                modal.classList.remove("open");
                createTransactionForm.reset();
            }
            console.log("CREATE TRANSACTION RECORD: ", data);
        } catch{
            alert("Failed to create transaction.");
            console.error("Internal Server Error!");
            
        } finally {
            hideLoader();
        }
    });




    /*************************************
        FETCH TRANSACTIONS FUNCTIONALITY 
    *************************************/

    async function fetchTransactions(authToken, startDate = "", endDate = ""){
        showLoader();
        try {
            // Send get transactions request to proxy file
            const url = `proxy.php?action=getTransactions&authToken=${encodeURIComponent(authToken)}&returnValueList=transactionList` + (startDate ? `&startDate=${startDate}` : "") + (endDate ? `&endDate=${endDate}` : "");
            const res = await fetch(url, {
                method: "GET",
                credentials: "include"
            });

            if(!res.ok){
                throw new Error("Network response not okay!");
            }

            const data = await res.json();

            hideLoader();

            // Check for Errors
            if(data.jsonCode){
                if(data.jsonCode === 407){
                    expiredAuthToken();
                }
                console.error("API Error:", data.jsonCode, data.message);
                alert(`Error: ${data.jsonCode} - ${data.message || "Unknown error occured"}`);
                return;
            }

            if(data.success || data.transactionID){

            // render transactions on success
            renderTransactions(data.transactionList);
            } else {
                console.error("API ERROR: ", data.message);
                alert("Failed to fetch transactions")
            }
            
        } catch (e){
            console.error("Internal Server Error!");
            alert("Failed to fetch transaction.");

        }finally {
            hideLoader();
        }
    }
     

        /**************************
          LOGOUT FUNCTIONALITY 
        ***************************/
        const logoutBtn = document.getElementById("logoutBtn");
        logoutBtn.addEventListener("click", async () => {
            showLoader();
            try{
                await fetch("proxy.php?action=logout", {credentials: "include"});
            } catch (e){
                console.error("Internal Server Error during logout!");
            } finally {
                hideLoader();
                showLogin();
            }
        });


        // FILTER TRANSACTIONS
        document.getElementById("filter").addEventListener("click", () => {
            const startDate = document.getElementById("startDate").value;
            const endDate = document.getElementById("endDate").value;
            const authToken = getCookie("authToken");

            fetchTransactions(authToken, startDate, endDate);
        });


        // EXPAND MERCHANT NAME ON CLICK IF EXTENDS BEYOND CELL WIDTH
        const transactionBody = document.getElementById("transactionTableBody");
        transactionBody.addEventListener("click", function(e){
            if(e.target.classList.contains("merchant-cell")){
                e.target.classList.toggle("expanded");
                console.log("Clicked merchant cell");
            }
        });




        /*****************************
          MODAL FUNCTIONALITY 
        *******************************/

        openModal.addEventListener("click", () => {
            modal.classList.add("open");
        })

        closeModal.addEventListener("click", () => {
            modal.classList.remove("open");
        });

       

});
