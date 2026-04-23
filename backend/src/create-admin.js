
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { User } = require('./model/user');
const dotenv = require('dotenv');
const path = require('path');

// Load env from one level up
dotenv.config({ path: path.join(__dirname, '../.env') });

const createAdmin = async () => {
    try {
        const mongoUri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.sxq7fz8.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`;
        
        await mongoose.connect(mongoUri);
        console.log("Connected to Database");

        const adminEmail = "admin@vibe.com";
        const adminPassword = "AdminPassword@123";
        
        const existingAdmin = await User.findOne({ email: adminEmail });
        
        if (existingAdmin) {
            console.log("Admin already exists. Updating role to 'admin'...");
            existingAdmin.role = "admin";
            await existingAdmin.save();
            console.log("Admin role updated successfully.");
        } else {
            console.log("Creating new admin user...");
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            
            const newAdmin = new User({
                name: "System Administrator",
                username: "admin_terminal",
                email: adminEmail,
                password: hashedPassword,
                role: "admin",
                about: "Official Administrator of the Vibe Network Terminal.",
                gender: "other"
            });
            
            await newAdmin.save();
            console.log("Admin user created successfully!");
            console.log("Email: " + adminEmail);
            console.log("Password: " + adminPassword);
        }

        mongoose.connection.close();
    } catch (err) {
        console.error("Error creating admin: ", err);
        process.exit(1);
    }
};

createAdmin();
