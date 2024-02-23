import CssBaseline from '@mui/material/CssBaseline';
import React, { useEffect, useMemo, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';

import Drawer from './components/Drawer';
import Footer from './components/Footer';
import NavBar from './components/NavBar';

import Inventory from './pages/Inventory';
import Login from './pages/Login';
import NoMatch from './pages/NoMatch';
import Refrigerator from './pages/Refrigerator';

import { fetchAuthSession } from 'aws-amplify/auth';
import { UserContext } from './context/UserContext';

function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const value = useMemo(() => ({ user, setUser }), [user, setUser]);

  useEffect(() => {
    if (!user) {
      const fetchSession = async () => {
        const session = await fetchAuthSession();
        session['tokens'] ? setUser(session) : navigate('/');
      };
      fetchSession();
    }
  }, [navigate, user]);

  return (
    <UserContext.Provider value={value}>
      <CssBaseline />
      {user && <NavBar setIsDrawerOpen={setIsDrawerOpen} setUser={setUser} />}
      <Drawer setIsDrawerOpen={setIsDrawerOpen} isDrawerOpen={isDrawerOpen} />
      <Routes>
        <Route path="/refrigerator" element={<Refrigerator />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/" element={<Login setUser={setUser} />} />
        <Route path="*" element={<NoMatch />} />
      </Routes>
      {user && <Footer />}
    </UserContext.Provider>
  );
}

export default App;
