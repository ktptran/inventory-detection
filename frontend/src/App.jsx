import React, { useState } from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';

import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Drawer from './components/Drawer';

import Home from './pages/Home';
import NoMatch from './pages/NoMatch';
import Login from './pages/Login';

function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);

  return (
    <>
      <CssBaseline />
      <Router>
        {user && <NavBar setIsDrawerOpen={setIsDrawerOpen} setUser={setUser} />}
        <Drawer setIsDrawerOpen={setIsDrawerOpen} isDrawerOpen={isDrawerOpen} />
        <Routes>
          <Route path="/home" element={user ? <Home /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="*" element={<NoMatch />} />
        </Routes>
        {user && <Footer />}
      </Router>
    </>
  );
}

export default App;
