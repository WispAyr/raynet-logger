import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Box } from '@mui/material';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface Event {
  _id: string;
  name: string;
  description?: string;
  location?: {
    coordinates: [number, number];
    radius?: number;
  };
}

interface EventMapProps {
  events: Event[];
  onEventSelect?: (event: Event) => void;
}

const EventMap: React.FC<EventMapProps> = ({ events, onEventSelect }) => {
  const defaultCenter: [number, number] = [51.505, -0.09]; // London coordinates
  const defaultZoom = 13;

  return (
    <Box sx={{ height: 400, width: '100%', position: 'relative' }}>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {events.map((event) => {
          if (event.location?.coordinates) {
            return (
              <Marker
                key={event._id}
                position={event.location.coordinates}
                eventHandlers={{
                  click: () => onEventSelect?.(event),
                }}
              >
                <Popup>
                  <div>
                    <h3>{event.name}</h3>
                    {event.description && <p>{event.description}</p>}
                  </div>
                </Popup>
              </Marker>
            );
          }
          return null;
        })}
      </MapContainer>
    </Box>
  );
};

export default EventMap; 