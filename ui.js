/*** UI UTILITY FUNCTIONS ***/ 
const loginContent = document.getElementById("loginContent");
const protectedContent = document.getElementById("protectedContent");
const logoutButton = document.getElementById("logoutBtn");
const transactionContent = document.querySelectorAll(".transactionContent");




// SHOW PROTECTED CONTENT
export function showProtected(){
    loginContent.style.display="none";
    protectedContent.style.display="block";
    logoutButton.style.display = "inline-block";

}

// SHOW LOGIN CONTENT
export function showLogin(){
    loginContent.style.display="block";
    protectedContent.style.display="none";
    transactionContent.forEach(element => element.style.display = "none");

}

// SHOW LOADER
export function showLoader(){
    document.getElementById("spinner").classList.add("show");
}

// HIDE LOADER
export function hideLoader(){
    document.getElementById("spinner").classList.remove("show");
}
