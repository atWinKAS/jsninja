const fs = require('fs');
const https = require('https');
// const utils = require
fs.readFile('./token.json', 'utf8', (err, result) => {
  const creds = JSON.parse(result);
  setInterval(() => {
    https.get(
      `${creds.url}liveChatId=${creds.chatId}&key=${creds.token}`,
      response => {
        let data = '';
        response.setEncoding('utf8');
        response.on('data', d => (data += d));
        response.on('end', () => {
          const history = JSON.parse(data).items.map(
            i => i.snippet.textMessageDetails.messageText + '\n',
          );

          fs.writeFile('./chat.txt', history, 'utf8', (err, result) => {
            if (err) {
              console.error('ERR!!', err);
            }
            console.log(result);
          });
        });
      },
    );
  }, 1000);
});
