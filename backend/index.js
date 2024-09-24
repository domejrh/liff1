const request = require('request-promise')

// Verifying Access Token and Channel ID
const json = await request.get({
  url: `https://api.line.me/oauth2/v2.1/verify?access_token=${accessToken}`,
  json: true
})
if (json.client_id !== CHANNEL_ID) {
  return 401
}


// Getting User Profile by Access Token
const profile = await request.get({
  url: "https://api.line.me/v2/profile",
  headers: { Authorization: `Bearer ${accessToken}` },
  json: true
})


// Revoke Access Token
await request.post({
 url: "https://api.line.me/oauth2/v2.1/revoke",
 headers: { "Content-Type": "application/x-www-form-urlencoded" },
 form: {
   access_token: `${accessToken}`,
   client_id: CHANNEL_ID,
   client_secret: CHANNEL_SECRET
 } 
})

const functions = require('firebase-functions');
const express = require('express');
const app = express();
app.use(express.json());

app.post('/createOrder', async (req, res) => {
    const { userId, orderItems } = req.body;

    // �Ѵ��ä���觫��� �� �觢�ͤ�����ѧ��ѡ�ҹ
    const message = `�١�����������:\n${orderItems.map(item => `${item.id}: ${item.quantity} ���`).join('\n')}`;
    // �觢�ͤ��������ѧ��ѡ�ҹ���ͺѹ�֡㹰ҹ������

    res.status(200).send("Order received");
});

exports.api = functions.https.onRequest(app);