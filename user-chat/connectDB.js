import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_URI);
        console.log("Chat ServerConnected to MongoDB");
    } catch (error) {
        console.log("Error connecting to MongoDB", error);
    }
}