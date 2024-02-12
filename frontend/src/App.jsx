import React, { useState } from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';

import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Drawer from './components/Drawer';

import Home from './pages/Home';
import NoMatch from './pages/NoMatch';
import Login from './pages/Login';

function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <CssBaseline />
      <Router>
        <NavBar setIsDrawerOpen={setIsDrawerOpen} />
        <Drawer setIsDrawerOpen={setIsDrawerOpen} isDrawerOpen={isDrawerOpen} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NoMatch />} />
        </Routes>
        <Footer />
      </Router>
    </>
  );
}

export default App;
