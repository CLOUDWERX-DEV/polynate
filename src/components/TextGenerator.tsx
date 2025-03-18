import React, { useState, useEffect, useCallback, useContext } from 'react';
import { 
  Box, 
  TextField, 
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
  CircularProgress,
  Card,
  CardContent,
  Alert,
  Fade,
  Chip
} from '@mui/material';
import {
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
import { PolynateContext, GeneratorType } from '../App';

interface Model {
  id: string;
  name: string;
  description?: string;
}

// Export for the App context
export const TextParams: React.FC<{
  prompt: string;
  setPrompt: (prompt: string) => void;
  systemPrompt: string;
  setSystemPrompt: (systemPrompt: string) => void;
  model: string;
  setModel: (model: string) => void;
  models: Model[];
  jsonMode: boolean;
  setJsonMode: (jsonMode: boolean) => void;
  seed: number | '';
  setSeed: (seed: number | '') => void;
  private_: boolean;
  setPrivate: (private_: boolean) => void;
  loading: boolean;
  handleGenerate: () => void;
  error: string | null;
}> = (props) => {
  const {
    prompt, setPrompt, systemPrompt, setSystemPrompt, model, setModel, models,
    jsonMode, setJsonMode, seed, setSeed, private_, setPrivate,
    loading, handleGenerate, error
  } = props;
  
  return (
    <Stack spacing={2.5}>
      <FormControl fullWidth variant="outlined" size="small">
        <InputLabel>Model</InputLabel>
        <Select
          value={model}
          label="Model"
          onChange={(e) => setModel(e.target.value)}
          disabled={loading}
          sx={{ borderRadius: 1.5 }}
        >
          {models && models.length > 0 ? (
            models.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                <Tooltip title={m.description || ''} arrow placement="right">
                  <span>{m.name}</span>
                </Tooltip>
              </MenuItem>
            ))
          ) : (
            <MenuItem value="mistral">Mistral</MenuItem>
          )}
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
        sx={{ mt: 1, borderRadius: 1.5, py: 1.2, fontWeight: 'bold' }}
      >
        {loading ? 'Generating...' : 'Generate Text'}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5 }}>
          {error}
        </Alert>
      )}
    </Stack>
  );
};

export const TextGenerator: React.FC = () => {
  // Get context for parameter sharing
  const { setTextParams, setActiveGenerator } = useContext(PolynateContext);

  // Component state
  const [prompt, setPrompt] = useState<string>('');
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const [model, setModel] = useState<string>('mistral');
  const [models, setModels] = useState<Model[]>([
    { id: 'gpt-4', name: 'GPT-4', description: 'High-capability language model' },
    { id: 'claude-3', name: 'Claude 3', description: 'Advanced reasoning capabilities' },
    { id: 'mistral', name: 'Mistral', description: 'Fast and efficient language model' },
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedText, setGeneratedText] = useState<string>('');
  const [jsonMode, setJsonMode] = useState<boolean>(false);
  const [seed, setSeed] = useState<number | ''>('');
  const [private_, setPrivate] = useState<boolean>(true);

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

  const handleGenerate = useCallback(async () => {
    if (!prompt) return;
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
      setGeneratedText('');
    } finally {
      setLoading(false);
    }
  }, [prompt, systemPrompt, model, seed, private_, jsonMode]);

  // Create and update params for sidebar
  useEffect(() => {
    const textParamsElement = (
      <TextParams
        prompt={prompt}
        setPrompt={setPrompt}
        systemPrompt={systemPrompt}
        setSystemPrompt={setSystemPrompt}
        model={model}
        setModel={setModel}
        models={models}
        jsonMode={jsonMode}
        setJsonMode={setJsonMode}
        seed={seed}
        setSeed={setSeed}
        private_={private_}
        setPrivate={setPrivate}
        loading={loading}
        handleGenerate={handleGenerate}
        error={error}
      />
    );
    
    // Set params in the sidebar context
    if (setTextParams) {
      setTextParams(textParamsElement);
    }
  }, [prompt, systemPrompt, model, models, jsonMode, seed, private_, loading, error, handleGenerate, setTextParams, setPrompt, setSystemPrompt, setModel, setJsonMode, setSeed, setPrivate]);

  // Set active generator on mount
  useEffect(() => {
    if (setActiveGenerator) {
      setActiveGenerator('text' as GeneratorType);
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
        {/* Generated text display */}
        {!generatedText && !loading && (
          <Box 
            sx={{ 
              width: '100%',
              maxWidth: '1000px',
              minHeight: '500px',
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
                Enter a prompt and click Generate to create text
              </Typography>
            </Box>
          </Box>
        )}
        
        {loading && (
          <Box 
            sx={{ 
              width: '100%',
              maxWidth: '1000px',
              minHeight: '500px',
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
                Generating your text
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This may take a few moments...
              </Typography>
            </Box>
          </Box>
        )}
        
        {generatedText && (
          <Fade in={!!generatedText} timeout={800}>
            <Card 
              elevation={0} 
              sx={{ 
                borderRadius: '16px',
                overflow: 'visible',
                transition: 'all 0.3s ease',
                position: 'relative',
                ml: { xs: 0, md: -120 },
                width: '100%',
                maxWidth: '1000px',
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
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }} flexWrap="wrap">
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
                        icon={<TagOutlined fontSize="small" />}
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
                    {systemPrompt && (
                      <Chip
                        label="System Prompt" 
                        size="small" 
                        variant="outlined"
                        sx={{ borderRadius: 1 }}
                        icon={<InfoOutlined fontSize="small" />}
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
                      lineHeight: 1.5
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
                </Stack>
              </CardContent>
            </Card>
          </Fade>
        )}
      </Box>
    </Box>
  );
};

export default TextGenerator;
