import mongoose from 'mongoose';
import 'dotenv/config'; // Loads .env variables

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected successfully.');
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        // Exit process with failure
        process.exit(1);
    }
};

export default connectDB;