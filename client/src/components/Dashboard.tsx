import React from 'react';
import { Typography, Box } from '@mui/material';

const Dashboard: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        RAYNET Logger Dashboard
      </Typography>
      <Typography>
        Welcome! This is your main event log view. (Log timeline, entry form, and filters will go here.)
      </Typography>
    </Box>
  );
};

export default Dashboard; 