import mongoose from "mongoose";

const connectDB = async () =>{
    try{
        await mongoose.connect(process.env.MONGO_DB_URI)
        console.log(`Connected to Database`);
        
    }catch(err){
        console.log(`Error connecting to Database`);
    }
}

export default connectDB