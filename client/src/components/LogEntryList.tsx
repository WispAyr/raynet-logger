import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import axios from 'axios';
import LogEntryForm from './LogEntryForm';

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

interface LogEntry {
  _id: string;
  event?: Event;
  timestamp: string;
  callsign: string;
  message: string;
  talkgroup: string;
  channel: string;
  messageType: 'INFO' | 'URGENT' | 'CHECK-IN' | 'OTHER';
  operator?: User;
}

const LogEntryList: React.FC = () => {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<LogEntry | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [error, setError] = useState<string | null>(null);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchLogEntries = useCallback(async () => {
    try {
      const response = await axios.get('/api/logs', {
        headers: getAuthHeader()
      });
      setLogEntries(response.data);
    } catch (error) {
      console.error('Error fetching log entries:', error);
      setError('Failed to fetch log entries');
    }
  }, []);

  useEffect(() => {
    fetchLogEntries();
  }, [fetchLogEntries]);

  const handleCreateLogEntry = async (logData: any) => {
    try {
      const response = await axios.post('/api/logs', logData, {
        headers: getAuthHeader()
      });
      console.log('Log entry created:', response.data);
      setIsCreateDialogOpen(false);
      fetchLogEntries();
    } catch (error: any) {
      console.error('Error creating log entry:', error);
      setError(error.response?.data?.message || 'Failed to create log entry');
    }
  };

  const handleEditLogEntry = async (logData: any) => {
    if (!selectedEntry) return;
    try {
      const response = await axios.put(`/api/logs/${selectedEntry._id}`, logData, {
        headers: getAuthHeader()
      });
      console.log('Log entry updated:', response.data);
      setIsEditDialogOpen(false);
      fetchLogEntries();
    } catch (error: any) {
      console.error('Error updating log entry:', error);
      setError(error.response?.data?.message || 'Failed to update log entry');
    }
  };

  const handleDeleteLogEntry = async (logId: string) => {
    if (!window.confirm('Are you sure you want to delete this log entry?')) return;
    try {
      await axios.delete(`/api/logs/${logId}`, {
        headers: getAuthHeader()
      });
      fetchLogEntries();
    } catch (error: any) {
      console.error('Error deleting log entry:', error);
      setError(error.response?.data?.message || 'Failed to delete log entry');
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'URGENT':
        return 'error';
      case 'CHECK-IN':
        return 'success';
      case 'INFO':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Log Entries</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Message Type</InputLabel>
            <Select
              value={statusFilter}
              label="Message Type"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="INFO">Info</MenuItem>
              <MenuItem value="URGENT">Urgent</MenuItem>
              <MenuItem value="CHECK-IN">Check-in</MenuItem>
              <MenuItem value="OTHER">Other</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setIsCreateDialogOpen(true)}
          >
            New Log Entry
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {logEntries.map((entry) => (
          <Paper key={entry._id} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1">{entry.callsign}</Typography>
                <Chip
                  label={entry.messageType}
                  color={getMessageTypeColor(entry.messageType)}
                  size="small"
                />
                {entry.talkgroup && (
                  <Chip
                    label={`TG: ${entry.talkgroup}`}
                    size="small"
                    variant="outlined"
                  />
                )}
                {entry.channel && (
                  <Chip
                    label={`CH: ${entry.channel}`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
              <Box>
                <IconButton
                  onClick={() => {
                    setSelectedEntry(entry);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDeleteLogEntry(entry._id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {new Date(entry.timestamp).toLocaleString()}
            </Typography>
            {entry.event && (
              <Chip
                label={entry.event.name}
                size="small"
                sx={{ mr: 1, mb: 1 }}
              />
            )}
            <Typography variant="body1">{entry.message}</Typography>
            {entry.operator && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Operator: {entry.operator.callsign}
              </Typography>
            )}
          </Paper>
        ))}
      </Box>

      <Dialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Log Entry</DialogTitle>
        <DialogContent>
          <LogEntryForm
            onSubmit={handleCreateLogEntry}
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
        <DialogTitle>Edit Log Entry</DialogTitle>
        <DialogContent>
          {selectedEntry && (
            <LogEntryForm
              initialData={{
                event: selectedEntry.event,
                timestamp: new Date(selectedEntry.timestamp),
                callsign: selectedEntry.callsign,
                message: selectedEntry.message,
                talkgroup: selectedEntry.talkgroup,
                channel: selectedEntry.channel,
                messageType: selectedEntry.messageType,
              }}
              onSubmit={handleEditLogEntry}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default LogEntryList; 