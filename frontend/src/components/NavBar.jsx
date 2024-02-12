import React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { signOut } from 'aws-amplify/auth';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';

export default function NavBar({ setIsDrawerOpen, setUser }) {
  const navigate = useNavigate();
  const handleSignOut = async () => {
    try {
      await signOut({ global: true });
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.log('error signing out: ', error);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon onClick={() => setIsDrawerOpen(true)} />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Refrigerator Inventory Detection
          </Typography>
          <Button color="success" variant="contained" onClick={() => handleSignOut()}>
            Log Out
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
