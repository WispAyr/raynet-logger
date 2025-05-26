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
} from '@mui/material';
import axios from 'axios';
import EventForm from './EventForm';
import EventCard from './EventCard';

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

  useEffect(() => {
    fetchEvents();
  }, [statusFilter]);

  const fetchEvents = async () => {
    try {
      const url = statusFilter === 'ALL'
        ? 'http://localhost:5001/api/events'
        : `http://localhost:5001/api/events?status=${statusFilter}`;
      const response = await axios.get(url);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleCreateEvent = async (eventData: EventFormData) => {
    try {
      await axios.post('http://localhost:5001/api/events', eventData);
      setIsCreateDialogOpen(false);
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleEditEvent = async (eventData: EventFormData) => {
    if (!selectedEvent) return;
    try {
      await axios.put(`http://localhost:5001/api/events/${selectedEvent._id}`, eventData);
      setIsEditDialogOpen(false);
      fetchEvents();
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await axios.delete(`http://localhost:5001/api/events/${eventId}`);
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleLinkEvent = async (targetEventId: string) => {
    if (!selectedEvent) return;
    try {
      await axios.post(`http://localhost:5001/api/events/${selectedEvent._id}/link`, {
        targetEventId,
      });
      setIsLinkDialogOpen(false);
      fetchEvents();
    } catch (error) {
      console.error('Error linking events:', error);
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
            onClick={() => setIsCreateDialogOpen(true)}
          >
            Create Event
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {events.map((event) => (
          <Box key={event._id} sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.33% - 16px)' } }}>
            <EventCard
              event={event}
              onEdit={(event) => {
                setSelectedEvent(event);
                setIsEditDialogOpen(true);
              }}
              onLink={(event) => {
                setSelectedEvent(event);
                setIsLinkDialogOpen(true);
              }}
              onDelete={handleDeleteEvent}
            />
          </Box>
        ))}
      </Box>

      <Dialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Event</DialogTitle>
        <DialogContent>
          <EventForm
            onSubmit={handleCreateEvent}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Event</DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <EventForm
              initialData={convertEventToFormData(selectedEvent)}
              onSubmit={handleEditEvent}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
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