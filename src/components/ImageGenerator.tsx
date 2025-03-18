import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
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
  Divider,
  FormControlLabel,
  Switch,
  Tooltip,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardMedia,
  CardContent,
  alpha,
  Chip,
  Fade,
  IconButton
} from '@mui/material';
import {
  AspectRatioOutlined,
  TagOutlined,
  Replay as ReplayIcon,
  ShuffleOutlined,
  LockOutlined,
  LockOpenOutlined
} from '@mui/icons-material';
import { pollinationsService } from '../services/pollinationsService';
import { PolynateContext } from '../App';
import { ImageGenParams } from '../types';

interface Model {
  id: string;
  name: string;
  description?: string;
}

// Export for the App context
export const ImageParams: React.FC<{
  prompt: string;
  setPrompt: (prompt: string) => void;
  enhancedPrompt: string;
  width: number;
  setWidth: (width: number) => void;
  height: number;
  setHeight: (height: number) => void;
  model: string;
  setModel: (model: string) => void;
  models: Model[];
  enhance: boolean;
  setEnhance: (enhance: boolean) => void;
  noLogo: boolean;
  setNoLogo: (noLogo: boolean) => void;
  safe: boolean;
  setSafe: (safe: boolean) => void;
  privateMode: boolean;
  setPrivateMode: (privateMode: boolean) => void;
  seedValue: string;
  setSeedValue: (seedValue: string) => void;
  randomSeed: boolean;
  setRandomSeed: (randomSeed: boolean) => void;
  loading: boolean;
  handleGenerate: () => void;
  error: string | null;
}> = (props) => {
  const {
    prompt, setPrompt, enhancedPrompt, width, setWidth, height, setHeight,
    model, setModel, models, enhance, setEnhance, noLogo, setNoLogo,
    safe, setSafe, privateMode, setPrivateMode, seedValue, setSeedValue,
    randomSeed, setRandomSeed, loading, handleGenerate, error
  } = props;

  return (
    <Stack spacing={2.5}>
      <TextField
        fullWidth
        label="Image prompt"
        placeholder="Describe the image you want to generate..."
        multiline
        rows={4}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={loading}
        variant="outlined"
        sx={{ mb: 1 }}
      />
      
      <Divider sx={{ opacity: 0.6 }} />
      
      <FormControl fullWidth variant="outlined" size="small">
        <InputLabel>Model</InputLabel>
        <Select
          value={model}
          label="Model"
          onChange={(e) => {
            console.log('Selected model changed to:', e.target.value);
            setModel(e.target.value);
          }}
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
      
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AspectRatioOutlined fontSize="small" />
          Dimensions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Width"
              type="number"
              value={width}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value > 0 && value <= 2048) {
                  setWidth(value);
                }
              }}
              disabled={loading}
              size="small"
              InputProps={{
                inputProps: { min: 128, max: 2048 }
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Height"
              type="number"
              value={height}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value > 0 && value <= 2048) {
                  setHeight(value);
                }
              }}
              disabled={loading}
              size="small"
              InputProps={{
                inputProps: { min: 128, max: 2048 }
              }}
            />
          </Grid>
        </Grid>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          Values between 128-2048px
        </Typography>
      </Box>
      
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TagOutlined fontSize="small" />
            Seed
          </Box>
          <IconButton 
            size="small" 
            onClick={() => {
              if (!randomSeed) {
                const newSeed = Math.floor(Math.random() * 1000000).toString();
                setSeedValue(newSeed);
              }
            }}
            disabled={randomSeed || loading}
            sx={{ opacity: randomSeed ? 0.5 : 1 }}
          >
            <ReplayIcon fontSize="small" />
          </IconButton>
        </Typography>
        
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            fullWidth
            type="number"
            value={seedValue}
            onChange={(e) => setSeedValue(e.target.value)}
            disabled={loading || randomSeed}
            size="small"
            placeholder="Enter seed value"
            InputProps={{
              startAdornment: randomSeed ? <LockOutlined sx={{ color: 'text.disabled', mr: 1, fontSize: 16 }} /> : <LockOpenOutlined sx={{ color: 'text.secondary', mr: 1, fontSize: 16 }} />
            }}
          />
          <Tooltip title={randomSeed ? "Using random seed for each generation" : "Using fixed seed value"}>
            <FormControlLabel
              control={
                <Switch 
                  size="small" 
                  checked={randomSeed} 
                  onChange={(e) => {
                    setRandomSeed(e.target.checked);
                    // Clear seed value when enabling random seed
                    if (e.target.checked) {
                      setSeedValue('');
                    }
                  }} 
                />
              }
              label="Random"
              sx={{ m: 0 }}
            />
          </Tooltip>
        </Stack>
      </Box>
      
      <Divider sx={{ opacity: 0.6 }} />
      
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Options
        </Typography>
        <Stack spacing={1}>
          <FormControlLabel
            control={
              <Switch 
                size="small" 
                checked={enhance} 
                onChange={(e) => setEnhance(e.target.checked)} 
              />
            }
            label="Enhance Prompt"
          />
          <FormControlLabel
            control={
              <Switch 
                size="small" 
                checked={noLogo} 
                onChange={(e) => setNoLogo(e.target.checked)} 
              />
            }
            label="No Logo"
          />
          <FormControlLabel
            control={
              <Switch 
                size="small" 
                checked={safe} 
                onChange={(e) => setSafe(e.target.checked)} 
              />
            }
            label="Safe Mode"
          />
          <FormControlLabel
            control={
              <Switch 
                size="small" 
                checked={privateMode} 
                onChange={(e) => setPrivateMode(e.target.checked)} 
              />
            }
            label="Private"
          />
        </Stack>
      </Box>
      
      <Button
        variant="contained"
        color="primary"
        onClick={handleGenerate}
        disabled={!prompt || loading}
        fullWidth
        sx={{ 
          mt: 1,
          color: '#000000', // Black text for better contrast
          fontWeight: 'bold'
        }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate Image'}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Stack>
  );
};

export const ImageGenerator: React.FC = () => {
  // Get context for parameter sharing
  const { setImageParams, setActiveGenerator } = useContext(PolynateContext);

  // Component state
  const [prompt, setPrompt] = useState<string>('');
  const [enhancedPrompt, setEnhancedPrompt] = useState<string>('');
  const [width, setWidth] = useState<number>(1024);
  const [height, setHeight] = useState<number>(1024);
  const [model, setModel] = useState<string>('flux');
  const [models, setModels] = useState<Model[]>([]);
  const [enhance, setEnhance] = useState<boolean>(true);
  const [noLogo, setNoLogo] = useState<boolean>(true);
  const [safe, setSafe] = useState<boolean>(false);
  const [privateMode, setPrivateMode] = useState<boolean>(true);
  const [seedValue, setSeedValue] = useState<string>('');
  const [randomSeed, setRandomSeed] = useState<boolean>(true); // Random seed enabled by default
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');

  // ONLY fetch from API - no fallbacks
  useEffect(() => {
    // Start with empty models array
    setModels([]);
    
    const fetchImageModels = async () => {
      try {
        console.log('Fetching image models from API...');
        
        // Try direct API call with CORS headers
        const response = await axios.get('https://image.pollinations.ai/models', {
          headers: {
            'Accept': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
        
        console.log('Direct image API response:', response.data);
        
        // Process the response data into models
        let apiModels: Model[] = [];
        
        if (response.data) {
          if (Array.isArray(response.data)) {
            // Response is array format
            apiModels = response.data.map((model: any) => ({
              id: model.id || model.name,
              name: model.name || model.id,
              description: model.description || ''
            }));
          } else if (typeof response.data === 'object') {
            // Response is object format (key-value pairs)
            apiModels = Object.entries(response.data).map(([id, details]: [string, any]) => {
              const name = typeof details === 'object' && details.name ? details.name : id;
              const description = typeof details === 'object' && details.description ? details.description : '';
              return { id, name, description };
            });
          }
        }
        
        console.log('Setting image models from API:', apiModels);
        setModels(apiModels);
      } catch (firstError) {
        console.error('Direct API call failed:', firstError);
        
        // Try fallback to pollinationsService as second attempt
        try {
          console.log('Trying fallback via pollinationsService...');
          const serviceModels = await pollinationsService.getAvailableModels();
          console.log('pollinationsService response:', serviceModels);
          
          let imageModels: Model[] = [];
          
          if (serviceModels) {
            if (serviceModels.imageModels) {
              imageModels = serviceModels.imageModels;
            } else if (Array.isArray(serviceModels)) {
              imageModels = serviceModels
                .filter((model: any) => model.type === 'image' || model.category === 'image')
                .map((model: any) => ({
                  id: model.id || model.name,
                  name: model.name || model.id,
                  description: model.description || ''
                }));
            }
          }
          
          console.log('Setting image models from service:', imageModels);
          setModels(imageModels);
        } catch (secondError) {
          console.error('All attempts to fetch image models failed');
          setModels([]);
        }
      }
    };
    
    fetchImageModels();
  }, []);

  const handlePromptEnhancement = useCallback(async () => {
    if (!prompt) return;
    try {
      setLoading(true);
      const response = await pollinationsService.generateText({
        prompt: `Enhance this image prompt by adding more details and artistic direction: ${prompt}`,
        model: 'mistral'
      });
      const enhancedText = typeof response === 'string' 
        ? response 
        : response.choices?.[0]?.message?.content;
      setEnhancedPrompt(enhancedText || '');
    } catch (err) {
      console.error('Error enhancing prompt:', err);
    } finally {
      setLoading(false);
    }
  }, [prompt]);

  // Removed automatic prompt enhancement - will only enhance when generating image
  // Enhancement will be handled directly in the handleGenerate function

  const handleGenerate = useCallback(async () => {
    if (!prompt) return;
    try {
      console.log('Starting image generation with prompt:', prompt);
      setLoading(true);
      setError(null);
      
      let finalPrompt = prompt;
      
      // Apply prompt enhancement if the enhance toggle is on - ONLY when generating
      if (enhance && prompt.trim().length > 3) {
        try {
          console.log('Enhancing prompt before generation...');
          const response = await pollinationsService.generateText({
            prompt: `Enhance this image prompt by adding more details and artistic direction: ${prompt}`,
            model: 'mistral'
          });
          
          const enhancedText = typeof response === 'string' 
            ? response 
            : response.choices?.[0]?.message?.content;
          
          if (enhancedText) {
            console.log('Enhanced prompt:', enhancedText);
            finalPrompt = enhancedText;
            setEnhancedPrompt(enhancedText); // Update the UI to show the enhanced prompt
          }
        } catch (enhanceErr) {
          console.error('Error enhancing prompt:', enhanceErr);
          // Continue with original prompt if enhancement fails
        }
      }
      
      // Generate a random seed if random seed toggle is enabled
      let currentSeed = seedValue;
      if (randomSeed) {
        currentSeed = Math.floor(Math.random() * 1000000).toString();
        console.log('Generated random seed:', currentSeed);
      }
      
      // Log current state for debugging
      console.log('Generating image with model:', model);
      console.log('Using seed:', currentSeed || 'None (random)');
      console.log('Using final prompt:', finalPrompt);
      
      // Prepare params for image generation
      const params: ImageGenParams = {
        prompt: finalPrompt,
        width,
        height,
        model,
        enhance: false, // We already enhanced the prompt here if needed
        nologo: noLogo,
        safe,
        private: privateMode
      };
      
      // Add seed if one is available (random or fixed)
      if (currentSeed) {
        params.seed = Number(currentSeed);
      }
      
      // Log the full URL that will be generated
      const baseUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}`;
      const queryParams = new URLSearchParams({
        width: width.toString(),
        height: height.toString(),
        model: model,
        ...(currentSeed && { seed: currentSeed }),
        ...(noLogo && { nologo: 'true' }),
        ...(privateMode && { private: 'true' }),
        ...(safe && { safe: 'true' })
      });
      const fullUrl = `${baseUrl}?${queryParams.toString()}`;
      console.log('Full image URL being generated:', fullUrl);
      
      try {
        // Direct approach for testing
        const directUrl = fullUrl;
        console.log('Setting direct URL:', directUrl);
        
        // Also try the service approach
        const serviceUrl = await pollinationsService.generateImage({
          ...params,
          prompt: finalPrompt // Ensure we're using the enhanced prompt if available
        });
        console.log('Service generated URL:', serviceUrl);
        
        // Use the service URL if available, otherwise fallback to direct URL
        const finalUrl = serviceUrl || directUrl;
        console.log('Final image URL being set:', finalUrl);
        
        // Set the image URL in state
        setImageUrl(finalUrl);
      } catch (urlError) {
        console.error('Error generating image URL:', urlError);
        throw urlError;
      }
      
      // Update the UI with the seed we used (if it was random)
      if (randomSeed) {
        setSeedValue(currentSeed);
      }
    } catch (err) {
      console.error('Image generation error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred generating the image');
      setImageUrl(''); // Clear any partial URL
    } finally {
      setLoading(false);
    }
  }, [prompt, width, height, model, enhance, noLogo, safe, privateMode, seedValue, randomSeed]);

  // Create and update params for sidebar - with memoized handleGenerate to prevent unnecessary regeneration
  const memoizedHandleGenerate = useCallback(handleGenerate, [handleGenerate]);
  
  useEffect(() => {
    const imageParamsElement = (
      <ImageParams
        prompt={prompt}
        setPrompt={setPrompt}
        enhancedPrompt={enhancedPrompt}
        width={width}
        setWidth={setWidth}
        height={height}
        setHeight={setHeight}
        model={model}
        setModel={(value) => {
          console.log('Selected model changed to:', value);
          setModel(value);
          // Clear imageUrl to force re-generation with new model, but don't automatically generate
          setImageUrl('');
        }}
        models={models}
        enhance={enhance}
        setEnhance={setEnhance}
        noLogo={noLogo}
        setNoLogo={setNoLogo}
        safe={safe}
        setSafe={setSafe}
        privateMode={privateMode}
        setPrivateMode={setPrivateMode}
        seedValue={seedValue}
        setSeedValue={setSeedValue}
        randomSeed={randomSeed}
        setRandomSeed={setRandomSeed}
        loading={loading}
        handleGenerate={memoizedHandleGenerate}
        error={error}
      />
    );
    
    // Set params in the sidebar context
    if (setImageParams) {
      console.log('Setting image parameters in sidebar context');
      setImageParams(imageParamsElement);
    } else {
      console.error('setImageParams is not available in context');
    }
  }, [prompt, enhancedPrompt, width, height, model, models, enhance, noLogo, safe, privateMode, seedValue, randomSeed, loading, error, memoizedHandleGenerate, setImageParams]);

  // Set active generator on mount - only once
  useEffect(() => {
    if (setActiveGenerator) {
      console.log('Setting active generator to image');
      setActiveGenerator('image');
    }
  }, [setActiveGenerator]);

  return (
    <Box sx={{ width: '100%', maxWidth: '1200px', mx: 'auto' }}>
      <Box sx={{ minHeight: 300, display: 'flex', flexDirection: 'column', gap: 3, p: 3 }}>
            {/* Generated image display */}
            {!imageUrl && !loading && (
              <Box 
                sx={{ 
                  height: '70vh', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  borderRadius: 3,
                  background: alpha('#121212', 0.3),
                  backdropFilter: 'blur(8px)',
                  border: '1px dashed rgba(255, 255, 255, 0.15)'
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  Enter a prompt and click Generate to create an image
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
                  background: alpha('#121212', 0.3),
                  backdropFilter: 'blur(8px)',
                  border: '1px dashed rgba(255, 255, 255, 0.15)'
                }}
              >
                <CircularProgress size={60} sx={{ mb: 3 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Generating your image
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This may take a few moments...
                </Typography>
              </Box>
            )}
            
            {imageUrl && (
              <Fade in={!!imageUrl} timeout={800}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    borderRadius: 3,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                >
                  {/* Add overlay with spinner when loading */}
                  {loading && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                        backdropFilter: 'blur(5px)',
                        borderRadius: 3
                      }}
                    >
                      <CircularProgress size={60} sx={{ mb: 3 }} />
                      <Typography variant="h6" color="white" gutterBottom>
                        Regenerating image
                      </Typography>
                    </Box>
                  )}
                  <CardMedia
                    component="img"
                    image={imageUrl}
                    alt="Generated image"
                    sx={{
                      width: '100%',
                      maxHeight: '75vh',
                      objectFit: 'contain',
                      backgroundColor: 'rgba(0,0,0,0.2)',
                    }}
                  />
                  <CardContent sx={{ py: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Chip 
                          label={`${width}×${height}`} 
                          size="small" 
                          variant="outlined" 
                          sx={{ borderRadius: 1 }}
                        />
                        <Chip 
                          label={models.find(m => m.id === model)?.name || model} 
                          size="small" 
                          variant="outlined"
                          sx={{ borderRadius: 1 }}
                        />
                        {seedValue && (
                          <Chip 
                            label={`Seed: ${seedValue}`} 
                            size="small" 
                            variant="outlined"
                            sx={{ borderRadius: 1 }}
                          />
                        )}
                      </Stack>
                      
                      <Button 
                        size="small" 
                        variant="outlined" 
                        onClick={handleGenerate}
                        startIcon={loading ? <CircularProgress size={16} /> : <ShuffleOutlined />}
                        disabled={loading}
                      >
                        {loading ? 'Generating...' : 'Regenerate'}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Fade>
            )}
            
            {/* Enhanced prompt display */}
            {enhance && enhancedPrompt && (
              <Fade in={!!enhancedPrompt} timeout={500}>
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                    Enhanced Prompt
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', opacity: 0.87 }}>
                    {enhancedPrompt}
                  </Typography>
                </Paper>
              </Fade>
            )}
      </Box>
    </Box>
  );
};

export default ImageGenerator;
