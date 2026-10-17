# 🧭 GeoSOS

GeoSOS is a full-stack emergency web app. In one tap it sends an SOS alert with your exact location, shows you on a live map, and lists the nearest hospitals.

## Features

- **One-tap SOS**: captures your browser location and an optional message, reverse-geocodes it to a street address, then publishes an alert (address, message, Google Maps link, timestamp) to an AWS SNS topic. Subscribers to the topic receive it as an email.
- **Incident log**: every alert is saved to a DynamoDB table (`GeoSOSAlerts`) with a unique event ID, coordinates, address, message and the SNS message ID.
- **Live map**: an Amazon Location Service map centered on your position, with a marker for you and place search.
- **Nearby hospitals**: hospitals within 5 km found with the Google Places API, sorted by distance (Haversine).

## Architecture

```
React frontend (port 3000)
   ├── /          SOS page      ──POST /api/sendsms───▶ Express server (port 3001)
   ├── /hospitals Hospitals     ──POST /api/hospitals─▶   ├── Google Geocoding API
   └── /map       Live map      (talks to AWS directly)   ├── Google Places API
                                                          ├── AWS SNS        (alert email)
                                                          └── AWS DynamoDB   (incident log)

Map page ──Cognito identity pool──▶ Amazon Location Service (map + place search)
```

The server reaches SNS and DynamoDB with temporary credentials from an Amazon Cognito identity pool, so no AWS access keys are stored in the project.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router, react-map-gl, AWS Amplify (Auth), AWS SDK (Location) |
| Backend | Node.js, Express 5, Axios, dotenv, uuid |
| AWS | SNS, DynamoDB, Cognito Identity, Amazon Location Service |
| Google | Geocoding API, Places API (Nearby Search) |

## Project structure

```
.
├── Servercode/            Express backend
│   └── server.js          API routes, SNS + DynamoDB clients
└── frontend/              Create React App frontend
    └── src/
        ├── pages/         HomePage (SOS), MapPage, HospitalPage
        ├── components/    Header
        └── aws-exports.js Amplify / Cognito configuration
```

## API

All routes are `POST` with a JSON body.

| Route | Body | Returns |
|---|---|---|
| `/api/sendsms` | `{ latitude, longitude, message? }` | `{ success, messageId }`. Reverse-geocodes, publishes to SNS, logs to DynamoDB. |
| `/api/hospitals` | `{ latitude, longitude }` | Array of hospitals within 5 km (Google Places results). |
| `/api/location` | `{ latitude, longitude }` | `{ coordinates, userAddress }` (reverse geocode). |

## Getting started

### Prerequisites

- Node.js 18 or later
- An AWS account with:
  - an SNS topic with at least one confirmed email subscription
  - a DynamoDB table named `GeoSOSAlerts` with partition key `eventId` (String)
  - a Cognito identity pool whose role allows `sns:Publish` and `dynamodb:PutItem`, plus Amazon Location Service access for the map
  - an Amazon Location map named `GeoSOSMap` and a place index named `GeoSOSPlaceIndex`
- A Google Cloud API key with the Geocoding and Places APIs enabled

### 1. Backend

```bash
cd Servercode
npm install
```

Create `Servercode/.env`:

```
AWS_REGION=us-east-2
COGNITO_IDENTITY_POOL_ID=your_identity_pool_id
SNS_TOPIC_ARN=your_sns_topic_arn
GOOGLE_API_KEY=your_google_api_key
PORT=3001
```

```bash
npm start
```

### 2. Frontend

Update `frontend/src/aws-exports.js` with your own region, identity pool ID and user pool values, then:

```bash
cd frontend
npm install
npm start
```

Open http://localhost:3000. Allow location access when the browser asks.

## Notes

- The frontend calls the backend at `http://localhost:3001`, so both must run locally for the SOS and hospital pages to work.
- Keep `.env` out of version control. It is already listed in `.gitignore`.
