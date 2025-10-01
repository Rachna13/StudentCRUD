const fs = require('fs');
const { google } = require('googleapis');

const TOKEN_PATH = 'token.json';
const CREDENTIALS_PATH = 'credentials.json';

function getAuth() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  oAuth2Client.setCredentials(token);
  return oAuth2Client;
}

function uploadFile(fileId, filePath) {
  const auth = getAuth();
  const drive = google.drive({ version: 'v3', auth });

  const fileMetadata = { name: 'students.xlsx' };
  const media = {
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    body: fs.createReadStream(filePath),
  };

  drive.files.update({ fileId, media, resource: fileMetadata }, (err) => {
    if (err) return console.error('❌ Error updating file:', err);
    console.log('✅ File updated on Google Drive');
  });
}

function downloadFile(fileId, destPath, callback) {
  const auth = getAuth();
  const drive = google.drive({ version: 'v3', auth });
  const dest = fs.createWriteStream(destPath);

  drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' }, (err, res) => {
    if (err) return console.error('❌ Error downloading file:', err);
    res.data
      .on('end', () => { console.log('✅ File downloaded'); if (callback) callback(); })
      .on('error', err => console.error('❌ Error:', err))
      .pipe(dest);
  });
}

module.exports = { uploadFile, downloadFile };
