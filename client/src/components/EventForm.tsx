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
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

interface EventFormProps {
  initialData?: {
    name: string;
    description: string;
    status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
    startDate: Date;
    endDate?: Date;
    talkgroups: Array<{ name: string; description?: string }>;
    channels: Array<{ name: string; description?: string }>;
  };
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

interface User {
  _id: string;
  callsign: string;
}

const EventForm: React.FC<EventFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    status: initialData?.status || 'ACTIVE',
    startDate: initialData?.startDate || new Date(),
    endDate: initialData?.endDate || null,
    talkgroups: initialData?.talkgroups || [],
    channels: initialData?.channels || [],
  });

  const [operators, setOperators] = useState<User[]>([]);
  const [selectedOperators, setSelectedOperators] = useState<User[]>([]);
  const [newTalkgroup, setNewTalkgroup] = useState({ name: '', description: '' });
  const [newChannel, setNewChannel] = useState({ name: '', description: '' });

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/users');
        setOperators(response.data);
      } catch (error) {
        console.error('Error fetching operators:', error);
      }
    };
    fetchOperators();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleAddTalkgroup = () => {
    if (newTalkgroup.name) {
      setFormData({
        ...formData,
        talkgroups: [...formData.talkgroups, { ...newTalkgroup }],
      });
      setNewTalkgroup({ name: '', description: '' });
    }
  };

  const handleRemoveTalkgroup = (index: number) => {
    const updatedTalkgroups = formData.talkgroups.filter((_, i) => i !== index);
    setFormData({ ...formData, talkgroups: updatedTalkgroups });
  };

  const handleAddChannel = () => {
    if (newChannel.name) {
      setFormData({
        ...formData,
        channels: [...formData.channels, { ...newChannel }],
      });
      setNewChannel({ name: '', description: '' });
    }
  };

  const handleRemoveChannel = (index: number) => {
    const updatedChannels = formData.channels.filter((_, i) => i !== index);
    setFormData({ ...formData, channels: updatedChannels });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
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

        <Typography variant="h6" sx={{ mb: 1 }}>
          Talkgroups
        </Typography>
        <Box sx={{ mb: 2 }}>
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

        <Typography variant="h6" sx={{ mb: 1 }}>
          Channels
        </Typography>
        <Box sx={{ mb: 2 }}>
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

        <Typography variant="h6" sx={{ mb: 1 }}>
          Operators
        </Typography>
        <Autocomplete
          multiple
          options={operators}
          getOptionLabel={(option) => option.callsign}
          value={selectedOperators}
          onChange={(_, newValue) => setSelectedOperators(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Operators"
              placeholder="Add operators"
            />
          )}
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {initialData ? 'Save Changes' : 'Create Event'}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default EventForm; 