// import logo from './logo.svg';
import './App.css';
import React, { useDeferredValue, useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline, Polygon} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Sidebar from './Components/sidebar.js';
import L from 'leaflet';
import pin from './images/pin.png';
import * as turf from '@turf/turf';

const customMarkerIcon = L.icon({
  iconUrl: pin,
  iconSize: [40, 41],
  iconAnchor: [20, 41],
  popupAnchor: [0, -41]
});


function LocationMarker({ mode, setMode, onDistanceChange, onAreaChange}) {
  const [markers, setMarkers] = useState([]);

  useMapEvents({
    click(e) {
      // If in 'area' mode and the polygon is closed (last marker is same as first), insert new marker before last
      if (mode === 'area' && markers.length >= 3 && markers[markers.length - 1] === markers[0]) {
        const newMarkers = [...markers.slice(0, -1), e.latlng, markers[0]];
        setMarkers(newMarkers);
        const area = calculateTotalArea(newMarkers);
        onAreaChange(area);
      } else {
        // If not closed or in 'distance' mode, just append the new marker
        const newMarkers = [...markers, e.latlng];
        setMarkers(newMarkers);
        if (mode === 'distance') {
          const distance = calculateTotalDistance(newMarkers);
          onDistanceChange(distance);
        } else if (mode === 'area' && markers.length >= 2) {
          const area = calculateTotalArea(newMarkers);
          onAreaChange(area);
        }
      }
    }
  });

  useEffect(() => {
    if (mode === 'area' && markers.length >= 3)
    {
      const lastMarker = markers[markers.length - 1];
      const firstMarker = markers[0];
      if (lastMarker !== firstMarker)
      {
        setMarkers([...markers, firstMarker]);
      }
    }
    else if (mode === 'distance')
    {
      if (markers.length > 3 && markers[markers.length - 1] === markers[0])
      {
        setMarkers(markers.slice(0, -1));
      }
    }
  }, [mode, markers]);

  const updateMarkerPosition = (index, newLatLng) => {
    let updatedMarkers = [...markers];
    updatedMarkers[index] = newLatLng;
  
    // If the first marker is moved, update the last marker as well to keep the polygon closed
    if (mode === 'area') {
      if (index === 0 && updatedMarkers.length > 2) {
        updatedMarkers[updatedMarkers.length - 1] = newLatLng;
      }
      // If the last marker is moved, update the first marker as well
      else if (index === updatedMarkers.length - 1 && updatedMarkers.length > 2) {
        updatedMarkers[0] = newLatLng;
      }
    }
  
    setMarkers(updatedMarkers);
    // Update the distance or area after marker position change
    if (mode === 'distance') {
      updateDistance(updatedMarkers);
    } else if (mode === 'area') {
      const area = calculateTotalArea(updatedMarkers);
      onAreaChange(area);
    }
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
    if (points.length < 1) {
      return 0;
    }

    let totalDistance = 0;
    for (let i = 0; i < points.length - 1; i++) {
      totalDistance += points[i].distanceTo(points[i + 1]);
    }
    return totalDistance / 1000;
  };

  const calculateTotalArea = (markers) => {
    if (markers.length > 2) {
      // Convert Leaflet LatLng objects to an array of [lng, lat] coordinates
      const latlngs = markers.map(marker => [marker.lng, marker.lat]);
      latlngs.push(latlngs[0]); // Close the polygon by duplicating the first point
  
      // Create a Turf polygon and calculate its area in square meters
      const polygon = turf.polygon([latlngs]);
      const area = turf.area(polygon) / 10000; // Convert to hectares
  
      return area.toFixed(2); // Return area in hectares with two decimals
    }
    return 0;
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

      {markers.length > 2 && mode === 'area' && (
        <Polygon positions={markers} />
      )}

      {markers.length > 1 &&  mode === 'distance' && (
      <Polyline positions={markers} /> )}
    </>
  );
}

function App() {

  const handleMeasureDistance = () => {};
  const handleMeasureArea = () => {};
  const handleClearMap = () => {};
  const handleToggleSatellite = () => {};
  const handleToggleTerrain = () => {};

  const [mode, setMode] = useState('distance'); // Distance or Area
  const [totalDistance , setTotalDistance] = useState(0);
  const [totalArea, setTotalArea] = useState(0);

  const handleModeChange = (newMode) => {
    setMode(newMode);
  }

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
        onModeChange={handleModeChange}
        onMeasureDistance={handleMeasureDistance}
        onMeasureArea={handleMeasureArea}
        onClearMap={handleClearMap}
        onToggleSatellite={handleToggleSatellite}
        onToggleTerrain={handleToggleTerrain}
      />
      <div className='distance-display'>
      {mode === 'distance' ? `Total Distance: ${totalDistance.toFixed(2)} km` :
         `Total Area: ${totalArea} hectares`}
      </div>
      <MapContainer center={[-29.62, 24.08]} zoom={13} style={{ height: "100vh" }}>
        <TileLayer 
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker 
        mode={mode}
        setMode={setMode}
        onDistanceChange={handleDistanceChange}
        onAreaChange={setTotalArea}
        />
      </MapContainer>
    </div>
  );
}

export default App;
