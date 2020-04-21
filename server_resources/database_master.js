var MongoClient = require('mongodb').MongoClient;

// Database manipulation module
var DatabaseMaster = function(uri, db_name){
    console.log("Constructed!");
    this.name = "Database Master";
    var db_uri = uri;
    var mongo_client = new MongoClient(db_uri);
    var db_name = db_name;
    var db = undefined;
    // Connect to database
    mongo_client.connect(function(err){
        if(err != null){
            console.log("Cannot Connect to Database: ", err);
            return;
        }
        db = mongo_client.db(db_name);
        console.log(`\x1b[32mConnected to database.\x1b[0m`);
    });

    // Member functions
    this.insertDocument = function(coll_name, query, callback){
        // Get the collection with name coll_name
        const collection = db.collection(coll_name);
        // Insert data with query
        collection.insertOne(query, function(err, result) {
            if(err) console.log("Error in insert document: ", err);
            if(callback != undefined){
                callback(result);
            }
        });
    };

    this.findDocument = function(coll_name, query, callback){
        // Get the collection with name coll_name
        const collection = db.collection(coll_name);
        // find data with query, find ONE
        collection.findOne(query, function(err, result) {
            if(err) console.log("Error in insert document: ", err);
            if(callback != undefined){
                callback(result);
            }
        });
    };

    this.updateDocument = function(db, coll_name, match_query, update_query, callback){
        // Get the collection with name coll_name
        const collection = db.collection(coll_name);
        // Do the update
        collection.updateOne(match_query, update_query, function(err, result){
            if(callback != undefined){
                callback(result);
            }
        })
    }

}

module.exports = DatabaseMaster;