import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
  useTheme,
  Grid,
} from '@mui/material';
import {
  Map as MapIcon,
  People as PeopleIcon,
  Radio as RadioIcon,
  MedicalServices as MedicalIcon,
  Security as SecurityIcon,
  Timer as TimerIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import { DateTime } from 'luxon';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import LogEntryForm from './LogEntryForm';

interface Zone {
  _id: string;
  name: string;
  type: 'MEDICAL' | 'SECURITY' | 'COMMS' | 'GENERAL';
  coordinates: [number, number][];
  color: string;
  description?: string;
}

interface Operator {
  _id: string;
  callsign: string;
  status: 'ACTIVE' | 'BREAK' | 'OFFLINE';
  currentZone?: string;
  lastCheckIn?: string;
}

interface Channel {
  name: string;
  frequency: string;
  mode: 'FM' | 'DMR' | 'D-STAR';
  purpose: string;
  assignedTo?: string;
}

interface Event {
  _id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  startDate: string;
  endDate?: string;
  location: {
    coordinates: [number, number];
    radius?: number;
  };
  zones: Zone[];
  operators: Operator[];
  channels: Channel[];
  talkgroups: Array<{ name: string; description?: string }>;
  checkInInterval?: number; // in minutes
  welfareCheckInterval?: number; // in minutes
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`operator-tabpanel-${index}`}
      aria-labelledby={`operator-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const OperatorView: React.FC<{ eventId: string }> = ({ eventId }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkInTimer, setCheckInTimer] = useState<NodeJS.Timeout | null>(null);
  const [welfareTimer, setWelfareTimer] = useState<NodeJS.Timeout | null>(null);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchEvent = useCallback(async () => {
    try {
      const response = await axios.get(`/api/events/${eventId}`, {
        headers: getAuthHeader()
      });
      setEvent(response.data);
    } catch (error: any) {
      console.error('Error fetching event:', error);
      setError(error.response?.data?.message || 'Failed to fetch event');
    }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  // Set up check-in and welfare check timers
  useEffect(() => {
    if (!event) return;

    if (event.checkInInterval) {
      const timer = setInterval(() => {
        // Prompt for check-in
        if (window.confirm('Time for your regular check-in. Would you like to check in now?')) {
          handleCheckIn();
        }
      }, event.checkInInterval * 60 * 1000);
      setCheckInTimer(timer);
    }

    if (event.welfareCheckInterval) {
      const timer = setInterval(() => {
        // Prompt for welfare check
        if (window.confirm('Time for welfare check. Would you like to perform a welfare check now?')) {
          handleWelfareCheck();
        }
      }, event.welfareCheckInterval * 60 * 1000);
      setWelfareTimer(timer);
    }

    return () => {
      if (checkInTimer) clearInterval(checkInTimer);
      if (welfareTimer) clearInterval(welfareTimer);
    };
  }, [event]);

  const handleCheckIn = async () => {
    try {
      await axios.post(`/api/events/${eventId}/check-in`, {}, {
        headers: getAuthHeader()
      });
      fetchEvent();
    } catch (error: any) {
      console.error('Error checking in:', error);
      setError(error.response?.data?.message || 'Failed to check in');
    }
  };

  const handleWelfareCheck = async () => {
    try {
      await axios.post(`/api/events/${eventId}/welfare-check`, {}, {
        headers: getAuthHeader()
      });
      fetchEvent();
    } catch (error: any) {
      console.error('Error performing welfare check:', error);
      setError(error.response?.data?.message || 'Failed to perform welfare check');
    }
  };

  const handleCreateLogEntry = async (logData: any) => {
    try {
      await axios.post('/api/logs', {
        ...logData,
        event: eventId
      }, {
        headers: getAuthHeader()
      });
      setIsLogDialogOpen(false);
      fetchEvent();
    } catch (error: any) {
      console.error('Error creating log entry:', error);
      setError(error.response?.data?.message || 'Failed to create log entry');
    }
  };

  if (!event) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading event details...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <Typography variant="h4">{event.name}</Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {DateTime.fromISO(event.startDate).toLocaleString(DateTime.DATETIME_FULL)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsLogDialogOpen(true)}
              >
                New Log Entry
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<MapIcon />} label="Map" />
          <Tab icon={<PeopleIcon />} label="Operators" />
          <Tab icon={<RadioIcon />} label="Comms" />
          <Tab icon={<MedicalIcon />} label="Medical" />
          <Tab icon={<SecurityIcon />} label="Security" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        <TabPanel value={selectedTab} index={0}>
          <Box sx={{ height: 'calc(100vh - 200px)' }}>
            <MapContainer
              center={event.location.coordinates}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {event.zones.map((zone) => (
                <Polygon
                  key={zone._id}
                  positions={zone.coordinates}
                  pathOptions={{
                    color: zone.color,
                    fillColor: zone.color,
                    fillOpacity: 0.2
                  }}
                  eventHandlers={{
                    click: () => setSelectedZone(zone._id)
                  }}
                >
                  <Popup>
                    <Typography variant="subtitle1">{zone.name}</Typography>
                    <Typography variant="body2">{zone.description}</Typography>
                  </Popup>
                </Polygon>
              ))}
              {event.operators.map((operator) => (
                <Marker
                  key={operator._id}
                  position={[0, 0]} // TODO: Add operator position tracking
                >
                  <Popup>
                    <Typography variant="subtitle1">{operator.callsign}</Typography>
                    <Typography variant="body2">
                      Status: {operator.status}
                    </Typography>
                    {operator.lastCheckIn && (
                      <Typography variant="body2">
                        Last Check-in: {DateTime.fromISO(operator.lastCheckIn).toRelative()}
                      </Typography>
                    )}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </Box>
        </TabPanel>

        <TabPanel value={selectedTab} index={1}>
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
              {event.operators.map((operator) => (
                <Grid item xs={12} sm={6} md={4} key={operator._id}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6">{operator.callsign}</Typography>
                    <Chip
                      label={operator.status}
                      color={operator.status === 'ACTIVE' ? 'success' : 'default'}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    {operator.currentZone && (
                      <Chip
                        label={event.zones.find(z => z._id === operator.currentZone)?.name}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                    )}
                    {operator.lastCheckIn && (
                      <Typography variant="body2" color="text.secondary">
                        Last Check-in: {DateTime.fromISO(operator.lastCheckIn).toRelative()}
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </TabPanel>

        <TabPanel value={selectedTab} index={2}>
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
              {event.channels.map((channel) => (
                <Grid item xs={12} sm={6} md={4} key={channel.name}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6">{channel.name}</Typography>
                    <Typography variant="body2">
                      {channel.frequency} ({channel.mode})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {channel.purpose}
                    </Typography>
                    {channel.assignedTo && (
                      <Chip
                        label={`Assigned to: ${event.operators.find(o => o._id === channel.assignedTo)?.callsign}`}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </TabPanel>

        <TabPanel value={selectedTab} index={3}>
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
              {event.zones
                .filter(zone => zone.type === 'MEDICAL')
                .map((zone) => (
                  <Grid item xs={12} sm={6} md={4} key={zone._id}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6">{zone.name}</Typography>
                      <Typography variant="body2">{zone.description}</Typography>
                      <Box sx={{ mt: 1 }}>
                        {event.operators
                          .filter(op => op.currentZone === zone._id)
                          .map(operator => (
                            <Chip
                              key={operator._id}
                              label={operator.callsign}
                              size="small"
                              sx={{ mr: 1, mb: 1 }}
                            />
                          ))}
                      </Box>
                    </Paper>
                  </Grid>
                ))}
            </Grid>
          </Box>
        </TabPanel>

        <TabPanel value={selectedTab} index={4}>
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
              {event.zones
                .filter(zone => zone.type === 'SECURITY')
                .map((zone) => (
                  <Grid item xs={12} sm={6} md={4} key={zone._id}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6">{zone.name}</Typography>
                      <Typography variant="body2">{zone.description}</Typography>
                      <Box sx={{ mt: 1 }}>
                        {event.operators
                          .filter(op => op.currentZone === zone._id)
                          .map(operator => (
                            <Chip
                              key={operator._id}
                              label={operator.callsign}
                              size="small"
                              sx={{ mr: 1, mb: 1 }}
                            />
                          ))}
                      </Box>
                    </Paper>
                  </Grid>
                ))}
            </Grid>
          </Box>
        </TabPanel>
      </Box>

      {/* Log Entry Dialog */}
      <Dialog
        open={isLogDialogOpen}
        onClose={() => setIsLogDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Log Entry</DialogTitle>
        <DialogContent>
          <LogEntryForm
            initialData={{
              event: event,
              timestamp: new Date(),
              callsign: user?.callsign || '',
              message: '',
              talkgroup: '',
              channel: '',
              messageType: 'INFO'
            }}
            onSubmit={handleCreateLogEntry}
            onCancel={() => setIsLogDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default OperatorView; 