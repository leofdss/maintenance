const MongoClient = require('mongodb').MongoClient;
const exec = require('child_process').exec;
const zipFolder = require('zip-folder');
const rimraf = require('rimraf');

//backup mongodb database
const cmd = 'mongodump --forceTableScan';
console.log('DB backup started ... ');
console.log(cmd);

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

exec(cmd, function (error, stdout, stderr) {
    if (!error) {
        console.log('DB backup generated ... ');

        //zip backup
        zipFolder(
            __dirname + '/dump', //source
            __dirname + '/dump.zip', //destination
            function (err) {
                if (err) {
                    console.log('Zip error ... ');
                    console.log('oh no!', err);
                } else {
                    console.log('Backup zipped successful');
                    rimraf(__dirname + '/dump', function () {
                        console.log('/dump deleted');
                    });
                }
            }
        );
    }
});