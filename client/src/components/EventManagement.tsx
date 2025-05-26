import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import axios from 'axios';
import EventForm from './EventForm';
import EventCard from './EventCard';
import { useAuth } from '../contexts/AuthContext';

interface Event {
  _id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  startDate: string;
  endDate?: string;
  talkgroups: Array<{ name: string; description?: string }>;
  channels: Array<{ name: string; description?: string }>;
  operators: Array<{ _id: string; callsign: string }>;
  linkedEvents?: Array<{ _id: string; name: string }>;
}

interface EventFormData {
  name: string;
  description: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  startDate: Date;
  endDate?: Date;
  talkgroups: Array<{ name: string; description?: string }>;
  channels: Array<{ name: string; description?: string }>;
}

const EventManagement: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, [statusFilter]);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchEvents = async () => {
    try {
      const url = statusFilter === 'ALL'
        ? '/api/events'
        : `/api/events?status=${statusFilter}`;
      const response = await axios.get(url, {
        headers: getAuthHeader()
      });
      setEvents(response.data);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      setError(error.response?.data?.message || 'Failed to fetch events');
    }
  };

  const handleCreateEvent = async (eventData: EventFormData) => {
    try {
      const response = await axios.post('/api/events', eventData, {
        headers: getAuthHeader()
      });
      console.log('Event created:', response.data);
      setIsCreateDialogOpen(false);
      fetchEvents();
      setError(null);
    } catch (error: any) {
      console.error('Error creating event:', error);
      setError(error.response?.data?.message || 'Failed to create event');
    }
  };

  const handleEditEvent = async (eventData: EventFormData) => {
    if (!selectedEvent) return;
    try {
      await axios.put(`/api/events/${selectedEvent._id}`, eventData, {
        headers: getAuthHeader()
      });
      setIsEditDialogOpen(false);
      fetchEvents();
      setError(null);
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
      setError(null);
    } catch (error: any) {
      console.error('Error deleting event:', error);
      setError(error.response?.data?.message || 'Failed to delete event');
    }
  };

  const handleLinkEvent = async (targetEventId: string) => {
    if (!selectedEvent) return;
    try {
      await axios.post(`/api/events/${selectedEvent._id}/link`, {
        targetEventId,
      }, {
        headers: getAuthHeader()
      });
      setIsLinkDialogOpen(false);
      fetchEvents();
      setError(null);
    } catch (error: any) {
      console.error('Error linking events:', error);
      setError(error.response?.data?.message || 'Failed to link events');
    }
  };

  const convertEventToFormData = (event: Event): EventFormData => ({
    name: event.name,
    description: event.description,
    status: event.status,
    startDate: new Date(event.startDate),
    endDate: event.endDate ? new Date(event.endDate) : undefined,
    talkgroups: event.talkgroups,
    channels: event.channels,
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Event Management</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="ARCHIVED">Archived</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setError(null);
              setIsCreateDialogOpen(true);
            }}
          >
            Create Event
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {events.map((event) => (
          <Box key={event._id} sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.33% - 16px)' } }}>
            <EventCard
              event={event}
              onEdit={() => {
                setSelectedEvent(event);
                setIsEditDialogOpen(true);
              }}
              onDelete={() => handleDeleteEvent(event._id)}
              onLink={() => {
                setSelectedEvent(event);
                setIsLinkDialogOpen(true);
              }}
            />
          </Box>
        ))}
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
            event={selectedEvent ? convertEventToFormData(selectedEvent) : undefined}
            onSubmit={handleEditEvent}
            onCancel={() => {
              setError(null);
              setIsEditDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isLinkDialogOpen}
        onClose={() => setIsLinkDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Link Events</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Select an event to link with {selectedEvent?.name}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {events
                .filter((event) => event._id !== selectedEvent?._id)
                .map((event) => (
                  <Box key={event._id}>
                    <EventCard
                      event={event}
                      onEdit={() => {}}
                      onLink={() => handleLinkEvent(event._id)}
                      onDelete={() => {}}
                    />
                  </Box>
                ))}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default EventManagement; 