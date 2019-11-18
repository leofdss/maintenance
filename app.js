const MongoClient = require('mongodb').MongoClient;

function initMongo(callback) {
    const c = {
        useNewUrlParser: true,
        useUnifiedTopology: true
    };
    MongoClient.connect('mongodb://localhost:27017/tizza', c, function (err, client) {
        if (err) {
            callback(err);
        } else {
            callback(null, client);
        }
    });
}