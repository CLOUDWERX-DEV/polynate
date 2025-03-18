import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Typography,
  Divider,
  alpha,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Fade,
  Chip,
  Tooltip
} from '@mui/material';
import {
  RecordVoiceOverOutlined,
  MusicNoteOutlined,
  DownloadOutlined
} from '@mui/icons-material';
import { pollinationsService } from '../services/pollinationsService';
import { PolynateContext, GeneratorType } from '../App';

// Models are handled directly in the component

// Export for the App context
export const AudioParams: React.FC<{
  prompt: string;
  setPrompt: (prompt: string) => void;
  voice: string;
  setVoice: (voice: string) => void;
  model: string;
  setModel: (model: string) => void;
  loading: boolean;
  handleGenerate: () => void;
  error: string | null;
}> = (props) => {
  const {
    prompt, setPrompt, voice, setVoice, model, setModel,
    loading, handleGenerate, error
  } = props;

  const voices = [
    { id: 'alloy', name: 'Alloy', description: 'Versatile neutral voice' },
    { id: 'echo', name: 'Echo', description: 'Deep and powerful voice' },
    { id: 'fable', name: 'Fable', description: 'Narrative storytelling voice' },
    { id: 'nova', name: 'Nova', description: 'Bright and clear voice' },
    { id: 'shimmer', name: 'Shimmer', description: 'Elegant and smooth voice' }
  ];

  const models = [
    { id: 'openai-audio', name: 'OpenAI TTS', description: 'Text-to-speech model from OpenAI' },
    { id: 'elevenlabs', name: 'ElevenLabs', description: 'High-quality voice synthesis' }
  ];

  return (
    <Stack spacing={2.5}>
      <TextField
        fullWidth
        label="Text to speech"
        placeholder="Enter the text you want to convert to speech..."
        multiline
        rows={4}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={loading}
        variant="outlined"
        sx={{ mb: 1 }}
      />
      
      <Divider sx={{ opacity: 0.6, my: 1 }} />
      
      <FormControl fullWidth variant="outlined" size="small" sx={{ mt: 1 }}>
        <InputLabel>Voice</InputLabel>
        <Select
          value={voice}
          label="Voice"
          onChange={(e) => setVoice(e.target.value)}
          disabled={loading}
        >
          {voices.map((v) => (
            <MenuItem key={v.id} value={v.id}>
              <Tooltip title={v.description || ''} arrow placement="right">
                <span>{v.name}</span>
              </Tooltip>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <FormControl fullWidth variant="outlined" size="small" sx={{ mt: 1 }}>
        <InputLabel>Model</InputLabel>
        <Select
          value={model}
          label="Model"
          onChange={(e) => setModel(e.target.value)}
          disabled={loading}
        >
          {models.map((m) => (
            <MenuItem key={m.id} value={m.id}>
              <Tooltip title={m.description || ''} arrow placement="right">
                <span>{m.name}</span>
              </Tooltip>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <Button
        variant="contained"
        color="primary"
        onClick={handleGenerate}
        disabled={!prompt || loading}
        fullWidth
        sx={{ 
          mt: 3,
          py: 1.2,
          color: '#333333', // Dark grey text for better contrast
          fontWeight: 'bold',
          bgcolor: theme => theme.palette.primary.main,
          '&:hover': {
            bgcolor: theme => theme.palette.primary.dark,
            color: '#333333'
          },
          '& .MuiButton-label': {
            color: '#333333'
          }
        }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate Audio'}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Stack>
  );
};

export const AudioGenerator: React.FC = () => {
  // Get context for parameter sharing
  const { setAudioParams, setActiveGenerator } = useContext(PolynateContext);

  // Component state
  const [prompt, setPrompt] = useState<string>('');
  const [voice, setVoice] = useState<string>('alloy');
  const [model, setModel] = useState<string>('openai-audio');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');

  const handleGenerate = useCallback(async () => {
    if (!prompt) return;
    try {
      setLoading(true);
      setError(null);
      const url = await pollinationsService.generateAudio({
        prompt,
        voice,
        model
      });
      setAudioUrl(url);
    } catch (err) {
      console.error('Error generating audio:', err);
      setError(err instanceof Error ? err.message : 'An error occurred generating the audio');
      setAudioUrl('');
    } finally {
      setLoading(false);
    }
  }, [prompt, voice, model]);

  // Create and update params for sidebar
  useEffect(() => {
    const audioParamsElement = (
      <AudioParams
        prompt={prompt}
        setPrompt={setPrompt}
        voice={voice}
        setVoice={setVoice}
        model={model}
        setModel={setModel}
        loading={loading}
        handleGenerate={handleGenerate}
        error={error}
      />
    );
    
    // Set params in the sidebar context
    if (setAudioParams) {
      setAudioParams(audioParamsElement);
    }
  }, [prompt, voice, model, loading, error, handleGenerate, setAudioParams, setPrompt, setVoice, setModel]);

  // Set active generator on mount
  useEffect(() => {
    if (setActiveGenerator) {
      setActiveGenerator('audio' as GeneratorType);
    }
  }, [setActiveGenerator]);

  return (
    <Box sx={{ 
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      pt: 4,
      pb: 8,
      minHeight: '100vh'
    }}>
      <Box sx={{
        width: 'calc(100% - 220px)', // Account for the sidebar width minus overlap
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        mx: 'auto',
        position: 'relative'
      }}>
        {/* Audio player display */}
        {!audioUrl && !loading && (
          <Box 
            sx={{ 
              width: '100%',
              maxWidth: '800px',
              height: '200px',
              display: 'flex', 
              position: 'relative',
              borderRadius: '16px',
              background: alpha('#121212', 0.3),
              backdropFilter: 'blur(8px)',
              border: '1px dashed rgba(255, 255, 255, 0.15)',
              ml: { xs: 0, md: -120 }, // Extend into sidebar area per user preference
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
              left: '50%',
              transform: 'translateX(calc(-50% + 60px))' // Center in viewport while respecting sidebar extension
            }}
          >
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              inset: 0,
              p: 6,
              textAlign: 'center'
            }}>
              <Typography variant="h6" color="text.secondary" sx={{ fontSize: '1.25rem', width: '100%', maxWidth: '80%' }}>
                Enter a prompt and click Generate to create audio
              </Typography>
            </Box>
          </Box>
        )}
        
        {loading && (
          <Box 
            sx={{ 
              width: '100%',
              maxWidth: '800px',
              height: '200px',
              display: 'flex',
              position: 'relative',
              borderRadius: '16px',
              background: alpha('#121212', 0.3),
              backdropFilter: 'blur(8px)',
              border: '1px dashed rgba(255, 255, 255, 0.15)',
              ml: { xs: 0, md: -120 },
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
              left: '50%',
              transform: 'translateX(calc(-50% + 60px))'
            }}
          >
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              inset: 0,
              p: 6,
              textAlign: 'center'
            }}>
              <CircularProgress size={60} sx={{ mb: 3 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Generating your audio
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This may take a few moments...
              </Typography>
            </Box>
          </Box>
        )}
        
        {audioUrl && (
          <Fade in={!!audioUrl} timeout={800}>
            <Card 
              elevation={0} 
              sx={{ 
                borderRadius: '16px',
                overflow: 'visible',
                transition: 'all 0.3s ease',
                position: 'relative',
                ml: { xs: 0, md: -120 },
                width: '100%',
                maxWidth: '800px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                boxSizing: 'border-box',
                mb: 2,
                left: '50%',
                transform: 'translateX(calc(-50% + 60px))'
              }}
            >
              <CardContent sx={{ width: '100%', p: 4 }}>
                <Stack spacing={2} sx={{ width: '100%' }}>
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <Chip 
                      icon={<MusicNoteOutlined />}
                      label={model === 'openai-audio' ? 'OpenAI TTS' : 'ElevenLabs'} 
                      size="small" 
                      variant="outlined"
                    />
                    <Chip 
                      icon={<RecordVoiceOverOutlined />}
                      label={voice.charAt(0).toUpperCase() + voice.slice(1)} 
                      size="small" 
                      variant="outlined"
                    />
                  </Stack>
                  
                  <Box sx={{ 
                    p: 3, 
                    borderRadius: '12px', 
                    backgroundColor: alpha('#000000', 0.2),
                    backdropFilter: 'blur(10px)', 
                    width: '100%'
                  }}>
                    <audio controls src={audioUrl} style={{ width: '100%' }}>
                      Your browser does not support the audio element.
                    </audio>
                  </Box>
                  
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
                    {prompt}
                  </Typography>
                  
                  <Button
                    variant="outlined"
                    startIcon={<DownloadOutlined />}
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = audioUrl;
                      a.download = `polynate-audio-${Date.now()}.mp3`;
                      a.click();
                    }}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    Download Audio
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Fade>
        )}
      </Box>
    </Box>
  );
};

export default AudioGenerator;
