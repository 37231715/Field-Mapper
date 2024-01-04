// import logo from './logo.svg';
import './App.css';
import React, { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Sidebar from './Components/sidebar.js';
import L from 'leaflet';
import pin from './images/pin.png';
import pin2 from './images/pin2.png';

const customMarkerIcon = L.icon({
  iconUrl: pin,
  iconSize: [40, 41],
  iconAnchor: [20, 41],
  popupAnchor: [0, -41]
});

function LocationMarker({ onDistanceChange }) {
  const [markers, setMarkers] = useState([]);

  useMapEvents({
    click(e) {
      setMarkers([...markers, e.latlng]);
      if (markers.length > 1) {
        const distance = calculateTotalDistance([...markers, e.latlng]);
        onDistanceChange(distance);
      }
    }
  });

  const updateMarkerPosition = (index, newLatLng) => {
    const updatedMarkers = markers.map((marker, idx) => {
      if (idx === index) {
        return newLatLng;
      }
      return marker;
    });
    setMarkers(updatedMarkers);
    updateDistance(updatedMarkers);
  };

  const removeMarker = (index) => {
    const updatedMarkers = markers.filter((_, idx) => idx !== index);
    setMarkers(updatedMarkers);
    updateDistance(updatedMarkers);
  };

  const updateDistance = (updatedMarkers) => {
    // Calculate and update distance
    const distance = calculateTotalDistance(updatedMarkers);
    onDistanceChange(distance);
  };

  const calculateTotalDistance = (points) => {
    if (points.length < 2) {
      return 0;
    }

    let totalDistance = 0;
    for (let i = 0; i < points.length - 1; i++) {
      totalDistance += points[i].distanceTo(points[i + 1]);
    }
    return totalDistance / 1000;
  };

  return (
    <>
      {markers.map((position, idx) => 
        <Marker 
          key={`marker-${idx}`}
          position={position}
          draggable={true}
          icon={customMarkerIcon}
          eventHandlers={{
            click: () => removeMarker(idx),
            dragend: (e) => {
              updateMarkerPosition(idx, e.target.getLatLng());
            },
          }}
          />
      )}
      {markers.length > 1 && <Polyline positions={markers} />}
    </>
  );
}

function App() {

  const handleMeasureDistance = () => {};
  const handleMeasureArea = () => {};
  const handleClearMap = () => {};
  const handleToggleSatellite = () => {};
  const handleToggleTerrain = () => {};

  const [totalDistance , setTotalDistance] = useState(0);

  const handleDistanceChange = (distance) => {
    setTotalDistance(distance);
  };

  // State to toggle sidebar on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  console.log(isSidebarOpen)

  return (
    <div className="App">
      <button className='toggle-sidebar' onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? 'Hide' : 'Show'} Sidebar
      </button>
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        onMeasureDistance={handleMeasureDistance}
        onMeasureArea={handleMeasureArea}
        onClearMap={handleClearMap}
        onToggleSatellite={handleToggleSatellite}
        onToggleTerrain={handleToggleTerrain}
      />
      <div className='distance-display'>
        Total Distance: {totalDistance.toFixed(2)} km
      </div>
      <MapContainer center={[-29.62, 24.08]} zoom={13} style={{ height: "100vh" }}>
        <TileLayer 
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker onDistanceChange={handleDistanceChange} />
      </MapContainer>
    </div>
  );
}

export default App;
