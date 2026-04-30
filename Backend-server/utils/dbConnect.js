const mongoose = require("mongoose");

let connectionPromise = null;

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return true;
    }

    if (!process.env.DATABASE_URL) {
        console.error("DATABASE_URL is not set");
        return false;
    }

    if (!connectionPromise) {
        connectionPromise = mongoose
            .connect(process.env.DATABASE_URL)
            .then(() => {
                console.log("MongoDB connected successfully");
                return true;
            })
            .catch((err) => {
                console.error(`Error connecting to MongoDB: ${err.message}`);
                connectionPromise = null;
                return false;
            });
    }

    return connectionPromise;
};

module.exports = connectDB;
