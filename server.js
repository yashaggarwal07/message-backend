const express = require('express');
const mongoose = require('mongoose');
const cors =require('cors');
const Messages = require('./dbMessages');
const Pusher= require('pusher');

const app=express();

const port = 9000;

var pusher = new Pusher({
    appId: '1087461',
    key: 'e517e476f956ce009d72',
    secret: '7e1307bd6eb4438d4c74',
    cluster: 'eu',
    useTLS: true,
  });
//middleware
app.use(express.json());
app.use(cors());

const connection_url = 'mongodb+srv://admin:A0fnag7WCkMHg1mI@cluster0.7jtkr.mongodb.net/message-app?retryWrites=true&w=majority';
mongoose.connect(connection_url,{
userCreateindex: true,
useNewUrlParser: true,
useUnifiedTopology: true,
});

const db = mongoose.connection
db.once('open',()=>{
    console.log("db is connected");

    const msgCollection = db.collection("messagecontents");// same as in dbmessage file 
    const changeStream = msgCollection.watch();
    console.log(changeStream);

    changeStream.on("change",(change)=>{
        console.log("A change occured",change);

    if(change.operationType === 'insert'){
        const messageDetails = change.fullDocument;
        pusher.trigger("messages","inserted",{
            name: messageDetails.name,
            message: messageDetails.message,
            timeStamp:messageDetails.timeStamp,
        });
    }else{
        console.log('Error trigging Pusher');
    }
});
});

app.get("/",(   req,res)=> res.status(200).send("hello world"));

app.post("messages/sync",(req,res)=>{
   
    Messages.find((err,data)=>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(200).send(data)
        }
    })
})

app.post("/messages/new",(req,res)=>{
    const dbMessage = req.body;
    Messages.create(dbMessage,(err,data)=>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(201).send(`new message created: \n ${data}`)
        }
    })
})

app.listen(port,()=> console.log(`listening on localhost:${port}`));
