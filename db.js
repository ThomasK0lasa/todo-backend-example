const MongoClient = require('mongodb');
const name = "todo"
const url = "mongodb://localhost:27017/"

MongoClient.connect(url, {
    useNewUrlParser: true
  }, function (err, db) {
    if (err) throw err;
    global.db = db.db(name);
  });  