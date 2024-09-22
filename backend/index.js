const express = require('express');
const request = require('request-promise');
const line = require('@line/bot-sdk');

const app = express();
const PORT = process.env.PORT || 5001;

const CHANNEL_ID = '2006370219';
const CHANNEL_SECRET = '36049848f7cea0b19011459871c3d77d';
const CHANNEL_ACCESS_TOKEN = 'u5n/dep+n6J+6ZsTRsWHUL4iPSWFg37eqkyGbNcHMStzc8m3ARmFFfPW56djgCzrAgjXrvawyGOAtm/Oz35nOv7A5CtpJ6ZOrXupP19r7I20iV/Dn52gfNt6MfLqY8GRaU3eXmKyxdt6xWATDK7ZJQdB04t89/1O/w1cDnyilFU=';

// Configure LINE SDK
const client = new line.Client({
    channelAccessToken: CHANNEL_ACCESS_TOKEN
});

// Middleware to parse JSON bodies
app.use(express.json());

// Route to handle order submission
app.post('/api/orders', async (req, res) => {
    const { accessToken, orderItems } = req.body;

    try {
        // Verifying Access Token and Channel ID
        const json = await request.get({
            url: `https://api.line.me/oauth2/v2.1/verify?access_token=${accessToken}`,
            json: true
        });

        if (json.client_id !== CHANNEL_ID) {
            return res.status(401).send('Unauthorized');
        }

        // Getting User Profile by Access Token
        const profile = await request.get({
            url: "https://api.line.me/v2/profile",
            headers: { Authorization: `Bearer ${accessToken}` },
            json: true
        });

        // Send order details to staff
        await sendOrderToStaff(orderItems, profile.userId);

        // Revoke Access Token (optional)
        await request.post({
            url: "https://api.line.me/oauth2/v2.1/revoke",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            form: {
                access_token: `${accessToken}`,
                client_id: CHANNEL_ID,
                client_secret: CHANNEL_SECRET
            }
        });

        res.status(200).send('Order received successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Function to send order details to staff
async function sendOrderToStaff(orderItems, userId) {
    const message = {
        type: 'text',
        text: `ลูกค้าสั่งอาหาร:\n${orderItems.map(item => `- ${item.name}: ${item.quantity}`).join('\n')}`
    };

    // Replace 'STAFF_USER_ID' with the actual user ID of the staff
    await client.pushMessage('STAFF_USER_ID', message)
        .then(() => {
            console.log('Message sent to staff');
        })
        .catch((err) => {
            console.error('Error sending message:', err);
        });
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});