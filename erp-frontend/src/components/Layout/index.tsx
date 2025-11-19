import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from '../Header';
import Sidebar from '../Sidebar';
import { ToastProvider } from '../../context/ToastProvider';

export default function Layout() {
  return (
    <ToastProvider>
      <Box sx={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '100vh' }}>
        <Sidebar />
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Header />
          <Box component="main" sx={{ p: 3 }}>{/* Contenido de páginas */}
            <Outlet />
          </Box>
        </Box>
      </Box>
    </ToastProvider>
  );
}
