import React from 'react';
import './sidebar.css';

function Sidebar({ isSidebarOpen, onMeasureDistance, onMeasureArea, onClearMap, onToggleSatellite, onToggleTerrain }) {
   return (
    <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button onClick={onMeasureDistance}>Measure Distance</button>
        <button onClick={onMeasureArea}>Measure Area</button>
        <button onClick={onClearMap}>Clear Map</button>
        <button onClick={onToggleSatellite}>Satellite View</button>
        <button onClick={onToggleTerrain}>Terrain View</button>
    </div>
   );
}

export default Sidebar;