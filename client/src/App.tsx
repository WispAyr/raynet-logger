import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import EventForm from './components/EventForm';
import EventOverview from './components/EventOverview';
import LogEntryList from './components/LogEntryList';
import LogEntryForm from './components/LogEntryForm';
import OperatorView from './components/OperatorView';
import { PrivateRoute } from './components/PrivateRoute';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
  },
});

const OperatorViewWithParams = () => {
  const { eventId } = useParams<{ eventId: string }>();
  if (!eventId) return null;
  return <OperatorView eventId={eventId} />;
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/events/new"
              element={
                <PrivateRoute>
                  <EventForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/events/:eventId"
              element={
                <PrivateRoute>
                  <EventOverview />
                </PrivateRoute>
              }
            />
            <Route
              path="/events/:eventId/edit"
              element={
                <PrivateRoute>
                  <EventForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/events/:eventId/logs"
              element={
                <PrivateRoute>
                  <LogEntryList />
                </PrivateRoute>
              }
            />
            <Route
              path="/events/:eventId/logs/new"
              element={
                <PrivateRoute>
                  <LogEntryForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/operator/:eventId"
              element={
                <PrivateRoute>
                  <OperatorViewWithParams />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
