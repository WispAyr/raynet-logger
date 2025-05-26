import React, { useState, useEffect } from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Button,
  Typography,
  Chip,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import EventLocationForm from './EventLocationForm';
import { useAuth } from '../contexts/AuthContext';

interface User {
  _id: string;
  callsign: string;
}

interface Event {
  _id?: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  startDate?: Date;
  endDate?: Date;
  talkgroups?: Array<{ name: string; description?: string; active?: boolean }>;
  channels?: Array<{ name: string; description?: string; active?: boolean }>;
  location?: {
    coordinates: [number, number];
    radius?: number;
  };
}

interface EventFormProps {
  event?: Event;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const EventForm: React.FC<EventFormProps> = ({
  event,
  onSubmit,
  onCancel,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: event?.name || '',
    description: event?.description || '',
    status: event?.status || 'ACTIVE',
    startDate: event?.startDate || new Date(),
    endDate: event?.endDate || null,
    talkgroups: event?.talkgroups || [],
    channels: event?.channels || [],
    location: event?.location || undefined,
  });

  const [error, setError] = useState<string | null>(null);
  const [operators, setOperators] = useState<User[]>([]);
  const [selectedOperators, setSelectedOperators] = useState<User[]>([]);
  const [newTalkgroup, setNewTalkgroup] = useState({ name: '', description: '' });
  const [newChannel, setNewChannel] = useState({ name: '', description: '' });
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOperators(response.data);
      } catch (error) {
        console.error('Error fetching operators:', error);
      }
    };
    fetchOperators();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!formData.name.trim()) {
      setError('Event name is required');
      return;
    }

    if (!formData.startDate) {
      setError('Start date is required');
      return;
    }

    if (!user?._id) {
      setError('User not authenticated');
      return;
    }

    // Prepare the data for submission
    const eventData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      status: formData.status,
      startDate: formData.startDate.toISOString(),
      endDate: formData.endDate ? formData.endDate.toISOString() : undefined,
      talkgroups: formData.talkgroups.map(tg => ({
        name: tg.name.trim(),
        description: tg.description?.trim() || undefined,
        active: true
      })),
      channels: formData.channels.map(ch => ({
        name: ch.name.trim(),
        description: ch.description?.trim() || undefined,
        active: true
      })),
      location: formData.location,
      createdBy: user._id
    };

    console.log('Submitting event data:', eventData);
    onSubmit(eventData);
  };

  const handleAddTalkgroup = () => {
    if (newTalkgroup.name.trim()) {
      setFormData({
        ...formData,
        talkgroups: [...formData.talkgroups, { 
          name: newTalkgroup.name.trim(),
          description: newTalkgroup.description.trim() || undefined,
          active: true
        }],
      });
      setNewTalkgroup({ name: '', description: '' });
    }
  };

  const handleRemoveTalkgroup = (index: number) => {
    const updatedTalkgroups = formData.talkgroups.filter((_, i) => i !== index);
    setFormData({ ...formData, talkgroups: updatedTalkgroups });
  };

  const handleAddChannel = () => {
    if (newChannel.name.trim()) {
      setFormData({
        ...formData,
        channels: [...formData.channels, { 
          name: newChannel.name.trim(),
          description: newChannel.description.trim() || undefined,
          active: true
        }],
      });
      setNewChannel({ name: '', description: '' });
    }
  };

  const handleRemoveChannel = (index: number) => {
    const updatedChannels = formData.channels.filter((_, i) => i !== index);
    setFormData({ ...formData, channels: updatedChannels });
  };

  const handleLocationSubmit = (location: { coordinates: [number, number]; radius?: number }) => {
    setFormData({ ...formData, location });
    setIsLocationDialogOpen(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Event Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          multiline
          rows={3}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={formData.status}
            label="Status"
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
          >
            <MenuItem value="ACTIVE">Active</MenuItem>
            <MenuItem value="COMPLETED">Completed</MenuItem>
            <MenuItem value="ARCHIVED">Archived</MenuItem>
          </Select>
        </FormControl>

        <DateTimePicker
          label="Start Date"
          value={formData.startDate}
          onChange={(date) => setFormData({ ...formData, startDate: date || new Date() })}
          sx={{ mb: 2, width: '100%' }}
        />

        <DateTimePicker
          label="End Date"
          value={formData.endDate}
          onChange={(date) => setFormData({ ...formData, endDate: date || null })}
          sx={{ mb: 2, width: '100%' }}
        />

        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Talkgroups
          </Typography>
          {formData.talkgroups.map((tg, index) => (
            <Chip
              key={index}
              label={tg.name}
              onDelete={() => handleRemoveTalkgroup(index)}
              sx={{ mr: 1, mb: 1 }}
            />
          ))}
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <TextField
              label="New Talkgroup"
              value={newTalkgroup.name}
              onChange={(e) => setNewTalkgroup({ ...newTalkgroup, name: e.target.value })}
              size="small"
            />
            <TextField
              label="Description"
              value={newTalkgroup.description}
              onChange={(e) => setNewTalkgroup({ ...newTalkgroup, description: e.target.value })}
              size="small"
            />
            <Button onClick={handleAddTalkgroup} variant="outlined" size="small">
              Add
            </Button>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Channels
          </Typography>
          {formData.channels.map((ch, index) => (
            <Chip
              key={index}
              label={ch.name}
              onDelete={() => handleRemoveChannel(index)}
              sx={{ mr: 1, mb: 1 }}
            />
          ))}
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <TextField
              label="New Channel"
              value={newChannel.name}
              onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
              size="small"
            />
            <TextField
              label="Description"
              value={newChannel.description}
              onChange={(e) => setNewChannel({ ...newChannel, description: e.target.value })}
              size="small"
            />
            <Button onClick={handleAddChannel} variant="outlined" size="small">
              Add
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
          <Button onClick={onCancel} variant="outlined">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            {event ? 'Update Event' : 'Create Event'}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default EventForm; 