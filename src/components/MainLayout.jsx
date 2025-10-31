import React, { useState, useEffect } from 'react';
import { Link as RouterLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig'; // Importamos nuestro cliente API
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  List, 
  Typography, 
  Divider, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  IconButton,
  CssBaseline,
  useTheme,
  CircularProgress // Spinner de carga
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

const drawerWidth = 240;

function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const theme = useTheme(); 
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // --- ESTADO PARA GUARDAR AL USUARIO ---
  const [user, setUser] = useState(null); // Empezamos en null
  const [loading, setLoading] = useState(true); // Estado de carga

  // --- EFECTO PARA BUSCAR AL USUARIO AL CARGAR ---
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // ¡Nuestra API ya incluye el token automáticamente!
        const response = await api.get('/users/me');
        setUser(response.data); // Guardamos el usuario (ej. {id: 1, email: "..."})
      } catch (error) {
        console.error("Error al buscar al usuario (token inválido o expirado):", error);
        // Si el token es inválido (error 401) o cualquier otro error,
        // limpiamos el token y lo mandamos al login.
        localStorage.removeItem('accessToken');
        navigate('/login');
      } finally {
        setLoading(false); // Terminamos de cargar
      }
    };

    fetchUser();
  }, [navigate]); // El 'navigate' es una dependencia del hook

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  // Lista de items de navegación
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/app/dashboard' },
    { text: 'Bot Automatizado', icon: <SmartToyIcon />, path: '/app/bot' },
    { text: 'Perfil', icon: <AccountCircleIcon />, path: '/app/perfil' },
    { text: 'Configuraciones', icon: <SettingsIcon />, path: '/app/config' },
  ];

  const drawerContent = (
    <div>
      {/* Título en la barra lateral */}
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" noWrap component="div" sx={{ color: 'white' }}>
          Finanzas Network
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
      <List>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                onClick={handleDrawerToggle} // Cierra el menú móvil al hacer clic
                sx={{
                  color: isActive ? theme.palette.primary.main : 'rgba(255, 255, 255, 0.8)',
                  textDecoration: 'none',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: 'white',
                  },
                  margin: '4px 8px',
                  borderRadius: '8px',
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: '40px' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#ff8a80',
              },
              margin: '4px 8px',
              borderRadius: '8px',
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: '40px' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Cerrar Sesión" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  // --- MOSTRAR SPINNER MIENTRAS CARGA ---
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f7fa' }}>
        <CircularProgress />
      </Box>
    );
  }

  // --- RENDERIZAR LA APP CUANDO TENEMOS AL USUARIO ---
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      <AppBar
        position="fixed"
        elevation={1} 
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'white', 
          color: '#111827', 
          borderBottom: '1px solid #e0e0e0' 
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Título de la sección (se expande para empujar el email a la derecha) */}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {/* Aquí podríamos poner el título de la página activa */}
          </Typography>
          
          {/* ¡Personalización! Mostramos el email del usuario */}
          <Typography variant="body1" noWrap>
            {user ? user.email : 'Cargando...'}
          </Typography>
        </Toolbar>
      </AppBar>
      
      {/* --- BARRA LATERAL (DRAWER) --- */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Drawer para Móvil (Temporal) */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth, 
              backgroundColor: '#111827', 
              color: 'white',
              borderRight: 'none'
            },
          }}
        >
          {drawerContent}
        </Drawer>
        
        {/* Drawer para Escritorio (Permanente) */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: '#111827', 
              color: 'white',
              borderRight: 'none'
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>
      
      {/* --- CONTENIDO PRINCIPAL --- */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: '#f4f7fa' 
        }}
      >
        <Toolbar /> {/* Espacio para el AppBar */}
        
        {/* PASAR EL USUARIO A LAS RUTAS HIJAS (Dashboard, Perfil...) */}
        <Outlet context={{ user: user }} /> 
      </Box>
    </Box>
  );
}

export default MainLayout;