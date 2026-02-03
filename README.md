# 🧭 GeoSOS: Spatial Emergency Response System
GeoSOS is a full-stack emergency management platform designed to provide immediate SOS assistance, real-time location tracking, and proximity-based hospital discovery. By integrating React with AWS Cloud Services, it ensures that emergency signals are processed with high reliability and speed.

🌟 Key Features
🚨 One-Tap SOS: Uses AWS SNS to broadcast emergency alerts via SMS/Email to pre-configured contacts.

🗺️ Interactive Map: Real-time spatial visualization to track user location and incidents.

🏥 Hospital Locator: Geolocation-based search to find the nearest medical facilities.

🔐 Identity Management: Secure user sessions and temporary AWS credentials handled via Cognito.

# 📁 Repository Structure
Plaintext
.
├── client/                 # React Frontend Application
│   ├── src/
│   │   ├── components/     # Header, SOS, Map, Hospitals
│   │   ├── App.js          # Main routing and logic
│   │   └── Header.css      # Custom styling for navigation
│   └── package.json        # Frontend dependencies
├── server/                 # Node.js Backend (Express)
│   ├── main.py             # (Optional) Python data processing scripts
│   ├── package.json        # AWS SDK v3 & Server dependencies
│   └── .env                # Environment variables (AWS Credentials)
└── README.md               # Project documentation

Package	Purpose
@aws-sdk/client-sns	Sending emergency notifications
@aws-sdk/client-dynamodb	Spatial data and incident log storage
@aws-sdk/client-cognito-identity	User authentication and identity pools
express	REST API framework
uuid	Generating unique identifiers for SOS incidents
Frontend (React)

Package	Purpose
react-router-dom	Client-side navigation & active route tracking
axios	Handling API requests to the Express server

# 🚀 Getting Started
Prerequisites

Node.js: v18.0.0+

AWS Account: Configured access to SNS, DynamoDB, and Cognito.
