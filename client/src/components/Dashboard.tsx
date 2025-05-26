import React, { useState } from 'react';
import { Typography, Box, Button, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import LogEntryList from './LogEntryList';
import LogEntryForm from './LogEntryForm';
import EventOverview from './EventOverview';

const Dashboard: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">RAYNET Logger Dashboard</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setIsCreateDialogOpen(true)}
        >
          New Log Entry
        </Button>
      </Box>

      <EventOverview />
      <LogEntryList />

      <Dialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Log Entry</DialogTitle>
        <DialogContent>
          <LogEntryForm
            onSubmit={(data) => {
              console.log('New log entry:', data);
              setIsCreateDialogOpen(false);
            }}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Dashboard; 