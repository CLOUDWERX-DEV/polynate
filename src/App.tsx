import React, { useState, useContext, createContext } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import {
  Box,
  Typography,
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
  Chip
} from '@mui/material';
import {
  ImageOutlined,
  TextFieldsOutlined,
  AudiotrackOutlined,
  Menu as MenuIcon,
  ExpandMore,
  ExpandLess,
  TuneOutlined,
  GitHub as GitHubIcon,
  Api as ApiOutlined
} from '@mui/icons-material';
import ImageGenerator from './components/ImageGenerator';
import logo from './logo.svg';
import TextGenerator from './components/TextGenerator';
import AudioGenerator from './components/AudioGenerator';

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
          '& .MuiInputLabel-root': {
            // Improve label visibility
            '&.Mui-focused': {
              backgroundColor: 'transparent',
            },
          },
          '& .MuiInputLabel-outlined': {
            // Create proper label background when field is focused
            '&.MuiInputLabel-shrink': {
              backgroundColor: '#121212',  // Match app background
              paddingLeft: 5,
              paddingRight: 5,
              marginLeft: -5,  // Offset the padding to align correctly
              borderRadius: 3,  // Rounded corners for the label background
            },
          },
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
            // Ensure the notch for the label is the right size
            '& legend': {
              fontSize: '0.85em',  // Match the font size of the shrunk label
            },
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
const DRAWER_WIDTH = 300;

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
      <Box sx={{ pt: 0.75, pb: 0.5, flexShrink: 0, px: 1 }}>
        <Box sx={{ px: 1.5, mb: 0.25 }}>
          <Box
            component="a"
            href="http://polynate.cloudwerx.dev"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              py: 0.75,
              textDecoration: 'none',
              color: 'inherit',
              '&:hover': {
                opacity: 0.9
              }
            }}
          >
            <img src={logo} alt="Polynate Logo" style={{ width: '75px', height: '75px' }} />
            <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1.1, mt: '22px', ml: '-20px', fontSize: '1.8rem' }}>
              Polynate
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ mb: 0.25, opacity: 0.2 }} />
      </Box>
      <List sx={{ py: 0, flexShrink: 0, px: 1 }}>
        <Box sx={{ py: 0.25 }}>
          {navItems.map((item) => (
            <ListItem key={item.name} disablePadding sx={{ mb: 0 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={location.pathname === item.path}
                onClick={() => setActiveGenerator(item.type)}
                sx={{ py: 0.5, minHeight: '36px' }}
              >
                <ListItemIcon sx={{ minWidth: 28 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.name}
                  primaryTypographyProps={{ fontSize: '0.9rem' }}
                />
                {location.pathname === item.path && (
                  <Chip
                    label="Active"
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ height: 16, fontSize: '0.6rem' }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </Box>

        <ListItem disablePadding sx={{ mt: 0.25 }}>
          <ListItemButton onClick={toggleSettings} sx={{ py: 0.5, minHeight: '36px' }}>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <TuneOutlined />
            </ListItemIcon>
            <ListItemText
              primary="Parameters"
              primaryTypographyProps={{ fontSize: '0.9rem' }}
            />
            {settingsExpanded ? <ExpandLess sx={{ fontSize: '1.1rem' }} /> : <ExpandMore sx={{ fontSize: '1.1rem' }} />}
          </ListItemButton>
        </ListItem>
      </List>

      {/* Parameters section */}
      <Divider sx={{ opacity: 0.2 }} />
      <Box sx={{
        overflowY: 'auto',
        flexGrow: 1,
        pt: 1,
        pb: 2,
        px: 2,
      }}>
        <Collapse in={settingsExpanded} timeout="auto" unmountOnExit>
          <Box sx={{ py: 1 }}>
            {getCurrentParams()}
          </Box>
        </Collapse>
      </Box>

      {/* Footer with attribution links */}
      <Box sx={{
        py: 0.6,
        px: 1.2,
        borderTop: '1px solid',
        borderColor: alpha('#ffffff', 0.1),
        mt: 'auto',
        fontSize: '0.62rem',
        background: theme => alpha(theme.palette.background.paper, 0.05),
        backdropFilter: 'blur(8px)'
      }}>
        {/* Top row with CLOUDWERX LAB and GitHub */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5
        }}>
          <Box component="a"
            href="http://polynate.cloudwerx.dev"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: theme => theme.palette.primary.main,
              textDecoration: 'none',
              fontSize: '0.65rem',
              fontWeight: 'bold',
              textShadow: '0 0 10px rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              '&:hover': { color: theme => theme.palette.primary.light }
            }}
          >
            CLOUDWERX LAB
          </Box>

          <Box component="a"
            href="http://github.com/CLOUDWERX-LAB/polynate"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: alpha('#ffffff', 0.6),
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              '&:hover': { color: '#ffffff' }
            }}
          >
            <GitHubIcon sx={{ fontSize: '0.7rem', mr: 0.5, opacity: 0.8 }} />
            GitHub
          </Box>
        </Box>

        {/* Bottom row with pollinations.ai */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mt: 0.3,
          opacity: 0.7
        }}>
          <Box component="a"
            href="https://pollinations.ai"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: alpha('#ffffff', 0.7),
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              fontSize: '0.6rem',
              '&:hover': { color: '#ffffff' }
            }}
          >
            <ApiOutlined sx={{ fontSize: '0.7rem', mr: 0.5, opacity: 0.8 }} />
            Powered by pollinations.ai
          </Box>
        </Box>
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

            {/* Routes */}
            <Routes>
              <Route path="/" element={<ImageGenerator />} />
              <Route path="/text" element={<TextGenerator />} />
              <Route path="/audio" element={<AudioGenerator />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>
        </BrowserRouter>
      </ThemeProvider>
    </PolynateContext.Provider>
  );
}

export default App;
