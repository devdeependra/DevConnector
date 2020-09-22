const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const connectDB = async () => {
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useCreateIndex: true,
        });// Returns a promise
        
        console.log("Mongo DB connected...");
    } catch(err) {
        console.error(err.message);
        // Exit the process in failure to make application also fail
        process.exit(1);
    }
}

module.exports = connectDB;