import React from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Link as LinkIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

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

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onLink: (event: Event) => void;
  onDelete: (eventId: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  onEdit,
  onLink,
  onDelete,
}) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">{event.name}</Typography>
        <Box>
          <IconButton onClick={() => onEdit(event)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => onLink(event)}>
            <LinkIcon />
          </IconButton>
          <IconButton onClick={() => onDelete(event._id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {event.description}
      </Typography>
      <Chip
        label={event.status}
        color={
          event.status === 'ACTIVE'
            ? 'success'
            : event.status === 'COMPLETED'
            ? 'primary'
            : 'default'
        }
        size="small"
        sx={{ mr: 1 }}
      />
      {event.talkgroups.map((tg, index) => (
        <Chip
          key={index}
          label={tg.name}
          size="small"
          sx={{ mr: 1, mb: 1 }}
        />
      ))}
      {event.channels.map((ch, index) => (
        <Chip
          key={index}
          label={ch.name}
          size="small"
          sx={{ mr: 1, mb: 1 }}
        />
      ))}
    </Paper>
  );
};

export default EventCard; 