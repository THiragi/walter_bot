'use strict';

const express = require('express');
const line = require('@line/bot-sdk');
const PORT = process.env.PORT || 3000;
const bp = require('body-parser'); // body-parserがないとreq.body.eventsが取れない
require('dotenv').config(); 

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const app = express();
// req.body.eventsでlineメッセージを受け取れるように設定。
app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))

app.get('/', (req, res) => res.send('Hello LINE BOT!(GET)')); //ブラウザ確認用(無くても問題ない)
app.post('/webhook', (req, res) => {
    // res.setHeader('Content-Type', 'text/plain');

    // ERR_HTTP_HEADERS_SENTが起こるので、thenとcatchでreturnさせるようにする。
    Promise
      .all(req.body.events.map(handleEvent))
      .then((result) => {
        if (!result) {
          throw new Error("Messages not found");
        }
        // console.log(result);
        return res.status(200).json(result);
      })
      .catch((error) => {
        console.log(error);
        return res.status(404).json({ error });
      });
});

const client = new line.Client(config);

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: event.message.text //実際に返信の言葉を入れる箇所
  });
}

// app.listen(PORT);
// console.log(`Server running at ${PORT}`);

(process.env.NOW_REGION) ? module.exports = app : app.listen(PORT);
console.log(`Server running at ${PORT}`);