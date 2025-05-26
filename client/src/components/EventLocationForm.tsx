import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Slider,
  Paper,
} from '@mui/material';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

interface EventLocationFormProps {
  initialLocation?: {
    coordinates: [number, number];
    radius?: number;
  };
  onSubmit: (location: { coordinates: [number, number]; radius?: number }) => void;
  onCancel: () => void;
}

const EventLocationForm: React.FC<EventLocationFormProps> = ({
  initialLocation,
  onSubmit,
  onCancel,
}) => {
  const [location, setLocation] = useState<[number, number]>(
    initialLocation?.coordinates || [51.505, -0.09]
  );
  const [radius, setRadius] = useState<number>(initialLocation?.radius || 1000);

  const MapEvents = () => {
    useMapEvents({
      click: (e) => {
        setLocation([e.latlng.lat, e.latlng.lng]);
      },
    });
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ coordinates: location, radius });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Event Location
        </Typography>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Latitude"
            type="number"
            value={location[0]}
            onChange={(e) => setLocation([parseFloat(e.target.value), location[1]])}
            inputProps={{ step: 0.000001 }}
            sx={{ mb: 1 }}
          />
          <TextField
            fullWidth
            label="Longitude"
            type="number"
            value={location[1]}
            onChange={(e) => setLocation([location[0], parseFloat(e.target.value)])}
            inputProps={{ step: 0.000001 }}
          />
        </Box>
        <Typography gutterBottom>Area Radius (meters)</Typography>
        <Slider
          value={radius}
          onChange={(_, value) => setRadius(value as number)}
          min={100}
          max={10000}
          step={100}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `${value}m`}
        />
      </Paper>

      <Box sx={{ flex: 1, position: 'relative', minHeight: 400 }}>
        <MapContainer
          center={location}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapEvents />
          <Marker position={location} />
          <Circle
            center={location}
            radius={radius}
            pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}
          />
        </MapContainer>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="contained" color="primary">
          Save Location
        </Button>
      </Box>
    </Box>
  );
};

export default EventLocationForm; 