import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Paper, 
  Box, 
  TextField, 
  Button, 
  Alert, 
  CircularProgress,
  Grid,
  Stack // Para alinear los botones
} from '@mui/material';
import api from '../api/axiosConfig'; // Nuestro cliente API

function Configuraciones() {
  // Estados para el formulario
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  
  // Estados de la UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasKeys, setHasKeys] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // ¡NUEVO ESTADO! Para el test de conexión
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState({ status: null, message: '' }); // 'success', 'error'

  // 1. Comprobar el estado de las claves al cargar la página
  useEffect(() => {
    const fetchKeyStatus = async () => {
      try {
        setLoading(true);
        const response = await api.get('/settings/api-keys/status');
        if (response.data.is_saved) {
          setHasKeys(true);
        }
      } catch (err) {
        setError('No se pudo verificar el estado de las claves.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchKeyStatus();
  }, []);

  // 2. Manejador para guardar o actualizar las claves
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setTestResult({ status: null, message: '' }); // Limpiamos test
    
    if (!apiKey || !apiSecret) {
      setError('Ambos campos son obligatorios.');
      return;
    }

    try {
      const response = await api.post('/settings/api-keys', {
        broker_name: 'ppi',
        api_key: apiKey,
        api_secret: apiSecret
      });

      if (response.data.is_saved) {
        setSuccess('¡Claves de API guardadas y encriptadas con éxito!');
        setHasKeys(true);
        setIsEditing(false);
        setApiKey('');
        setApiSecret('');
      }
    } catch (err) {
      setError('Ocurrió un error al guardar las claves.');
      console.error(err);
    }
  };

  // --- ¡NUEVA FUNCIÓN! ---
  // 3. Manejador para probar la conexión
  const handleTestConnection = async () => {
    setTestLoading(true);
    setError('');
    setSuccess('');
    setTestResult({ status: null, message: '' }); // Limpiamos test previo

    try {
      // Llamamos al nuevo endpoint del backend
      const response = await api.get('/portfolio/account-summary');
      
      // Si todo sale bien (simulación exitosa)
      setTestResult({ 
        status: 'success', 
        message: `¡Conexión exitosa! (Simulado: Saldo ARS $${response.data.saldo})` 
      });

    } catch (err) {
      // Si el backend devuelve un error (ej. 401 Claves Inválidas)
      // err.response.data.detail es el mensaje que enviamos desde FastAPI
      const errorMessage = err.response?.data?.detail || 'Error desconocido al probar la conexión.';
      setTestResult({ 
        status: 'error', 
        message: `Error de conexión: ${errorMessage}` 
      });
    } finally {
      setTestLoading(false);
    }
  };

  // --- Renderizado ---

  if (loading) {
    return <CircularProgress />;
  }

  // Mostrar mensajes de éxito o error
  const renderAlerts = () => (
    <>
      {error && <Alert severity="error" sx={{ mb: 2, mt: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, mt: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      
      {/* Mostramos el resultado del Test */}
      {testResult.status === 'success' && (
        <Alert severity="success" sx={{ mb: 2, mt: 2 }} onClose={() => setTestResult({ status: null, message: '' })}>
          {testResult.message}
        </Alert>
      )}
      {testResult.status === 'error' && (
        <Alert severity="error" sx={{ mb: 2, mt: 2 }} onClose={() => setTestResult({ status: null, message: '' })}>
          {testResult.message}
        </Alert>
      )}
    </>
  );

  // Vista del Formulario (para crear o editar)
  const renderForm = () => (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6">
        {hasKeys ? 'Modificar Claves de PPI' : 'Conectar con PPI'}
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Ingresa tus claves de API de PPI (Sandbox o Producción).
        Tus claves se almacenan encriptadas.
      </Typography>
      <TextField
        label="API Key"
        variant="outlined"
        fullWidth
        margin="normal"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        helperText="Usa 'test_key_123' para la simulación"
      />
      <TextField
        label="API Secret"
        type="password"
        variant="outlined"
        fullWidth
        margin="normal"
        value={apiSecret}
        onChange={(e) => setApiSecret(e.target.value)}
        helperText="Usa 'test_secret_xyz' para la simulación"
      />
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item>
          <Button type="submit" variant="contained" color="primary">
            Guardar Claves
          </Button>
        </Grid>
        {isEditing && (
          <Grid item>
            <Button variant="outlined" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
          </Grid>
        )}
      </Grid>
    </Box>
  );

  // Vista de Resumen (cuando las claves ya están guardadas)
  const renderSummary = () => (
    <Box>
      <Typography variant="h6">Claves de API de PPI</Typography>
      <Alert severity="info" sx={{ mt: 2 }}>
        Tus claves de API de Portfolio Personal Inversiones ya están
        guardadas y encriptadas.
      </Alert>
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button 
          variant="contained" 
          onClick={() => {
            setIsEditing(true); 
            setSuccess('');
            setError('');
            setTestResult({ status: null, message: '' }); // Limpiamos test
          }} 
        >
          Modificar Claves
        </Button>
        <Button 
          variant="outlined" 
          onClick={handleTestConnection}
          disabled={testLoading} // Deshabilitar mientras prueba
        >
          {testLoading ? <CircularProgress size={24} /> : 'Probar Conexión'}
        </Button>
      </Stack>
    </Box>
  );

  return (
    <Paper sx={{ p: 3, maxWidth: 600, margin: 'auto', borderRadius: '12px' }}>
      <Typography variant="h4" gutterBottom>
        Configuraciones
      </Typography>
      
      {renderAlerts()}

      {!hasKeys || isEditing ? renderForm() : renderSummary()}
    </Paper>
  );
}

export default Configuraciones;