import mongoose from 'mongoose';

const connectDB = async () => { 
    try{
        await mongoose.connect(process.env.MONGO_DB_URI,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })

        console.log('Connected to database');
        
    }catch(err){
        console.log(`Error connecting to database : ${err}`);
    }
}

export default connectDB;