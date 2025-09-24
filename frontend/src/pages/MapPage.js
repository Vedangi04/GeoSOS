import React, { useEffect, useState } from 'react';
import { Amplify, Auth } from 'aws-amplify';
import { Signer } from '@aws-amplify/core';
import awsconfig from '../aws-exports';
import Location from 'aws-sdk/clients/location';
import ReactMapGL, { NavigationControl, Marker } from 'react-map-gl';

Amplify.configure(awsconfig);

const mapName = "GeoSOSMap";
const placeIndexName = "GeoSOSPlaceIndex";

function MapPage() {
  const [credentials, setCredentials] = useState(null);
  const [client, setClient] = useState(null);
  const [viewport, setViewport] = useState({
    latitude: 40.743464,
    longitude: -74.029065,
    zoom: 14,
  });
  const [userLocation, setUserLocation] = useState(null);
  const [searchInput, setSearchInput] = useState('');

  // 🔐 AWS Amplify & Location client init
  useEffect(() => {
    const init = async () => {
      try {
        const creds = await Auth.currentUserCredentials();
        setCredentials(creds);

        const locClient = new Location({
          region: awsconfig.aws_project_region,
          credentials: creds,
        });
        setClient(locClient);
      } catch (err) {
        console.error("❌ AWS Auth Error:", err);
      }
    };
    init();
  }, []);

  // 📍 Geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });

          setViewport((vp) => ({
            ...vp,
            latitude,
            longitude,
            zoom: 14,
          }));
        },
        (error) => {
          console.warn("⚠️ Geolocation denied:", error.message);
          alert("Enable location to center map.");
        }
      );
    } else {
      alert("Geolocation is not supported.");
    }
  }, []);

  // 🔐 Sign AWS Location map requests
  const transformRequest = (creds) => (url, resourceType) => {
    if (resourceType === "Style" && !url.includes("://")) {
      url = `https://maps.geo.${awsconfig.aws_project_region}.amazonaws.com/maps/v0/maps/${url}/style-descriptor`;
    }
    if (url.includes("amazonaws.com")) {
      return {
        url: Signer.signUrl(url, {
          access_key: creds.accessKeyId,
          secret_key: creds.secretAccessKey,
          session_token: creds.sessionToken,
        }),
      };
    }
    return { url };
  };

  // 🔍 Search
  const searchPlace = (place) => {
    if (!client || !place) return;

    const params = {
      IndexName: placeIndexName,
      Text: place,
    };

    client.searchPlaceIndexForText(params, (err, data) => {
      if (err) return console.error(err);
      if (data?.Results?.[0]?.Place?.Geometry?.Point) {
        const [lon, lat] = data.Results[0].Place.Geometry.Point;
        setViewport((vp) => ({
          ...vp,
          longitude: lon,
          latitude: lat,
          zoom: 15,
        }));
      }
    });
  };

  return (
    <div className="page map-container">
      <h2>🗺️ Live Map</h2>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search for a place"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchPlace(searchInput)}
        />
      </div>

      {credentials ? (
        <div className="react-map-container">
          <ReactMapGL
            {...viewport}
            width="100%"
            height="100%"
            mapStyle={mapName}
            transformRequest={transformRequest(credentials)}
            onViewportChange={setViewport}
          >
            <div className="nav-control">
              <NavigationControl />
            </div>

            {/* 📍 Marker for user location */}
            {userLocation && (
              <Marker latitude={userLocation.latitude} longitude={userLocation.longitude}>
                <div style={{
                  backgroundColor: "#ff3b3b",
                  borderRadius: "50%",
                  width: "14px",
                  height: "14px",
                  border: "2px solid white",
                  boxShadow: "0 0 5px rgba(0,0,0,0.3)"
                }} />
              </Marker>
            )}
          </ReactMapGL>
        </div>
      ) : (
        <p className="loading-text">Loading map...</p>
      )}
    </div>
  );
}

export default MapPage;
