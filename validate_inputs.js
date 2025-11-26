// VALIDATE MERCHANT NAME INPUT
function validateMerchantName(name){

    const trimmedName = name.trim(); // trim whitespace

    if(trimmedName.length === 0) return {isValid: false, error: "Merchant name cannot be empty!"};
    if(trimmedName.length < 3 ) return {isValid: false, error: "Merchant name too short, it should be atleast 3 characters!"};
    if(trimmedName.length > 100) return {isValid: false, error: "Merchant name too long, it should be less than 100 characters!"};

    // allow common merchant name characters
    const regex = /^[a-zA-Z0-9\s\u00C0-\u017F.'",&\/()#$@™®-]+$/;
    if(!regex.test(name)) return {isValid: false, error: "Merchant name contains invalid characters! Allowed charaters are letters, numbers, spaces, and . , \' \" & / ( ) # $ @ ™ ® -"}
    // prevent all numbers and symbols
    if (/^\d+$/.test(trimmedName) || /^[\s.'"&\/()#$@™®-]+$/.test(trimmedName)) return {isValid: false, error: "Please enter a valid merchant name. Names cannot consist only of numbers or symbols!"};


    return {isValid: true};
}


// VALIDATE AMOUNT INPUT
function validateAmount(input){
    if (!/^\d+(\.\d{1,2})?$/.test(input)) return {isValid: false, error: "Amount can have up to two decimal places and not include invalid characters!"};
    const amount = parseFloat(input);
    if(isNaN(amount)) return {isValid: false, error: "Amount must be a valid number!"};
    if(amount <= 0) return {isValid: false, error: "Amount must be greater than 0!"};
    if(amount > 1000000) return {isValid: false, error: "Amount exceeds maximum limit of 1,000,000!"};
    return {isValid: true};
}
