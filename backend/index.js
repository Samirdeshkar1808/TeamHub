import express from 'express'
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authMiddleware from './middleware/authmiddleware.js';
import authroute from './routes/authroute.js';
import organizationroute from './routes/organizationroute.js'
import Teamroute from './routes/Teamroute.js';

import Taskroutes from './routes/Taskroutes.js';
import requestroutes from './routes/requestroutes.js';
import dashboardroutes from './routes/dashboardroutes.js';

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


app.get( "/" ,(req,res)=>{
    console.log("Get is clicked");
    return res.send("Hello!")
});

app.use('/auth', authroute);
app.use('/organizations', organizationroute);

app.use('/:organizationId/teams' , Teamroute);

app.use('/tasks' , Taskroutes);

app.use('/requests' , requestroutes);

app.use('/dashboard' , dashboardroutes);


app.get('/me', authMiddleware, (req, res) => {
  return res.status(200).json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    },
  });
});

app.listen(port , ()=>{
    console.log(`App is listening on ${port}`);
});
