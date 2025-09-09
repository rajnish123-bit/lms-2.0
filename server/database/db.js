import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://rkp102022:vME4xczU3HIWClK9@cluster0.vjal84z.mongodb.net/lms?retryWrites=true&w=majority&appName=Cluster0");
        console.log('MongoDB Connected');
    } catch (error) {
        console.log("error occured", error); 
    }
}
export default connectDB;