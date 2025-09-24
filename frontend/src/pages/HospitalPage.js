import React, { useEffect, useState } from 'react';

function HospitalPage() {
  const [hospitals, setHospitals] = useState([]);
  const [coords, setCoords] = useState({ latitude: null, longitude: null });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const pos = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCoords(pos);

        try {
          const res = await fetch("http://localhost:3001/api/hospitals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pos),
          });

          const data = await res.json();

          // 🔁 Sort hospitals by distance (Haversine)
          const withDistance = data.map((h) => {
            const hLat = h.geometry.location.lat;
            const hLng = h.geometry.location.lng;
            const distance = haversineDistance(pos.latitude, pos.longitude, hLat, hLng);
            return { ...h, distance };
          });

          const sorted = withDistance.sort((a, b) => a.distance - b.distance);
          setHospitals(sorted);
        } catch (err) {
          console.error("❌ Failed to fetch hospital data:", err);
        }
      },
      (err) => {
        console.error("Geolocation failed", err);
        alert("⚠️ Enable location access to get hospitals nearby.");
      }
    );
  }, []);

  // 🧠 Haversine formula to compute distances between two lat/lng
  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371; // Earth radius in KM

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in KM
  };

  return (
    <div className="page">
      <h2>🏥 Nearby Hospitals</h2>
      {hospitals.length > 0 ? (
        <>
          <p><strong>{hospitals.length}</strong> hospitals found near your location.</p>
          <ul className="hospital-list">
            {hospitals.map((h, i) => (
              <li key={i}>
                <strong>{h.name}</strong><br />
                {h.vicinity}<br />
                <small>📍 {h.distance.toFixed(2)} km away</small>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>🔍 Looking for nearby hospitals...</p>
      )}
    </div>
  );
}

export default HospitalPage;
