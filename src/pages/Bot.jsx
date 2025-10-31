import React, { useState } from 'react';
import {
  Typography, Paper, Box, Grid, TextField, Button, Select, MenuItem,
  FormControl, InputLabel, CircularProgress, Alert, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Collapse
} from '@mui/material';
import api from '../api/axiosConfig';

// Configuración de las estrategias y sus parámetros por defecto
const STRATEGY_CONFIG = {
  'RSI': {
    name: 'RSI (Reversión a la Media)',
    params: { rsi_length: 14, rsi_buy: 30, rsi_sell: 70 }
  },
  'MA_CROSS': {
    name: 'Cruce de Medias Móviles (Tendencia)',
    params: { fast_period: 20, slow_period: 50 }
  },
  'MACD': {
    name: 'MACD (Momentum y Tendencia)',
    params: { fast: 12, slow: 26, signal: 9 }
  }
};

function Bot() {
  // Estados del formulario
  const [formState, setFormState] = useState({
    symbol: 'GGAL',
    interval: '1d',
    strategy_name: 'MACD',
    initial_capital: 1000,
    position_size: 1,
  });
  const [strategyParams, setStrategyParams] = useState(STRATEGY_CONFIG['MACD'].params);

  // Estados de la UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleStrategyChange = (e) => {
    const newStrategy = e.target.value;
    setFormState(prev => ({ ...prev, strategy_name: newStrategy }));
    setStrategyParams(STRATEGY_CONFIG[newStrategy].params);
  };

  const handleParamChange = (e) => {
    const { name, value } = e.target;
    setStrategyParams(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    const payload = {
      ...formState,
      strategy_params: strategyParams
    };

    try {
      const response = await api.post('/bot/backtest', payload);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Ocurrió un error al ejecutar el backtest.');
    } finally {
      setLoading(false);
    }
  };

  // Componente para renderizar los campos de parámetros dinámicos
  const renderStrategyParams = () => {
    return Object.entries(strategyParams).map(([key, value]) => (
      <Grid item xs={12} sm={4} key={key}>
        <TextField
          name={key}
          label={key.replace('_', ' ').toUpperCase()}
          type="number"
          value={value}
          onChange={handleParamChange}
          fullWidth
        />
      </Grid>
    ));
  };

  return (
    <Grid container spacing={3}>
      {/* Columna del Formulario de Configuración */}
      <Grid item xs={12} md={4}>
        <Typography variant="h4" gutterBottom>
          Bot Automatizado
        </Typography>
        <Paper sx={{ p: 3, borderRadius: '12px' }}>
          <Typography variant="h6" gutterBottom>Configurar Backtest</Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField name="symbol" label="Símbolo" value={formState.symbol} onChange={handleInputChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="interval" label="Intervalo" value={formState.interval} onChange={handleInputChange} fullWidth helperText="Ej: 1d, 4h, 15m" />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="strategy-select-label">Estrategia</InputLabel>
                  <Select
                    labelId="strategy-select-label"
                    name="strategy_name"
                    value={formState.strategy_name}
                    label="Estrategia"
                    onChange={handleStrategyChange}
                  >
                    {Object.entries(STRATEGY_CONFIG).map(([key, config]) => (
                      <MenuItem key={key} value={key}>{config.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Parámetros dinámicos de la estrategia */}
              {renderStrategyParams()}

              <Grid item xs={12} sm={6}>
                <TextField name="initial_capital" label="Capital Inicial" type="number" value={formState.initial_capital} onChange={handleInputChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="position_size" label="Tamaño Posición (%)" type="number" value={formState.position_size} onChange={handleInputChange} fullWidth helperText="Ej: 1 para 100%" />
              </Grid>
            </Grid>
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Ejecutar Simulación'}
            </Button>
          </Box>
        </Paper>
      </Grid>

      {/* Columna de Resultados */}
      <Grid item xs={12} md={8}>
        <Collapse in={loading || error || result}>
          <Paper sx={{ p: 3, borderRadius: '12px', minHeight: '100%' }}>
            <Typography variant="h6" gutterBottom>Resultados de la Simulación</Typography>
            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>}
            {error && <Alert severity="error">{error}</Alert>}
            {result && (
              <Box>
                {/* Métricas Principales */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6} sm={3}><Typography>Estrategia: <strong>{result.strategy_name}</strong></Typography></Grid>
                  <Grid item xs={6} sm={3}><Typography>Ganancia/Pérdida: <strong>${result.profit_loss.toFixed(2)} ({result.profit_loss_pct.toFixed(2)}%)</strong></Typography></Grid>
                  <Grid item xs={6} sm={3}><Typography>Win Rate: <strong>{result.win_rate.toFixed(2)}%</strong></Typography></Grid>
                  <Grid item xs={6} sm={3}><Typography>Max Drawdown: <strong>{result.max_drawdown.toFixed(2)}%</strong></Typography></Grid>
                </Grid>

                {/* Tabla de Trades */}
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Entrada</TableCell>
                        <TableCell>Salida</TableCell>
                        <TableCell align="right">Precio Entrada</TableCell>
                        <TableCell align="right">Precio Salida</TableCell>
                        <TableCell align="right">Ganancia (%)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.trades.map((trade, index) => (
                        <TableRow key={index}>
                          <TableCell>{new Date(trade.entry_time).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(trade.exit_time).toLocaleDateString()}</TableCell>
                          <TableCell align="right">${trade.entry_price.toFixed(2)}</TableCell>
                          <TableCell align="right">${trade.exit_price.toFixed(2)}</TableCell>
                          <TableCell align="right" sx={{ color: trade.profit > 0 ? 'success.main' : 'error.main' }}>
                            {trade.profit_pct.toFixed(2)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Paper>
        </Collapse>
      </Grid>
    </Grid>
  );
}

export default Bot;