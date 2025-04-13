import React, { useState, useEffect, useCallback, useContext, useRef, useLayoutEffect } from 'react';
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
  IconButton,
  Modal
} from '@mui/material';
import {
  AspectRatioOutlined,
  TagOutlined,
  Replay as ReplayIcon,
  ShuffleOutlined,
  LockOutlined,
  LockOpenOutlined,
  Download as DownloadIcon,
  Close as CloseIcon,
  ZoomIn as ZoomInIcon
} from '@mui/icons-material';
import { pollinationsService } from '../services/pollinationsService';
import { PolynateContext, GeneratorType } from '../App';
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
  // enhancedPrompt: string; // Commented out to fix lint warning
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
    prompt, setPrompt, width, setWidth, height, setHeight,
    model, setModel, models, enhance, setEnhance, noLogo, setNoLogo,
    safe, setSafe, privateMode, setPrivateMode, seedValue, setSeedValue,
    randomSeed, setRandomSeed, loading, handleGenerate, error
  } = props;

  // Reference to the prompt input element to maintain cursor position
  const promptInputRef = useRef<HTMLTextAreaElement>(null);

  // Track cursor position
  const [cursorPosition, setCursorPosition] = useState<{start: number; end: number} | null>(null);

  // Apply cursor position after render
  useLayoutEffect(() => {
    if (cursorPosition && promptInputRef.current) {
      promptInputRef.current.selectionStart = cursorPosition.start;
      promptInputRef.current.selectionEnd = cursorPosition.end;
    }
  }, [cursorPosition, prompt]);

  return (
    <Stack spacing={2.5}>
      <TextField
        fullWidth
        label="Image prompt"
        placeholder="Describe the image you want to generate..."
        multiline
        rows={4}
        value={prompt}
        onChange={(e) => {
          // Store the current cursor position
          if (promptInputRef.current) {
            const start = promptInputRef.current.selectionStart;
            const end = promptInputRef.current.selectionEnd;
            setCursorPosition({ start, end });
          }

          // Update the state with the new value
          setPrompt(e.target.value);
        }}
        onKeyDown={(e) => {
          // Also store position on key down to catch position before change
          if (promptInputRef.current) {
            const start = promptInputRef.current.selectionStart;
            const end = promptInputRef.current.selectionEnd;
            setCursorPosition({ start, end });
          }
        }}
        onClick={() => {
          // Also update cursor position on click
          if (promptInputRef.current) {
            const start = promptInputRef.current.selectionStart;
            const end = promptInputRef.current.selectionEnd;
            setCursorPosition({ start, end });
          }
        }}
        disabled={loading}
        variant="outlined"
        sx={{ mb: 1 }}
        inputRef={promptInputRef}
      />

      <Divider sx={{ opacity: 0.6, my: 1 }} />

      <FormControl fullWidth variant="outlined" size="small" sx={{ mt: 1 }}>
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

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
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

      <Box sx={{ mt: 3 }}>
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
              sx={{ m: 0, my: 0.5 }}
              labelPlacement="end"
              componentsProps={{ typography: { ml: 2 } }}
            />
          </Tooltip>
        </Stack>
      </Box>

      <Divider sx={{ opacity: 0.6 }} />

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Options
        </Typography>
        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={enhance}
                onChange={(e) => setEnhance(e.target.checked)}
              />
            }
            label="Enhance Prompt"
            sx={{ py: 0.5 }}
            labelPlacement="end"
            componentsProps={{ typography: { ml: 2 } }}
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
            sx={{ py: 0.5 }}
            labelPlacement="end"
            componentsProps={{ typography: { ml: 2 } }}
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
            sx={{ py: 0.5 }}
            labelPlacement="end"
            componentsProps={{ typography: { ml: 2 } }}
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
            sx={{ py: 0.5 }}
            labelPlacement="end"
            componentsProps={{ typography: { ml: 2 } }}
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
  // State for lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
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

  // Comment out handlePromptEnhancement to fix linting issues - can be re-enabled when needed
  /* const handlePromptEnhancement = useCallback(async () => {
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
  }, [prompt]); */

  // Removed automatic prompt enhancement - will only enhance when generating image
  // Enhancement will be handled directly in the handleGenerate function

  const handleGenerate = useCallback(async () => {
    if (!prompt) return;
    try {
      console.log('Starting image generation with prompt:', prompt);
      // Immediately set loading state BEFORE clearing image URL
      // This is important for the fade transition sequence
      setLoading(true);
      setError(null);

      // After setting loading state, clear the image URL to avoid showing the old image during loading
      if (imageUrl) {
        // Store URL in session storage before clearing it from state
        sessionStorage.setItem('lastImageUrl', imageUrl);
        // Clear the imageUrl immediately to prevent it from showing during loading
        setImageUrl('');
      }

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

        // Preload the image before updating state to prevent flashing
        await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = reject;
          img.src = finalUrl;
        }).catch(err => {
          console.warn('Image preload failed but continuing anyway:', err);
        });

        // Set the image URL in state after preloading
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
  // Include imageUrl in dependency array to fix ESLint warning
  }, [prompt, width, height, model, enhance, noLogo, safe, privateMode, seedValue, randomSeed, imageUrl]);

  // Create and update params for sidebar - with memoized handleGenerate to prevent unnecessary regeneration
  const memoizedHandleGenerate = useCallback(handleGenerate, [handleGenerate]);

  useEffect(() => {
    const imageParamsElement = (
      <ImageParams
        prompt={prompt}
        setPrompt={setPrompt}
        /* enhancedPrompt property removed */
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
  }, [prompt, enhancedPrompt, width, height, model, models, enhance, noLogo, safe, privateMode, seedValue, randomSeed, loading, error, memoizedHandleGenerate, setImageParams, setPrompt, setWidth, setHeight, setModel, setEnhance, setNoLogo, setSafe, setPrivateMode, setSeedValue, setRandomSeed]);

  // Set active generator on mount - only once
  useEffect(() => {
    if (setActiveGenerator) {
      console.log('Setting active generator to image');
      setActiveGenerator('image' as GeneratorType);
    }
  }, [setActiveGenerator]);

  return (
    <>
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
          width: '100%',
          maxWidth: '1100px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          mx: 'auto',
          position: 'relative'
        }}>
            {/* Generated image display */}
            {/* This placeholder was moved into the ternary condition above */}

            {/* Main container with proper positioning */}
            <Box sx={{
              position: 'relative',
              width: '100%',
              maxWidth: '1050px',
              aspectRatio: '1/1',
              mx: 'auto', // Properly center without extending into sidebar
              mb: 2
            }}>
              {/* Rendering logic: only show one state at a time based on priority */}
              {/* 1. Loading state has highest priority */}
              {loading ? (
                <Fade in={loading} timeout={300} appear>
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      position: 'absolute',
                      borderRadius: '16px',
                      background: alpha('#121212', 0.8),
                      backdropFilter: 'blur(8px)',
                      border: '1px dashed rgba(255, 255, 255, 0.15)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxSizing: 'border-box',
                      top: 0,
                      left: 0,
                      zIndex: 50 // Much higher z-index to ensure it's above everything
                    }}
                >
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'absolute',
                    inset: 0,
                    p: 6, // Much larger padding to prevent any text cutoff
                    textAlign: 'center'
                  }}>
                    <CircularProgress size={60} sx={{ mb: 3 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      {imageUrl ? 'Regenerating image' : 'Generating your image'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      This may take a few moments...
                    </Typography>
                  </Box>
                </Box>
                </Fade>
              ) : imageUrl ? (
                /* 2. If not loading, show image content if available */
                <Fade in={true} timeout={800}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: '16px',
                      overflow: 'visible',
                      transition: 'all 0.3s ease',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      boxSizing: 'border-box'
                    }}
                >
                  <Box sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardMedia
                      component="img"
                      image={imageUrl}
                      alt="generated"
                      onClick={() => setLightboxOpen(true)}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        backgroundColor: 'rgba(0,0,0,0.2)',
                        display: 'block',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        transition: 'transform 0.3s',
                        '&:hover': {
                          transform: 'scale(1.01)',
                        }
                      }}
                    />
                    <IconButton
                      onClick={() => setLightboxOpen(true)}
                      sx={{
                        position: 'absolute',
                        bottom: 16,
                        right: 80,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(0,0,0,0.7)'
                        }
                      }}
                    >
                      <ZoomInIcon />
                    </IconButton>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the main image click (lightbox)
                        // Create a hidden anchor element for downloading
                        const a = document.createElement('a');
                        // Clone the URL to ensure we get a downloadable resource
                        fetch(imageUrl)
                          .then(response => response.blob())
                          .then(blob => {
                            const url = window.URL.createObjectURL(blob);
                            a.href = url;
                            a.download = `polynate-image-${Date.now()}.png`;
                            a.style.display = 'none';
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                          });
                      }}
                      sx={{
                        position: 'absolute',
                        bottom: 16,
                        right: 16,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(0,0,0,0.7)'
                        }
                      }}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Box>
                  <CardContent sx={{ py: 2, width: '100%', backgroundColor: alpha('#121212', 0.5), borderRadius: '0 0 16px 16px', mt: 'auto' }}>
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
              ) : (
                /* 3. If not loading and no image, show the empty placeholder */
                <div className="MuiBox-root css-1memat1" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                  <Typography variant="h6" color="text.secondary" sx={{ fontSize: '1.25rem', textAlign: 'center', maxWidth: '80%' }}>
                    Enter a prompt and click Generate to create an image
                  </Typography>
                </div>
              )}
            </Box>

            {/* Enhanced prompt display - with added margin-top */}
            {enhance && enhancedPrompt && (
              <Fade in={!!enhancedPrompt} timeout={500}>
                <Paper sx={{
                  p: 3,
                  borderRadius: '16px', // More rounded corners
                  borderLeft: '4px solid',
                  borderColor: 'primary.main',
                  mt: 3, // Add space between the image and this prompt box
                  backgroundColor: alpha('#121212', 0.5),
                  width: '100%',
                  maxWidth: '1050px',
                  display: 'flex',
                  flexDirection: 'column',
                  boxSizing: 'border-box',
                  wordBreak: 'break-word',
                  mx: 'auto', // Center properly without extending into the sidebar
                  zIndex: 5 // Ensure enhanced prompt appears above other elements
                }}>
                  <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                    Enhanced Prompt
                  </Typography>
                  <Typography variant="body2" sx={{
                    whiteSpace: 'pre-wrap',
                    opacity: 0.87,
                    overflowWrap: 'break-word',
                    width: '100%'
                  }}>
                    {enhancedPrompt}
                  </Typography>
                </Paper>
              </Fade>
            )}
        </Box>
      </Box>

      {/* Lightbox modal */}
      <Modal
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        aria-labelledby="image-lightbox"
        aria-describedby="full-size-image-view"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Box sx={{
          position: 'relative',
          maxWidth: '90vw',
          maxHeight: '90vh',
          outline: 'none',
          borderRadius: '16px', // Rounded corners to match design preference
          overflow: 'hidden',
          bgcolor: 'background.paper',
          boxShadow: 24,
        }}>
          <IconButton
            onClick={() => setLightboxOpen(false)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
              zIndex: 10,
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.7)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>

          <IconButton
            onClick={() => {
              // Create a hidden anchor element for downloading
              const a = document.createElement('a');
              // Clone the URL to ensure we get a downloadable resource
              fetch(imageUrl)
                .then(response => response.blob())
                .then(blob => {
                  const url = window.URL.createObjectURL(blob);
                  a.href = url;
                  a.download = `polynate-image-${Date.now()}.png`;
                  a.style.display = 'none';
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                });
            }}
            sx={{
              position: 'absolute',
              top: 8,
              right: 56,
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
              zIndex: 10,
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.7)'
              }
            }}
          >
            <DownloadIcon />
          </IconButton>

          <img
            src={imageUrl}
            alt="Generated content based on prompt"
            style={{
              maxWidth: '100%',
              maxHeight: 'calc(90vh - 40px)',
              display: 'block',
              margin: '0 auto',
            }}
          />
        </Box>
      </Modal>
    </>
  );
};

export default ImageGenerator;
