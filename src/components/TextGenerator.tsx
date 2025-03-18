import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Paper, 
  Typography, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Stack, 
  Button, 
  Switch, 
  FormControlLabel, 
  Divider, 
  Tooltip, 
  Grid,
  alpha,
  IconButton,
  CircularProgress,
  Card,
  CardContent,
  Alert,
  Fade,
  Chip
} from '@mui/material';
import {
  TextFieldsOutlined,
  SettingsOutlined,
  ShuffleOutlined,
  InfoOutlined,
  TagOutlined,
  FormatQuoteOutlined,
  CodeOutlined,
  LockOutlined,
  PlayArrowOutlined
} from '@mui/icons-material';
import { pollinationsService } from '../services/pollinationsService';

interface Model {
  id: string;
  name: string;
  description?: string;
}

export const TextGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [model, setModel] = useState('mistral');
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedText, setGeneratedText] = useState<string>('');
  const [jsonMode, setJsonMode] = useState(false);
  const [seed, setSeed] = useState<number | ''>('');
  const [private_, setPrivate] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await pollinationsService.getAvailableModels();
        console.log('Text models response:', response);
        
        // Check different possible response formats
        let textModels = [];
        if (response.textModels) {
          console.log('Found textModels in response');
          textModels = response.textModels;
        } else if (Array.isArray(response)) {
          console.log('Response is an array, filtering for text models');
          textModels = response.filter((model: any) => 
            model.type === 'text' || model.category === 'text' || 
            ['gpt-4', 'claude', 'mistral', 'llama'].some((name) => model.id?.toLowerCase().includes(name)));
        } else if (typeof response === 'object' && response !== null && 'models' in response) {
          console.log('Found models property in response');
          const responseModels = (response as any).models;
          textModels = Array.isArray(responseModels) ? responseModels.filter((model: any) => 
            model.type === 'text' || model.category === 'text' || 
            ['gpt-4', 'claude', 'mistral', 'llama'].some((name) => model.id?.toLowerCase().includes(name))) : [];
        }
        
        // If no models found, add defaults
        if (textModels.length === 0) {
          console.log('No text models found, using defaults');
          textModels = [
            { id: 'gpt-4', name: 'GPT-4', description: 'High-capability language model' },
            { id: 'claude-3', name: 'Claude 3', description: 'Advanced reasoning capabilities' },
            { id: 'mistral', name: 'Mistral', description: 'Fast and efficient language model' },
          ];
        }
        
        console.log('Final text models:', textModels);
        setModels(textModels);
        
        // Set default model if current selection is empty
        if (!model && textModels.length > 0) {
          setModel(textModels[0].id);
        }
      } catch (err) {
        console.error('Error fetching models:', err);
        // Set default models on error
        const defaultModels = [
          { id: 'gpt-4', name: 'GPT-4', description: 'High-capability language model' },
          { id: 'claude-3', name: 'Claude 3', description: 'Advanced reasoning capabilities' },
          { id: 'mistral', name: 'Mistral', description: 'Fast and efficient language model' },
        ];
        setModels(defaultModels);
        if (!model) {
          setModel(defaultModels[0].id);
        }
      }
    };
    fetchModels();
  }, [model]);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await pollinationsService.generateText({
        prompt,
        system: systemPrompt,
        model,
        seed: seed === '' ? undefined : Number(seed),
        private: private_,
        json: jsonMode
      });
      const content = jsonMode
        ? JSON.stringify(response, null, 2)
        : (typeof response === 'string' ? response : response.choices?.[0]?.message?.content);
      setGeneratedText(content || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Left sidebar for parameters */}
        <Grid item xs={12} md={4} lg={3}>
          <Paper 
            elevation={0}
            sx={{ 
              height: '100%',
              p: 3,
              borderRadius: 3,
              background: theme => alpha(theme.palette.background.paper, 0.7),
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              position: 'sticky',
              top: 16
            }}
          >
            <Stack spacing={2.5}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextFieldsOutlined fontSize="small" />
                Text Parameters
              </Typography>
              
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel>Model</InputLabel>
                <Select
                  value={model}
                  label="Model"
                  onChange={(e) => setModel(e.target.value)}
                  disabled={loading}
                  sx={{ borderRadius: 1.5 }}
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
              
              <Divider sx={{ opacity: 0.6 }} />
              
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FormatQuoteOutlined fontSize="small" />
                  Prompts
                </Typography>
                
                <TextField
                  fullWidth
                  label="System Instructions"
                  placeholder="Optional context or instructions for the AI..."
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  multiline
                  rows={3}
                  variant="outlined"
                  disabled={loading}
                  size="small"
                  sx={{ mb: 2, borderRadius: 1.5 }}
                />

                <TextField
                  fullWidth
                  label="Your Prompt"
                  placeholder="What would you like the AI to generate?"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  multiline
                  rows={5}
                  variant="outlined"
                  disabled={loading}
                  size="small"
                  sx={{ borderRadius: 1.5 }}
                />
              </Box>
              
              <Divider sx={{ opacity: 0.6 }} />
              
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SettingsOutlined fontSize="small" />
                  Options
                </Typography>
                
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Seed"
                      placeholder="Optional"
                      type="number"
                      value={seed}
                      onChange={(e) => setSeed(e.target.value === '' ? '' : Number(e.target.value))}
                      disabled={loading}
                      size="small"
                      sx={{ borderRadius: 1.5 }}
                      InputProps={{
                        startAdornment: <TagOutlined sx={{ color: 'text.secondary', mr: 1, fontSize: 16 }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack>
                      <FormControlLabel
                        control={
                          <Switch 
                            size="small" 
                            checked={jsonMode} 
                            onChange={(e) => setJsonMode(e.target.checked)}
                            disabled={loading}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CodeOutlined fontSize="small" />
                            <Typography variant="body2">JSON Mode</Typography>
                          </Box>
                        }
                      />
                      <FormControlLabel
                        control={
                          <Switch 
                            size="small" 
                            checked={private_} 
                            onChange={(e) => setPrivate(e.target.checked)}
                            disabled={loading}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LockOutlined fontSize="small" />
                            <Typography variant="body2">Private</Typography>
                          </Box>
                        }
                      />
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
              
              <Button
                variant="contained"
                onClick={handleGenerate}
                disabled={!prompt || loading}
                fullWidth
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayArrowOutlined />}
                sx={{ mt: 1, borderRadius: 1.5 }}
              >
                {loading ? 'Generating...' : 'Generate Text'}
              </Button>

              {error && (
                <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5 }}>
                  {error}
                </Alert>
              )}
            </Stack>
          </Paper>
        </Grid>
        
        {/* Right side for generated content */}
        <Grid item xs={12} md={8} lg={9}>
          <Box sx={{ minHeight: 300, display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
            {/* Generated text display */}
            {!generatedText && !loading && (
              <Box 
                sx={{ 
                  height: '70vh', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  borderRadius: 3,
                  background: theme => alpha(theme.palette.background.paper, 0.3),
                  backdropFilter: 'blur(8px)',
                  border: '1px dashed rgba(255, 255, 255, 0.15)'
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  Enter a prompt and click Generate to create text
                </Typography>
              </Box>
            )}
            
            {loading && (
              <Box 
                sx={{ 
                  height: '70vh', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  borderRadius: 3,
                  background: theme => alpha(theme.palette.background.paper, 0.3),
                  backdropFilter: 'blur(8px)',
                  border: '1px dashed rgba(255, 255, 255, 0.15)'
                }}
              >
                <CircularProgress size={60} sx={{ mb: 3 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Generating your text
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This may take a few moments...
                </Typography>
              </Box>
            )}
            
            {generatedText && (
              <Fade in={!!generatedText} timeout={500}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    borderRadius: 3,
                    background: theme => alpha(theme.palette.background.paper, 0.7),
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    overflow: 'hidden',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <CardContent sx={{ p: 3, flex: 1, overflow: 'auto' }}>
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
                      <Chip 
                        label={models.find(m => m.id === model)?.name || model} 
                        size="small" 
                        variant="outlined"
                        sx={{ borderRadius: 1 }}
                      />
                      {seed !== '' && (
                        <Chip 
                          label={`Seed: ${seed}`} 
                          size="small" 
                          variant="outlined"
                          sx={{ borderRadius: 1 }}
                        />
                      )}
                      {jsonMode && (
                        <Chip 
                          label="JSON Mode" 
                          size="small" 
                          variant="outlined"
                          sx={{ borderRadius: 1 }}
                          icon={<CodeOutlined fontSize="small" />}
                        />
                      )}
                    </Stack>
                    
                    <Typography
                      variant="body1"
                      component="pre"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        fontFamily: jsonMode ? '"SF Mono", "Roboto Mono", monospace' : 'inherit',
                        backgroundColor: jsonMode ? alpha('#000000', 0.2) : 'transparent',
                        padding: jsonMode ? 2 : 0,
                        borderRadius: 2,
                        overflowY: 'auto',
                        maxHeight: '60vh'
                      }}
                    >
                      {generatedText}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ShuffleOutlined />}
                        onClick={handleGenerate}
                        disabled={loading}
                        sx={{ borderRadius: 1.5 }}
                      >
                        Regenerate
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
