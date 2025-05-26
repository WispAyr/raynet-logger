import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Box, Paper, Typography, IconButton, Drawer, List, ListItem, ListItemText, ListItemIcon, Divider } from '@mui/material';
import {
  Settings as SettingsIcon,
  LocationOn as LocationIcon,
  Layers as LayersIcon,
  Terrain as TerrainIcon,
  Satellite as SatelliteIcon,
} from '@mui/icons-material';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface MapConfig {
  center: [number, number];
  zoom: number;
  baseLayer: 'street' | 'satellite' | 'terrain';
  showMarkers: boolean;
  showAreas: boolean;
  showHeatmap: boolean;
}

interface Event {
  _id: string;
  name: string;
  location?: {
    coordinates: [number, number];
    radius?: number;
  };
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
}

interface EventMapProps {
  events: Event[];
  onEventSelect?: (event: Event) => void;
  onLocationUpdate?: (eventId: string, coordinates: [number, number], radius?: number) => void;
}

const EventMap: React.FC<EventMapProps> = ({
  events,
  onEventSelect,
  onLocationUpdate,
}) => {
  const [config, setConfig] = useState<MapConfig>({
    center: [51.505, -0.09], // Default to London
    zoom: 13,
    baseLayer: 'street',
    showMarkers: true,
    showAreas: true,
    showHeatmap: false,
  });

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const handleMarkerClick = (event: Event) => {
    setSelectedEvent(event);
    onEventSelect?.(event);
  };

  const handleLocationUpdate = (eventId: string, coordinates: [number, number], radius?: number) => {
    onLocationUpdate?.(eventId, coordinates, radius);
  };

  const getTileLayer = () => {
    switch (config.baseLayer) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'terrain':
        return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      default:
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };

  return (
    <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
      <MapContainer
        center={config.center}
        zoom={config.zoom}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url={getTileLayer()}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {config.showMarkers && events.map((event) => (
          event.location && (
            <Marker
              key={event._id}
              position={event.location.coordinates}
              eventHandlers={{
                click: () => handleMarkerClick(event),
              }}
            >
              <Popup>
                <Typography variant="subtitle1">{event.name}</Typography>
                <Typography variant="body2">Status: {event.status}</Typography>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>

      <IconButton
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          bgcolor: 'background.paper',
          '&:hover': { bgcolor: 'background.paper' },
        }}
        onClick={() => setIsConfigOpen(true)}
      >
        <SettingsIcon />
      </IconButton>

      <Drawer
        anchor="right"
        open={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      >
        <Box sx={{ width: 300, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Map Configuration</Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <LayersIcon />
              </ListItemIcon>
              <ListItemText primary="Base Layer" />
            </ListItem>
            <ListItem component="div" onClick={() => setConfig({ ...config, baseLayer: 'street' })}>
              <ListItemText primary="Street Map" />
            </ListItem>
            <ListItem component="div" onClick={() => setConfig({ ...config, baseLayer: 'satellite' })}>
              <ListItemIcon>
                <SatelliteIcon />
              </ListItemIcon>
              <ListItemText primary="Satellite" />
            </ListItem>
            <ListItem component="div" onClick={() => setConfig({ ...config, baseLayer: 'terrain' })}>
              <ListItemIcon>
                <TerrainIcon />
              </ListItemIcon>
              <ListItemText primary="Terrain" />
            </ListItem>

            <Divider sx={{ my: 2 }} />

            <ListItem>
              <ListItemIcon>
                <LocationIcon />
              </ListItemIcon>
              <ListItemText primary="Display Options" />
            </ListItem>
            <ListItem component="div" onClick={() => setConfig({ ...config, showMarkers: !config.showMarkers })}>
              <ListItemText primary="Show Markers" />
            </ListItem>
            <ListItem component="div" onClick={() => setConfig({ ...config, showAreas: !config.showAreas })}>
              <ListItemText primary="Show Areas" />
            </ListItem>
            <ListItem component="div" onClick={() => setConfig({ ...config, showHeatmap: !config.showHeatmap })}>
              <ListItemText primary="Show Heatmap" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

export default EventMap; 