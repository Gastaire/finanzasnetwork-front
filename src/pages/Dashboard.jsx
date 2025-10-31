import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Typography, 
  Grid, 
  Paper, 
  CircularProgress, 
  Box, 
  Alert 
} from '@mui/material';
import api from '../api/axiosConfig'; // Nuestro cliente API

function Dashboard() {
  const { user } = useOutletContext(); // Obtenemos el usuario del layout
  
  // Estados para los datos, carga y errores
  const [dolarData, setDolarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect se ejecuta una vez cuando el componente se carga
  useEffect(() => {
    const fetchDolarData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Usamos nuestro cliente 'api' que ya incluye el token (aunque este endpoint no lo necesita)
        const response = await api.get('/mercado/dolar');
        
        // Filtramos para mostrar solo los que nos interesan
        const filteredData = response.data.filter(dolar => 
          ['Oficial', 'Blue', 'MEP', 'CCL'].includes(dolar.nombre)
        );
        
        setDolarData(filteredData);
        
      } catch (err) {
        console.error("Error al buscar datos del dólar:", err);
        setError("No se pudieron cargar las cotizaciones. Intente más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchDolarData();
  }, []); // El array vacío [] significa que se ejecuta solo una vez al montar

  // --- Renderizado del componente ---

  // 1. Mostrar spinner mientras carga
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  // 2. Mostrar error si falló la carga
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  // 3. Mostrar el dashboard si todo salió bien
  return (
    <Box>
      {/* Saludo al usuario */}
      <Typography variant="h4" gutterBottom>
        Bienvenido, {user ? user.email.split('@')[0] : ''}
      </Typography>
      <Typography variant="body1" color="textSecondary" gutterBottom>
        Este es el resumen del mercado en tiempo real.
      </Typography>

      {/* Contenedor de las "Métricas Principales" */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        
        {/* Iteramos sobre los datos del dólar y creamos una tarjeta (Paper) por cada uno */}
        {dolarData.map((dolar) => (
          <Grid item xs={12} sm={6} md={3} key={dolar.nombre}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 2.5, 
                borderRadius: '12px', 
                display: 'flex', 
                flexDirection: 'column',
                height: '100%' 
              }}
            >
              <Typography variant="h6" color="textSecondary">
                Dólar {dolar.nombre}
              </Typography>
              <Typography 
                variant="h4" 
                fontWeight="600" 
                sx={{ mt: 1, mb: 1 }}
              >
                {/* Formateamos el precio de venta */}
                ${Number(dolar.venta).toLocaleString('es-AR', {minimumFractionDigits: 2})}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Compra: ${Number(dolar.compra).toLocaleString('es-AR', {minimumFractionDigits: 2})}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Actualizado: {new Date(dolar.fechaActualizacion).toLocaleString('es-AR')}
              </Typography>
            </Paper>
          </Grid>
        ))}
        
      </Grid>
    </Box>
  );
}

export default Dashboard;