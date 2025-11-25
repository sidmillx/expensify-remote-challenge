document.addEventListener("DOMContentLoaded", () => {

       

         //Check auth token
        let authToken = getCookie("authToken");
        // const authToken = localStorage.getItem("authToken")
        console.log("TOKEN IS: ", authToken);
        const loginContent = document.getElementById("loginContent");
        const transactionTable = document.getElementById("transactionTable");
        const transactionContent = document.querySelectorAll(".transactionContent");

        if(authToken){
            if(loginContent) loginContent.style.display = "none";
            showDashboard();
            fetchTransactions(authToken);
        } else {
            transactionTable.style.display = "none";
            transactionContent.forEach(element => element.style.display = "none");
            loginContent.style.display = "block";
        }
    


        // AUTHENTICATE USER
        const loginForm = document.getElementById("loginForm");
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            showLoader();
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            console.log("Sending:", { email, password });

            if(!email || !password){
                document.getElementById("loginError").innerText = "Please enter email and password!";
                return;
            }

            const payload = {
                partnerName: "applicant",
                partnerPassword: "d7c3119c6cdab02d68d9",
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

                    document.getElementById("loginContent").style.display = "none";
                    document.getElementById("transactionTable").style.display = "block";
                    transactionContent.forEach(element => element.style.display = "block");


                    showDashboard();
                    fetchTransactions(data.authToken);
                    
                } else {
                    document.getElementById("loginError").innerText = "Login failed!";
                }
            } catch (e){
                document.getElementById("loginError").innerText = "Server Error!";
            }

            console.log(data);
        });


        function getCookie(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
            console.log(`[COOKIE READ] ${name}:`, value);
            return null;
        }

        function showDashboard(){
            console.log("dashboard")
        }



        // CREATE TRANSACTION 
        const createTransactionBtn = document.getElementById("saveTransaction");
        createTransactionBtn.addEventListener("click", async () => {
            const merchant = document.getElementById("merchant").value;
            const amount = document.getElementById("amount").value;
            const created = document.getElementById("date").value;

            if(!merchant || !amount || !created){
                document.getElementById("loginError").innerText = "Provide all necessary fields";
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

                console.log("CREATE TRANSACTION RECORD: ", data);
            } catch{
                console.log("hello World")
            }
        });

        //GET TRANSACTIONS
        async function fetchTransactions(authToken){
            showLoader();

            console.log("INSIDE FETCH FUNCTION FETCHIN.............!")
            try {
                const res = await fetch(`proxy.php?action=getTransactions&authToken=${encodeURIComponent(authToken)}&returnValueList=transactionList`, {
                    method: "GET",
                    credentials: "include"
                });

                const data = await res.json();
                console.log("GET DATA.....................: ", data);
                hideLoader();
                renderTransactions(data.transactionList);
            } catch (e){
                hideLoader();
                console.error("Internal Server Error!");
            }
        }

        function renderTransactions(transactions){

            const transactionBody = document.getElementById("transactionTableBody");
            transactionBody.innerHTML = '';

            
            transactions.forEach(transaction => {
                const tr = document.createElement("tr");

                tr.innerHTML = `<td>${transaction.created}</td>
                                <td>${transaction.merchant}</td>
                                <td>${transaction.amount}</td>`

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
            loginContent.style.display="block";
            transactionTable.style.display="none";
            transactionContent.forEach(element => element.style.display = "none");

        });




        let lastCookie = document.cookie;
        setInterval(() => {
            if (document.cookie !== lastCookie) {
                console.log("[COOKIE CHANGED]:", document.cookie);
                lastCookie = document.cookie;
            }
        }, 500); // check every 0.5s

});