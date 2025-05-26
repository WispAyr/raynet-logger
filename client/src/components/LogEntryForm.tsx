import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import axios from 'axios';

interface Event {
  _id: string;
  name: string;
  talkgroups: Array<{ name: string }>;
  channels: Array<{ name: string }>;
}

interface LogEntryFormProps {
  onSubmit?: (logEntryData: any) => void;
  onCancel?: () => void;
  initialData?: any;
}

const LogEntryForm: React.FC<LogEntryFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const [formData, setFormData] = useState({
    event: eventId || '',
    talkgroup: '',
    channel: '',
    messageType: '',
    message: '',
    priority: 'NORMAL',
  });

  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (eventId) {
      axios.get(`/api/events/${eventId}`)
        .then(response => {
          const event = response.data;
          setFormData(prev => ({
            ...prev,
            event: event._id,
            talkgroup: event.talkgroups?.[0]?.name || '',
            channel: event.channels?.[0]?.name || '',
          }));
        })
        .catch(error => {
          console.error('Error fetching event:', error);
          setError('Failed to load event data');
        });
    } else {
      axios.get('/api/events')
        .then(response => {
          setEvents(response.data);
        })
        .catch(error => {
          console.error('Error fetching events:', error);
          setError('Failed to load events');
        });
    }
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (onSubmit) {
        onSubmit(formData);
      } else {
        await axios.post('/api/logs', formData);
        navigate(`/events/${formData.event}/logs`);
      }
    } catch (error) {
      console.error('Error saving log entry:', error);
      setError('Failed to save log entry');
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(`/events/${formData.event}/logs`);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Create New Log Entry
        </Typography>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {!eventId && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Event</InputLabel>
                  <Select
                    value={formData.event}
                    label="Event"
                    onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                    required
                  >
                    {events.map((event) => (
                      <MenuItem key={event._id} value={event._id}>
                        {event.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Talkgroup"
                value={formData.talkgroup}
                onChange={(e) => setFormData({ ...formData, talkgroup: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Channel"
                value={formData.channel}
                onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Message Type</InputLabel>
                <Select
                  value={formData.messageType}
                  label="Message Type"
                  onChange={(e) => setFormData({ ...formData, messageType: e.target.value })}
                  required
                >
                  <MenuItem value="STATUS">Status Update</MenuItem>
                  <MenuItem value="WELFARE">Welfare Check</MenuItem>
                  <MenuItem value="INCIDENT">Incident Report</MenuItem>
                  <MenuItem value="COMMUNICATION">Communication</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                multiline
                rows={4}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  label="Priority"
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  required
                >
                  <MenuItem value="LOW">Low</MenuItem>
                  <MenuItem value="NORMAL">Normal</MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                  <MenuItem value="URGENT">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button variant="contained" type="submit">
                  Create
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default LogEntryForm; 