require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');

const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const { fromCognitoIdentityPool } = require("@aws-sdk/credential-provider-cognito-identity");
const { CognitoIdentityClient } = require("@aws-sdk/client-cognito-identity");
const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { v4: uuidv4 } = require("uuid");

const app = express();
const port = process.env.PORT || 3001;

// 🔧 Middleware
app.use(cors());
app.use(bodyParser.json());

// 🌍 Env variables
const REGION = process.env.AWS_REGION;
const IDENTITY_POOL_ID = process.env.COGNITO_IDENTITY_POOL_ID;
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// 🔌 AWS Clients
const snsClient = new SNSClient({
  region: REGION,
  credentials: fromCognitoIdentityPool({
    identityPoolId: IDENTITY_POOL_ID,
    client: new CognitoIdentityClient({ region: REGION }),
  }),
});

const ddbClient = new DynamoDBClient({
  region: REGION,
  credentials: fromCognitoIdentityPool({
    identityPoolId: IDENTITY_POOL_ID,
    client: new CognitoIdentityClient({ region: REGION }),
  }),
});

// 📍 Reverse Geocode
app.post('/api/location', async (req, res) => {
  const { latitude, longitude } = req.body;

  try {
    const result = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
      params: {
        latlng: `${latitude},${longitude}`,
        key: GOOGLE_API_KEY,
      },
    });

    const address = result.data?.results?.[0]?.formatted_address || "Address not found";
    res.json({ coordinates: { latitude, longitude }, userAddress: address });
  } catch (err) {
    console.error("🧭 Reverse geocoding failed:", err);
    res.status(500).json({ error: 'Failed to get address' });
  }
});

// 🏥 Nearby Hospitals
app.post('/api/hospitals', async (req, res) => {
  const { latitude, longitude } = req.body;

  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json`, {
      params: {
        location: `${latitude},${longitude}`,
        radius: 5000,
        type: 'hospital',
        key: GOOGLE_API_KEY,
      },
    });

    const hospitals = response.data?.results || [];
    res.json(hospitals);
  } catch (err) {
    console.error("🏥 Hospital search failed:", err);
    res.status(500).json({ error: 'Failed to find hospitals' });
  }
});

// 🚨 Send SOS Alert (Full)
app.post('/api/sendsms', async (req, res) => {
  const { latitude, longitude, message: userMessage = "🚨 Emergency Alert from GeoSOS" } = req.body;
  const estTime = new Date().toLocaleString("en-US", {
  timeZone: "America/New_York",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
});
  const eventId = uuidv4();

  if (!latitude || !longitude) {
    return res.status(400).json({ error: "Missing latitude or longitude" });
  }

  // 🔍 Reverse Geocode
  let address = "Unknown location";
  try {
    const geoRes = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
      params: {
        latlng: `${latitude},${longitude}`,
        key: GOOGLE_API_KEY,
      },
    });

    address = geoRes.data?.results?.[0]?.formatted_address || address;
  } catch (error) {
    console.error("🧭 Geocoding failed:", error.message);
  }

  // ✉️ Build Message
  const emailMessage = `
🚨 SOS Emergency Alert 🚨

📍 Address:
${address}

📝 User Message:
${userMessage}

🌐 Google Maps:
https://maps.google.com/?q=${latitude},${longitude}

🕒 Timestamp:
${estTime}
`;

  try {
    // 1️⃣ Send SNS Email
    const snsCommand = new PublishCommand({
      Message: emailMessage,
      TopicArn: SNS_TOPIC_ARN,
    });

    const snsResponse = await snsClient.send(snsCommand);
    console.log("📧 SNS Message ID:", snsResponse.MessageId);

    // 2️⃣ Log to DynamoDB
    const ddbCommand = new PutItemCommand({
      TableName: "GeoSOSAlerts",
      Item: {
        eventId: { S: eventId },
        timestamp: { S: estTime },
        address: { S: address },
        latitude: { N: latitude.toString() },
        longitude: { N: longitude.toString() },
        userMessage: { S: userMessage },
        snsMessageId: { S: snsResponse.MessageId || "N/A" },
      },
    });

    await ddbClient.send(ddbCommand);
    console.log("🪵 Logged to DynamoDB:", eventId);

    res.json({ success: true, messageId: snsResponse.MessageId });
  } catch (err) {
    console.error("❌ SNS or DynamoDB Error:", err);
    res.status(500).json({ error: "Failed to send and log SOS alert" });
  }
});

// 🚀 Server Start
app.listen(port, () => {
  console.log(`🌐 GeoSOS backend running at http://localhost:${port}`);
});
