const exec = require('child_process').exec;
const zipFolder = require('zip-folder');
const rimraf = require('rimraf');

const upload = require('./lib/upload');

const second = 1000;
const minute = 60 * second;
const hour = 60 * minute;
const frequency = 24 * hour;

const base = '--host 172.25.0.1 --port 27017';
const login = '--username root --password "root"';
const auth = '--authenticationDatabase=admin --authenticationMechanism=SCRAM-SHA-1';

//backup mongodb database
const cmd = [
    'mongodump',
    base,
    login,
    auth,
    '--forceTableScan'
].join(' ');
console.log('DB backup started ... ');
console.log(cmd);

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
