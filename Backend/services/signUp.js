const bcrypt = require('bcrypt');
const User = require('../models/Admin');


exports.signUp = async ( req ) => {
    try{
        const { username, password, fullName, age } = req;
        const existingUser = await User.findOne({ username });
        if (existingUser) 
            return { success: false, error: "Username already exists" };

      
        const user = new User({ username, password, fullName, age });
        await user.save();
        return { success: true, user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}