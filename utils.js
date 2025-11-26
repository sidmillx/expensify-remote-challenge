// Format money from cents to USD, with commas
function formatMoney(amount){
    return (amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Render transactions in table
function renderTransactions(transactions){

    const transactionBody = document.getElementById("transactionTableBody");
    transactionBody.innerHTML = '';

    
    transactions.forEach(transaction => {
        const tr = document.createElement("tr");

        tr.innerHTML = `<td>${transaction.created}</td>
                        <td class="merchant-cell">${transaction.merchant}</td>
                        <td class="transactions__amount">${formatMoney(transaction.amount)}</td>`

        transactionBody.appendChild(tr);
    });

}


 /************************
     COOKIE FUNCTIONS 
*************************/

// CHECK FOR EXPIRED AUTH AND LOGOUT
async function expiredAuthToken(){
    alert("Your session has expired. Please log in again.");
    await fetch("proxy.php?action=logout", {credentials: "include"});
    showLogin();
}

// GET COOKIE BY NAME
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    console.log(`[COOKIE READ] ${name}:`, value);
    return null;
}