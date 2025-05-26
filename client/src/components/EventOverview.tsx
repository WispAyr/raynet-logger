import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Paper, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Dialog, DialogTitle, DialogContent, Alert } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import EventMap from './EventMap';
import EventForm from './EventForm';
import { useAuth } from '../contexts/AuthContext';

interface Event {
  _id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  startDate: Date;
  endDate?: Date;
  location?: {
    coordinates: [number, number];
    radius?: number;
  };
}

const EventOverview: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchEvents = useCallback(async () => {
    try {
      const response = await axios.get('/api/events', {
        headers: getAuthHeader()
      });
      // Convert string dates to Date objects
      const eventsWithDates = response.data.map((event: any) => ({
        ...event,
        startDate: new Date(event.startDate),
        endDate: event.endDate ? new Date(event.endDate) : undefined
      }));
      setEvents(eventsWithDates);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to fetch events');
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleCreateEvent = async (eventData: any) => {
    try {
      console.log('Creating event with data:', eventData);
      const response = await axios.post('/api/events', eventData, {
        headers: getAuthHeader()
      });
      console.log('Event created:', response.data);
      setIsCreateDialogOpen(false);
      fetchEvents();
    } catch (error: any) {
      console.error('Error creating event:', error);
      setError(error.response?.data?.message || 'Failed to create event');
    }
  };

  const handleEditEvent = async (eventData: any) => {
    if (!selectedEvent) return;
    try {
      await axios.put(`/api/events/${selectedEvent._id}`, eventData, {
        headers: getAuthHeader()
      });
      setIsEditDialogOpen(false);
      fetchEvents();
    } catch (error: any) {
      console.error('Error updating event:', error);
      setError(error.response?.data?.message || 'Failed to update event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await axios.delete(`/api/events/${eventId}`, {
        headers: getAuthHeader()
      });
      fetchEvents();
    } catch (error: any) {
      console.error('Error deleting event:', error);
      setError(error.response?.data?.message || 'Failed to delete event');
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <Box sx={{ width: '30%', p: 2, borderRight: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Events</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setError(null);
              setIsCreateDialogOpen(true);
            }}
          >
            New Event
          </Button>
        </Box>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <List>
          {events.map((event) => (
            <ListItem
              key={event._id}
              sx={{
                cursor: 'pointer',
                bgcolor: selectedEvent?._id === event._id ? 'action.selected' : 'inherit'
              }}
              onClick={() => setSelectedEvent(event)}
            >
              <ListItemText
                primary={event.name}
                secondary={`${event.startDate.toLocaleString()} - ${event.status}`}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEvent(event);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteEvent(event._id);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ flex: 1, p: 2 }}>
        <EventMap events={events} />
      </Box>

      <Dialog
        open={isCreateDialogOpen}
        onClose={() => {
          setError(null);
          setIsCreateDialogOpen(false);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Event</DialogTitle>
        <DialogContent>
          <EventForm
            onSubmit={handleCreateEvent}
            onCancel={() => {
              setError(null);
              setIsCreateDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditDialogOpen}
        onClose={() => {
          setError(null);
          setIsEditDialogOpen(false);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Event</DialogTitle>
        <DialogContent>
          <EventForm
            event={selectedEvent || undefined}
            onSubmit={handleEditEvent}
            onCancel={() => {
              setError(null);
              setIsEditDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default EventOverview; 