import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
} from '@mui/material';
import { Grid } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DateTime } from 'luxon';
import axios from 'axios';

interface EventFormProps {
  onSubmit?: (eventData: any) => void;
  onCancel?: () => void;
  initialData?: any;
}

const EventForm: React.FC<EventFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: DateTime.now(),
    endDate: DateTime.now().plus({ days: 1 }),
    location: {
      name: '',
      coordinates: [0, 0],
    },
    checkInInterval: 30,
    welfareCheckInterval: 120,
  });

  useEffect(() => {
    if (eventId) {
      axios.get(`/api/events/${eventId}`)
        .then(response => {
          const event = response.data;
          setFormData({
            ...event,
            startDate: DateTime.fromISO(event.startDate),
            endDate: DateTime.fromISO(event.endDate),
          });
        })
        .catch(error => {
          console.error('Error fetching event:', error);
          navigate('/');
        });
    }
  }, [eventId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const eventData = {
        ...formData,
        startDate: formData.startDate.toISO(),
        endDate: formData.endDate.toISO(),
      };

      if (onSubmit) {
        onSubmit(eventData);
      } else {
        if (eventId) {
          await axios.put(`/api/events/${eventId}`, eventData);
        } else {
          await axios.post('/api/events', eventData);
        }
        navigate('/');
      }
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {eventId ? 'Edit Event' : 'Create New Event'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Event Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterLuxon}>
                <DateTimePicker
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(newValue) => newValue && setFormData({ ...formData, startDate: newValue })}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterLuxon}>
                <DateTimePicker
                  label="End Date"
                  value={formData.endDate}
                  onChange={(newValue) => newValue && setFormData({ ...formData, endDate: newValue })}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location Name"
                value={formData.location.name}
                onChange={(e) => setFormData({
                  ...formData,
                  location: { ...formData.location, name: e.target.value }
                })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Check-in Interval (minutes)"
                type="number"
                value={formData.checkInInterval}
                onChange={(e) => setFormData({
                  ...formData,
                  checkInInterval: parseInt(e.target.value)
                })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Welfare Check Interval (minutes)"
                type="number"
                value={formData.welfareCheckInterval}
                onChange={(e) => setFormData({
                  ...formData,
                  welfareCheckInterval: parseInt(e.target.value)
                })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button variant="contained" type="submit">
                  {eventId ? 'Update' : 'Create'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default EventForm; 