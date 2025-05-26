import React, { useState, useEffect } from 'react';
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
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  assignedTo?: User;
}

const LogEntryList: React.FC = () => {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<LogEntry | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchLogEntries();
  }, [statusFilter, priorityFilter]);

  const fetchLogEntries = async () => {
    try {
      const url = new URL('http://localhost:5001/api/logs');
      if (statusFilter !== 'ALL') {
        url.searchParams.append('status', statusFilter);
      }
      if (priorityFilter !== 'ALL') {
        url.searchParams.append('priority', priorityFilter);
      }
      const response = await axios.get(url.toString());
      setLogEntries(response.data);
    } catch (error) {
      console.error('Error fetching log entries:', error);
    }
  };

  const handleCreateLogEntry = async (logData: any) => {
    try {
      await axios.post('http://localhost:5001/api/logs', logData);
      setIsCreateDialogOpen(false);
      fetchLogEntries();
    } catch (error) {
      console.error('Error creating log entry:', error);
    }
  };

  const handleEditLogEntry = async (logData: any) => {
    if (!selectedEntry) return;
    try {
      await axios.put(`http://localhost:5001/api/logs/${selectedEntry._id}`, logData);
      setIsEditDialogOpen(false);
      fetchLogEntries();
    } catch (error) {
      console.error('Error updating log entry:', error);
    }
  };

  const handleDeleteLogEntry = async (logId: string) => {
    if (!window.confirm('Are you sure you want to delete this log entry?')) return;
    try {
      await axios.delete(`http://localhost:5001/api/logs/${logId}`);
      fetchLogEntries();
    } catch (error) {
      console.error('Error deleting log entry:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'IN_PROGRESS':
        return 'info';
      case 'RESOLVED':
        return 'success';
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
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="RESOLVED">Resolved</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={priorityFilter}
              label="Priority"
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="LOW">Low</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
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
                  label={entry.priority}
                  color={getPriorityColor(entry.priority)}
                  size="small"
                />
                <Chip
                  label={entry.status}
                  color={getStatusColor(entry.status)}
                  size="small"
                />
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
            {entry.assignedTo && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Assigned to: {entry.assignedTo.callsign}
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
                ...selectedEntry,
                timestamp: new Date(selectedEntry.timestamp),
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