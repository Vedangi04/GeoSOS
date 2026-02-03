# GeoSOS
🧭 GeoSOS: Spatial Emergency Response System
GeoSOS is a comprehensive safety application that provides users with an immediate SOS mechanism, real-time Geographical Mapping, and a Hospital Locator. It leverages high-performance cloud services to ensure that emergency data is processed and communicated with zero latency.

# 🛠️ Core Functionality
🚨 One-Tap SOS: Uses AWS SNS to broadcast emergency alerts via SMS/Email to pre-configured contacts.

🗺️ Spatial Mapping: A dedicated map interface to visualize the user's current coordinates and surrounding safety markers.

🏥 Healthcare Directory: A specialized hospital search feature that pulls resource data from AWS DynamoDB.

🔐 Identity Management: Secure user sessions and temporary AWS credentials handled via Cognito.

# 📐 System Architecture
The application is split into a decoupled Client-Server architecture to ensure scalability and security.

Frontend (React)

The UI is built for speed and clarity. Using react-router-dom, the app provides a seamless transition between the emergency dashboard and mapping tools.

Dynamic Navigation: The Header component intelligently highlights the active route (SOS, Map, or Hospitals).

State Management: Handles real-time location data and API responses from the backend.

Backend (Node.js)

The server acts as the secure gateway to AWS SDK v3.

Persistence: Incident logs and hospital metadata stored in DynamoDB.

Identity: Cognito Identity allows for fine-grained access control.

Messaging: SNS handles the logic for outbound emergency notifications.

# 📁 Repository Structure
Plaintext
├── client/                 # React Application
│   ├── src/
│   │   ├── components/     # Header, SOS, Map, etc.
│   │   ├── App.js          # Routing logic
│   │   └── Header.css      # Custom styling for navigation
├── server/                 # Node.js Backend
│   ├── main.py             # (Optional) Data processing scripts
│   ├── package.json        # AWS SDK v3 dependencies
│   └── .env                # AWS Credentials (hidden)
└── README.md

# 🚀 Getting Started
Prerequisites

Node.js (v18.0.0+)

AWS Account with SNS, DynamoDB, and Cognito configured.

# 🔧 Dependencies
Package,Purpose
@aws-sdk/client-sns,Sending emergency notifications
@aws-sdk/client-dynamodb,Spatial data and log storage
express,REST API framework
react-router-dom,Client-side navigation & deep linking
uuid,Unique identifiers for SOS incidents
