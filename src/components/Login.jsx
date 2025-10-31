import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert,
  Grid
} from '@mui/material';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    try {
      // --- ANTES ---
      // const response = await axios.post(
      //   'http://localhost:8000/api/v1/login',
      // ...

      // --- DESPUÉS (CORREGIDO) ---
      const response = await axios.post(
        'http://localhost:8000/api/v1/auth/login', // <-- URL CORREGIDA
        formData,
        { headers: { 'Content-Type': 'application/x-form-urlencoded' } }
      );

      localStorage.setItem('accessToken', response.data.access_token);
      navigate('/app/dashboard');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Email o contraseña incorrectos.');
      } else {
        // Ahora podemos diferenciar el 404 de otros errores
        if (err.response && err.response.status === 404) {
             setError('Error: No se encontró el endpoint de login. Contacta al administrador.');
        } else {
            setError('Error al conectar con el servidor.');
        }
      }
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper 
        elevation={6} 
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 4,
          borderRadius: 2
        }}
      >
        <Typography component="h1" variant="h5" color="primary" fontWeight="bold">
          Finanzas Network
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Dirección de Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Contraseña"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {error}
            </Alert>
          )}
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Ingresar
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Button component={RouterLink} to="/register">
                ¿No tienes una cuenta? Regístrate
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export default Login;