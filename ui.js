/*** UI UTILITY FUNCTIONS ***/ 
const loginContent = document.getElementById("loginContent");
const protectedContent = document.getElementById("protectedContent");
const logoutButton = document.getElementById("logoutBtn");
const transactionContent = document.querySelectorAll(".transactionContent");




// SHOW PROTECTED CONTENT
function showProtected(){
    loginContent.style.display="none";
    protectedContent.style.display="block";
    logoutButton.style.display = "inline-block";

}

// SHOW LOGIN CONTENT
function showLogin(){
    loginContent.style.display="block";
    protectedContent.style.display="none";
    transactionContent.forEach(element => element.style.display = "none");

}

// SHOW LOADER
function showLoader(){
    document.getElementById("spinner").classList.add("show");
}

// HIDE LOADER
function hideLoader(){
    document.getElementById("spinner").classList.remove("show");
}