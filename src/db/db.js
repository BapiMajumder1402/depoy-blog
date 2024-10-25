import mongoose from "mongoose";
import { dbName } from "../../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_DB}/${dbName}`);
        console.log(`MongoDB Connected: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log('DB Connection ERROR:', error);
        process.exit(1);
    }
};

export default connectDB;