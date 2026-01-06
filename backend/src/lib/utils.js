const validator = require("validator");

// function validateSignup(req) {
//     const {
//         name,
//         email,
//         password,
//     } = req.body;

//     if (!name){
//         throw new Error("Name is required")
//     }else if(!validator.isEmail(email)){
//         throw new Error("Invalid Email Address!")
//     }else if(!validator.isStrongPassword(password)){
//         throw new Error("Password is not strong enough")
//     }

// }


function validateSignup(req) {
    const { name, email, password } = req.body;

    if (!name || name.trim().length < 2) {
        throw new Error("Name is required and must be at least 2 characters");
    }

    if (!email) {
        throw new Error("Email is required");
    }

    if (!validator.isEmail(email)) {
        throw new Error("Invalid Email Address");
    }

    if (!password) {
        throw new Error("Password is required");
    }

    if (!validator.isStrongPassword(password)) {
        throw new Error(
            "Password must contain uppercase, lowercase, number & special character"
        );
    }
}


// function validateLogin(req){ 
//     const {email, password} = req.body;

//     if(!validator.isEmail(email)){
//         throw new Error("Invalid Email Address!")
//     }
//     else if(!validator.isStrongPassword(password)){
//         throw new Error("Password is not strong enough")
//     }

// }

function validateLogin(req) {
    const { email, password } = req.body;

    if (!email) {
        throw new Error("Email is required");
    }

    if (!validator.isEmail(email)) {
        throw new Error("Invalid Email Address");
    }

    if (!password) {
        throw new Error("Password is required");
    }
}



    module.exports = {
        validateSignup,
        validateLogin
    }
