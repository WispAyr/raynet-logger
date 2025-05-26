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
  Autocomplete,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

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

interface User {
  _id: string;
  callsign: string;
}

interface LogEntryFormProps {
  initialData?: {
    event?: Event;
    timestamp: Date;
    callsign: string;
    message: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
    assignedTo?: User;
  };
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const LogEntryForm: React.FC<LogEntryFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    event: initialData?.event || undefined,
    timestamp: initialData?.timestamp || new Date(),
    callsign: initialData?.callsign || '',
    message: initialData?.message || '',
    priority: initialData?.priority || 'LOW',
    status: initialData?.status || 'PENDING',
    assignedTo: initialData?.assignedTo || undefined,
  });

  const [events, setEvents] = useState<Event[]>([]);
  const [operators, setOperators] = useState<User[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsResponse, operatorsResponse] = await Promise.all([
          axios.get('http://localhost:5001/api/events'),
          axios.get('http://localhost:5001/api/users'),
        ]);
        setEvents(eventsResponse.data);
        setOperators(operatorsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Autocomplete
          options={events}
          getOptionLabel={(option) => option.name}
          value={formData.event || null}
          onChange={(_, newValue) => setFormData({ ...formData, event: newValue || undefined })}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Event"
              required
              sx={{ mb: 2 }}
            />
          )}
        />

        <DateTimePicker
          label="Timestamp"
          value={formData.timestamp}
          onChange={(date: Date | null) => setFormData({ ...formData, timestamp: date || new Date() })}
          sx={{ mb: 2, width: '100%' }}
        />

        <TextField
          fullWidth
          label="Callsign"
          value={formData.callsign}
          onChange={(e) => setFormData({ ...formData, callsign: e.target.value })}
          required
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          multiline
          rows={3}
          required
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Priority</InputLabel>
          <Select
            value={formData.priority}
            label="Priority"
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' })}
          >
            <MenuItem value="LOW">Low</MenuItem>
            <MenuItem value="MEDIUM">Medium</MenuItem>
            <MenuItem value="HIGH">High</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={formData.status}
            label="Status"
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' })}
          >
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
            <MenuItem value="RESOLVED">Resolved</MenuItem>
          </Select>
        </FormControl>

        <Autocomplete
          options={operators}
          getOptionLabel={(option) => option.callsign}
          value={formData.assignedTo || null}
          onChange={(_, newValue) => setFormData({ ...formData, assignedTo: newValue || undefined })}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Assigned To"
              sx={{ mb: 2 }}
            />
          )}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {initialData ? 'Save Changes' : 'Create Log Entry'}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default LogEntryForm; 