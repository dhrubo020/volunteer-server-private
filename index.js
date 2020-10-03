const express = require('express')
const app = express()
const port = 3001
require('dotenv').config()
const bodyParser = require('body-parser')
const cors = require('cors')
app.use(bodyParser.json())
app.use(cors())
const fileUpload = require('express-fileupload');
app.use(fileUpload());
app.use(bodyParser.urlencoded({
    extended: true
}));
var imgbbUploader = require('imgbb-uploader');
const ObjectId = require('mongodb').ObjectId;
app.use('/upload', express.static(__dirname + '/upload'));
const fs = require('fs')


const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fxpfd.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const collection = client.db("db_volunteer_network").collection("coll_event_list");
    const collectionUserEvent = client.db("db_volunteer_network").collection("coll_user_event");
    console.log("db connected")

    app.post('/addNewEventItem', (req, res) => {
        const data = req.body;
        let same = 0;
        console.log(data);
        collection.find({ title: data.title })
            .toArray((err, documents) => {
                console.log(documents.length)
                if (documents.length > 0) {
                    res.send(false)
                } else {
                    collection.insertOne(data)
                        .then(result => {
                            if (result) {
                                res.send(result.insertedCount > 0)
                            }
                        })
                }
            })
    })

    app.get('/allEvents', (req, res) => {
        collection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.get('/search/:id' , (req,res)=>{
        collection.find({_id : ObjectId(req.params.id)})
        .toArray((err, documents)=>{
            res.send(documents[0])
        })
    })

    app.delete('/deleteItem/:id', (req, res) => {
        collection.find({ _id: ObjectId(req.params.id) })
            .toArray((err, documents) => {
                if (documents.length > 0) {
                    collection.deleteOne({ _id: ObjectId(req.params.id) })
                        .then(result => {
                            res.send(result.deletedCount > 0)
                        })
                }
            })
    })

    //------------ api for user -------------
    
    app.post('/saveEvent' , (req,res)=>{
        const eventItem = req.body;
        console.log(eventItem)
        collectionUserEvent.find({eventId: eventItem.eventId})
        .toArray((err , documents)=>{
            console.log(documents.length)
            if(documents.length > 0){
                res.send(false)
            }else{
                collectionUserEvent.insertOne(eventItem)
                .then(result=>{
                    res.send(result.insertedCount > 0)
                })
            }
        })
    })

    app.get('/userEventList/:email', (req,res)=>{
        const user_email = req.params.email;
        console.log(user_email)
        collectionUserEvent.find({email: user_email})
        .toArray((err, documents)=>{
                res.send(documents)
        })
    })

});

app.get('/', (req, res) => {
    res.send('volunteer-network backend!')
})

app.listen(process.env.PORT || port)
