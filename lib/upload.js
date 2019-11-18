function uploadFileToDrive(cb) {
    console.log('');
    const fs = require('fs');
    const readline = require('readline');
    const { google } = require('googleapis');

    // If modifying these scopes, delete token.json.
    const SCOPES = [
        'https://www.googleapis.com/auth/drive.metadata.readonly',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/devstorage.read_write',
        'https://www.googleapis.com/auth/plus.me',
        'https://www.googleapis.com/auth/compute',
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/documents.readonly',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/drive.appdata',
        'https://www.googleapis.com/auth/drive.metadata',
        'https://www.googleapis.com/auth/drive.photos.readonly',
        'https://www.googleapis.com/auth/drive.scripts',
        'https://www.googleapis.com/auth/drive.activity',
        'https://www.googleapis.com/auth/drive.activity.readonly'
    ];
    // The file token.json stores the user's access and refresh tokens, and is
    // created automatically when the authorization flow completes for the first
    // time.
    const TOKEN_PATH = './data/token.json';

    // Load client secrets from a local file.
    fs.readFile('./data/credentials.json', (err, content) => {
        if (err) {
            const msn = 'paste ./data/credentials.json by googleapi: https://developers.google.com/drive/api/v3/quickstart/nodejs';
            return console.log(msn, err);
        }
        // Authorize a client with credentials, then call the Google Drive API.
        console.log('Read ./data/credentials.json');
        authorize(JSON.parse(content), uploadFiles);
    });

    /**
     * Create an OAuth2 client with the given credentials, and then execute the
     * given callback function.
     * @param {Object} credentials The authorization client credentials.
     * @param {function} callback The callback to call with the authorized client.
     */
    function authorize(credentials, callback) {
        const { client_secret, client_id, redirect_uris } = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]);

        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, (err, token) => {
            if (err) return getAccessToken(oAuth2Client, callback);
            oAuth2Client.setCredentials(JSON.parse(token));
            console.log('Read ' + TOKEN_PATH);
            callback(oAuth2Client);
        });
    }

    /**
     * Get and store new token after prompting for user authorization, and then
     * execute the given callback with the authorized OAuth2 client.
     * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
     * @param {getEventsCallback} callback The callback for the authorized client.
     */
    function getAccessToken(oAuth2Client, callback) {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });
        console.log('Authorize this app by visiting this url:', authUrl);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
            oAuth2Client.getToken(code, (err, token) => {
                if (err) return console.error('Error retrieving access token', err);
                oAuth2Client.setCredentials(token);
                // Store the token to disk for later program executions
                fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                    if (err) return console.error(err);
                    console.log('Token stored to', TOKEN_PATH);
                });
                callback(oAuth2Client);
            });
        });
    }

    /**
     * Lists the names and IDs of up to 10 files.
     * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
     */
    function uploadFiles(auth) {
        const drive = google.drive({ version: 'v3', auth });
        const date = new Date();
        const fileName = 'dump' + date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear() + '.zip';
        var fileMetadata = {
            'name': fileName
        };
        console.log('Read ./dump.zip');
        var media = {
            mimeType: 'application/zip',
            body: fs.createReadStream('./dump.zip')
        };
        console.log('upload ...');
        drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id'
        }, function (err, file) {
            if (err) {
                // Handle error
                console.error(err);
                console.log('Make sure you shared your drive folder with service email/user.')
            } else {
                console.log('upload complete.', file.data);
            }
        });
    }
}

module.exports = uploadFileToDrive;
