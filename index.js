const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;
const bodyParser = require('body-parser');
const { debugConsole } = require('./utils.js');

const MongoClient = require('mongodb');
const dbname = "todo"
const dburl = "mongodb://localhost:27017/"
var db;

// Initialize connection once
MongoClient.connect(dburl, function(err, client) {
  if(err) throw err;
  db = client.db(dbname)

  app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
  })
});

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('TODO BACKEND says Hello World!!!')
})

app.get('/v1/elements', (req, res) => {
  console.log(db);
  db.collection('elements')
    .find( { $or : [ {deleted: false}, {deleted: null} ]})
    .sort()
    .toArray().then(
      items => {
        res.send(JSON.stringify(items));
        debugConsole(new Date().toLocaleString() + " list of elements requested");
      })
})

app.post('/v1/elements', (req, res) => {
  db.collection('elements').insertOne({
      name: req.body.element,
      dateAdded: new Date(),
      done: false,
      deleted: false
    },
    (err, mongoResponse) => {
      if (err) throw err;
      let response = { id: mongoResponse.insertedId }
      res.send(response);
      debugConsole(new Date().toLocaleString() + " " + mongoResponse.insertedId + " document CREATED");
    })
})

app.put('/v1/elements/:index', async (req, res) => {
  var ObjectID = require('mongodb').ObjectID;
  let myQuery = { _id: ObjectID(req.params.index)};
  let newValue = { $set: {done: true} };
  let queryResult = await db.collection('elements').findOne( myQuery);
  if (queryResult.done) newValue = { $set: {done: false} };
  db.collection('elements')
    .updateOne(myQuery, newValue)
    .then(result => {
      const { matchedCount, modifiedCount } = result;
      if(matchedCount && modifiedCount) {
        debugConsole(new Date().toLocaleString() + " " + req.params.index + " document UPDATED");
        res.sendStatus(204);
      } else {
        res.sendStatus(404);
      }
    })
    .catch(err => console.error('err'));
})

app.delete('/v1/elements/:index', (req, res) => {
  var ObjectID = require('mongodb').ObjectID;
  let myQuery = { _id: ObjectID(req.params.index)};
  let newValue = { $set: {deleted: true} };
  db.collection('elements')
  .updateOne(myQuery, newValue)
  .then(result => {
    const { matchedCount, modifiedCount } = result;
    if(matchedCount && modifiedCount) {
      debugConsole(new Date().toLocaleString() + " " + req.params.index + " document DELETED");
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  })
  .catch(err => console.error('err'));
})