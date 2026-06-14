import React, { useState } from 'react';
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import CatalogPage from './pages/CatalogPage';
import AdminPage from './pages/AdminPage';

function CatalogLayout() {
  const navigate = useNavigate();
  return (
    <>
      <Navbar />
      <CatalogPage />
    </>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/"      element={<CatalogLayout />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </HashRouter>
  );
}
