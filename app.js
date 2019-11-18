const MongoClient = require('mongodb').MongoClient;
const exec = require('child_process').exec;
const zipFolder = require('zip-folder');
const rimraf = require('rimraf');

const upload  = require('./lib/upload');

const second = 1000;
const minute = 60 * second;
const hour = 60 * minute;
const frequency = 24 * hour;

//backup mongodb database
const cmd = 'mongodump  --host="192.168.1.190" --port=27017 --forceTableScan';
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

function init() {
    console.log('init');
    exec(cmd, function (error, stdout, stderr) {
        console.log(stdout, stderr)
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
                        upload();
                        rimraf(__dirname + '/dump', function () {
                            console.log('/dump deleted');
                        });
                    }
                }
            );
        } else {
            console.log('oh no!', error);
        }
    });
}

init();
setInterval(() => { init(); }, frequency);
