import React, { useState } from 'react';

function HomePage() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const sendSOS = async () => {
    setLoading(true);

    if (!navigator.geolocation) {
      alert("📍 Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        const payload = {
          latitude,
          longitude,
          message: message || "🚨 Emergency Alert from GeoSOS",
        };

        try {
          const response = await fetch("http://localhost:3001/api/sendsms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            const raw = await response.text();
            console.error("❌ Raw server error:", raw);
            alert("❌ Server error while sending SOS.");
            return;
          }

          const data = await response.json();
          alert("📧 SOS email sent successfully!");
          console.log("✅ SNS response:", data);
          setMessage('');
        } catch (err) {
          console.error("❌ Network/Server Error:", err);
          alert("❌ Failed to send SOS.");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("❌ Geolocation Error:", error.message);
        alert("❌ Failed to get your location.");
        setLoading(false);
      }
    );
  };

  return (
    <div className="page">
      <h2>🚨 Send Emergency Alert</h2>

      <textarea
        rows="5"
        cols="40"
        placeholder="Describe your emergency (optional)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{
          padding: "10px",
          borderRadius: "6px",
          marginBottom: "10px",
          width: "100%",
          maxWidth: "500px",
          fontSize: "1rem"
        }}
      />

      <br />

      <button
        className="sos-button"
        onClick={sendSOS}
        disabled={loading}
        style={{
          opacity: loading ? 0.6 : 1,
          padding: '12px 30px',
          fontSize: '1rem',
          backgroundColor: '#ff3b3b',
          border: 'none',
          borderRadius: '8px',
          color: '#fff',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
        }}
      >
        {loading ? "Sending SOS..." : "Send SOS"}
      </button>
    </div>
  );
}

export default HomePage;
