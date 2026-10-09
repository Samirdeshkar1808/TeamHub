const express = require('express');

const app = express();

const port = 3000;

app.get( "/" ,(req,res)=>{
    console.log("Get is clicked");
    return res.send("Hello!")
})

app.listen(port , ()=>{
    console.log(`App is listening on ${port}`);
})
