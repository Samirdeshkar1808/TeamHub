import express from 'express'
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();

const port = process.env.PORT || 3000;
const DBURL = process.env.MongoURL;


//Database connection
mongoose.connect(DBURL)
.then(() => {
    console.log("MongoDB Connected");
})
.catch((err) => {
 console.error("MongoDB Error:");
 console.error(err);
});


app.get( "/" ,(req,res)=>{
    console.log("Get is clicked");
    return res.send("Hello!")
})

app.listen(port , ()=>{
    console.log(`App is listening on ${port}`);
})
