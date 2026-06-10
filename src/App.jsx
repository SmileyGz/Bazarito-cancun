import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import CatalogPage from './pages/CatalogPage';
import AdminPage from './pages/AdminPage';

function CatalogLayout() {
  const navigate = useNavigate();
  return (
    <>
      <Navbar onAdminClick={() => navigate('/admin')} />
      <CatalogPage />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"      element={<CatalogLayout />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}
