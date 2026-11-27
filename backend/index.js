import express from 'express'
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authroute from './routes/authroute.js';
import organizationroute from './routes/organizationroute.js'
import Teamroute from './routes/Teamroute.js';

import Taskroutes from './routes/Taskroutes.js';
import requestroutes from './routes/requestroutes.js';
import dashboardroutes from './routes/dashboardroutes.js';
import userroutes from './routes/userroutes.js';

import cors from 'cors';

dotenv.config();

const app = express();

const port = process.env.PORT || 3000;
const DBURL = process.env.MongoURL;

app.use(express.json());

//Database connection
mongoose.connect(DBURL)
.then(() => {
    console.log("MongoDB Connected");
})
.catch((err) => {
 console.error("MongoDB Error:");
 console.error(err);
});


//used to connect frontend and backend as both are on different ports.
const allowedOrigins = [
  "http://localhost:5173",
  "https://team-hub-tau-one.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use('/auth', authroute);
app.use('/organizations', organizationroute);

app.use('/teams' , Teamroute);

app.use('/tasks' , Taskroutes);

app.use('/requests' , requestroutes);

app.use('/dashboard' , dashboardroutes);

app.use('/profile', userroutes);

//health route
app.get('/health' , (req,res)=>{
    return res.status(200).json({
        messsage : "UP"
    });
});

app.listen(port , ()=>{
    console.log(`App is listening on ${port}`);
});
