import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useOutletContext } from 'react-router-dom';
import { Typography } from '@mui/material';

// --- Vistas Principales ---
import Login from './components/Login';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Configuraciones from './pages/Configuraciones';
import Register from './components/Register';
import Bot from './pages/Bot'; // <--- 1. IMPORTAMOS NUESTRA NUEVA PÁGINA

// --- Componentes "Placeholder" (temporales) ---
function Perfil() {
  const { user } = useOutletContext();
  return <h2>👤 Perfil de {user ? user.email : ''}</h2>;
}
// ----------------------------------------------

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- Rutas Públicas --- */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* --- Rutas Protegidas (La App Principal) --- */}
        <Route 
          path="/app" 
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="bot" element={<Bot />} /> {/* <--- 2. LA USAMOS AQUÍ */}
          <Route path="perfil" element={<Perfil />} />
          <Route path="config" element={<Configuraciones />} />
        </Route>
        
        {/* --- Ruta 404 --- */}
        <Route path="*" element={<h2>404: Página no encontrada</h2>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;