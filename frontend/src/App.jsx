import React, { useState, useMemo } from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';

import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Drawer from './components/Drawer';

import Refrigerator from './pages/Refrigerator';
import NoMatch from './pages/NoMatch';
import Login from './pages/Login';
import Inventory from './pages/Inventory';

import { UserContext } from './context/UserContext';

function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);

  const value = useMemo(() => ({ user, setUser }), [user, setUser]);

  return (
    <UserContext.Provider value={value}>
      <CssBaseline />
      <Router>
        {user && <NavBar setIsDrawerOpen={setIsDrawerOpen} setUser={setUser} />}
        <Drawer setIsDrawerOpen={setIsDrawerOpen} isDrawerOpen={isDrawerOpen} />
        <Routes>
          <Route path="/refrigerator" element={user ? <Refrigerator /> : <Navigate to="/login" replace />} />
          <Route path="/inventory" element={user ? <Inventory /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="*" element={<NoMatch />} />
        </Routes>
        {user && <Footer />}
      </Router>
    </UserContext.Provider>
  );
}

export default App;
