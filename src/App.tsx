import React, { useState, useContext, createContext } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  CssBaseline, 
  ThemeProvider, 
  createTheme, 
  alpha,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  IconButton,
  Collapse,
  Stack,
  Chip
} from '@mui/material';
import { 
  ImageOutlined, 
  TextFieldsOutlined, 
  AudiotrackOutlined,
  Menu as MenuIcon,
  ExpandMore,
  ExpandLess,
  SettingsOutlined,
  TuneOutlined
} from '@mui/icons-material';
import ImageGenerator from './components/ImageGenerator';
import { ImageParams } from './components/ImageGenerator';
import logo from './logo.svg';
import TextGenerator from './components/TextGenerator';
import { TextParams } from './components/TextGenerator';
import AudioGenerator from './components/AudioGenerator';
import { AudioParams } from './components/AudioGenerator';

// Create a macOS-inspired glass-like theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2', // Darker blue for better contrast in parameters
    },
    secondary: {
      main: '#ff7043', // Warm accent color
    },
    background: {
      default: '#121212',
      paper: alpha('#242424', 0.78),
    },
    text: {
      primary: '#ffffff',
      secondary: '#e0e0e0',
    },
  },
  typography: {
    fontFamily: '"SF Pro Display", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 500,
      letterSpacing: '-0.5px',
    },
    h6: {
      fontWeight: 500,
      letterSpacing: '-0.25px',
    },
    subtitle1: {
      fontWeight: 400,
    }
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: 'radial-gradient(circle at top right, #303f9f, #121212)',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          background: alpha('#242424', 0.78),
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: alpha('#242424', 0.78),
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #64b5f6 0%, #1976d2 100%)',
          boxShadow: '0 4px 12px rgba(100, 181, 246, 0.3)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            background: alpha('#121212', 0.3),
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            '&:hover': {
              border: '1px solid rgba(255, 255, 255, 0.15)',
            },
            '&.Mui-focused': {
              boxShadow: '0 0 0 2px rgba(100, 181, 246, 0.5)',
            },
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.1)',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        outlined: {
          background: alpha('#121212', 0.3),
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          '&.Mui-selected': {
            backgroundColor: alpha('#64b5f6', 0.15),
            '&:hover': {
              backgroundColor: alpha('#64b5f6', 0.25),
            },
            '& .MuiListItemIcon-root': {
              color: '#64b5f6',
            },
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 42,
          height: 26,
          padding: 0,
        },
        switchBase: {
          padding: 1,
          '&.Mui-checked': {
            '& + .MuiSwitch-track': {
              backgroundColor: '#64b5f6',
              opacity: 0.9,
            },
          },
        },
        thumb: {
          width: 24,
          height: 24,
        },
        track: {
          borderRadius: 13,
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
        },
      },
    },
  },
});

// Create a context for sharing parameter state between sidebar and content
export type GeneratorType = 'image' | 'text' | 'audio';

interface PolynateContextType {
  activeGenerator: GeneratorType;
  setActiveGenerator: (type: GeneratorType) => void;
  imageParams: React.ReactNode | null;
  textParams: React.ReactNode | null;
  audioParams: React.ReactNode | null;
  setImageParams: (params: React.ReactNode) => void;
  setTextParams: (params: React.ReactNode) => void;
  setAudioParams: (params: React.ReactNode) => void;
}

export const PolynateContext = createContext<PolynateContextType>({
  activeGenerator: 'image' as GeneratorType,
  setActiveGenerator: () => {},
  imageParams: null,
  textParams: null,
  audioParams: null,
  setImageParams: () => {},
  setTextParams: () => {},
  setAudioParams: () => {}
});

// The sidebar width
const DRAWER_WIDTH = 340;

// Navigation items
const navItems = [
  { name: 'Image', path: '/', icon: <ImageOutlined />, type: 'image' as const },
  { name: 'Text', path: '/text', icon: <TextFieldsOutlined />, type: 'text' as const },
  { name: 'Audio', path: '/audio', icon: <AudiotrackOutlined />, type: 'audio' as const },
];

// Navigation component
const Navigation = () => {
  const location = useLocation();
  const { 
    activeGenerator, 
    setActiveGenerator,
    imageParams,
    textParams,
    audioParams
  } = useContext(PolynateContext);
  
  // Settings panel expansion state
  const [settingsExpanded, setSettingsExpanded] = useState(true);
  
  // Toggle settings expansion
  const toggleSettings = () => {
    setSettingsExpanded(!settingsExpanded);
  };
  
  // Get current parameters based on active generator
  const getCurrentParams = () => {
    switch (activeGenerator) {
      case 'image':
        return imageParams;
      case 'text':
        return textParams;
      case 'audio':
        return audioParams;
      default:
        return null;
    }
  };
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      overflow: 'hidden' 
    }}>
      <List sx={{ py: 2, flexShrink: 0, px: 1 }}>
        <ListItem sx={{ px: 3, mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, py: 2 }}>
            <img src={logo} alt="Polynate Logo" style={{ width: '96px', height: '96px' }} />
            <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1.1, mt: '25px', ml: '-23px' }}>
              Polynate
            </Typography>
          </Box>
        </ListItem>
        <Divider sx={{ mb: 1, opacity: 0.2 }} />
        {navItems.map((item) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton 
              component={Link} 
              to={item.path}
              selected={location.pathname === item.path}
              onClick={() => setActiveGenerator(item.type)}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.name} />
              {location.pathname === item.path && (
                <Chip 
                  label="Active" 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
        
        <ListItem disablePadding sx={{ mt: 1 }}>
          <ListItemButton onClick={toggleSettings} sx={{ py: 1.5 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <TuneOutlined />
            </ListItemIcon>
            <ListItemText primary="Parameters" />
            {settingsExpanded ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
      </List>
      
      {/* Parameters section */}
      <Divider sx={{ opacity: 0.2 }} />
      <Box sx={{ 
        overflowY: 'auto', 
        flexGrow: 1,
        pt: 2,
        pb: 3,
        px: 3,
      }}>
        <Collapse in={settingsExpanded} timeout="auto" unmountOnExit>
          <Box sx={{ py: 2 }}>
            {getCurrentParams()}
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for the active generator and parameters
  const [activeGenerator, setActiveGenerator] = useState<GeneratorType>('image');
  const [imageParams, setImageParams] = useState<React.ReactNode | null>(null);
  const [textParams, setTextParams] = useState<React.ReactNode | null>(null);
  const [audioParams, setAudioParams] = useState<React.ReactNode | null>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <PolynateContext.Provider value={{
      activeGenerator,
      setActiveGenerator,
      imageParams,
      textParams,
      audioParams,
      setImageParams,
      setTextParams,
      setAudioParams
    }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Mobile drawer toggle */}
            {isMobile && (
              <Box sx={{ position: 'fixed', top: 16, left: 16, zIndex: 1199 }}>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ 
                    backgroundColor: alpha('#242424', 0.7),
                    backdropFilter: 'blur(10px)',
                    '&:hover': { backgroundColor: alpha('#242424', 0.9) }
                  }}
                >
                  <MenuIcon />
                </IconButton>
              </Box>
            )}

            {/* Responsive drawer */}
            <Drawer
              variant={isMobile ? 'temporary' : 'permanent'}
              open={isMobile ? mobileOpen : true}
              onClose={handleDrawerToggle}
              ModalProps={{ keepMounted: true }}
              sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                  width: DRAWER_WIDTH,
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                },
              }}
            >
              <Navigation />
            </Drawer>

            {/* Main content area */}
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: { xs: 2, md: 0 }, // Remove padding on desktop for closer fit with sidebar
                pl: { md: 0 }, // Remove left padding completely
                width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                ml: { md: `${DRAWER_WIDTH}px` },
                overflowX: 'hidden',
              }}
            >
              <Routes>
                <Route path="/" element={<ImageGenerator />} />
                <Route path="/text" element={<TextGenerator />} />
                <Route path="/audio" element={<AudioGenerator />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Box>
          </Box>
        </BrowserRouter>
      </ThemeProvider>
    </PolynateContext.Provider>
  );
}

export default App;
