import React, { useState, useEffect, useCallback } from 'react';
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
  Alert
} from '@mui/material';
import { pollinationsService } from '../services/pollinationsService';
import { ImageGenParams } from '../types';

interface Model {
  id: string;
  name: string;
  description?: string;
}

export const ImageGenerator: React.FC = () => {
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

  useEffect(() => {
    // Only enhance the prompt when user has stopped typing for 1.5 seconds
    const debounceTimer = setTimeout(() => {
      if (prompt && enhance) {
        handlePromptEnhancement();
      }
    }, 1500);
    
    return () => clearTimeout(debounceTimer);
  }, [prompt, enhance, handlePromptEnhancement]);

  const handleGenerate = useCallback(async () => {
    if (!prompt) return;
    try {
      setLoading(true);
      setError(null);
      
      // Log current state for debugging
      console.log('Generating image with model:', model);
      console.log('Current models in dropdown:', models);
      
      // Prepare params for image generation
      const params: ImageGenParams = {
        prompt: enhance && enhancedPrompt ? enhancedPrompt : prompt,
        width,
        height,
        model, // Make sure this is the selected model's ID
        enhance,
        nologo: noLogo,
        safe,
        private: privateMode
      };
      
      // Add seed if provided
      if (seedValue !== '') {
        params.seed = Number(seedValue);
      }
      
      // Log the full URL that will be generated
      const baseUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(params.prompt)}`;
      const queryParams = new URLSearchParams({
        width: width.toString(),
        height: height.toString(),
        model: model,
        ...(seedValue && { seed: seedValue }),
        ...(noLogo && { nologo: 'true' }),
        ...(privateMode && { private: 'true' }),
        ...(enhance && { enhance: 'true' }),
        ...(safe && { safe: 'true' })
      });
      const fullUrl = `${baseUrl}?${queryParams.toString()}`;
      console.log('Full image URL being generated:', fullUrl);
      
      const url = await pollinationsService.generateImage(params);
      console.log('Final image URL from service:', url);
      setImageUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [prompt, enhancedPrompt, width, height, model, enhance, noLogo, safe, privateMode, seedValue]);

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom>
              Prompt
            </Typography>

            <TextField
              fullWidth
              label="Image prompt"
              multiline
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              variant="outlined"
            />

            <Typography variant="h6" gutterBottom>
              Model Selection
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Model</InputLabel>
              <Select
                value={model}
                label="Model"
                onChange={(e) => {
                  console.log('Selected model changed to:', e.target.value);
                  setModel(e.target.value);
                  // Clear imageUrl to force re-generation with new model
                  setImageUrl('');
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
            
            <Divider sx={{ my: 2 }} />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Width</InputLabel>
                <Select
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  label="Width"
                  disabled={loading}
                >
                  <MenuItem value={512}>512px</MenuItem>
                  <MenuItem value={768}>768px</MenuItem>
                  <MenuItem value={1024}>1024px</MenuItem>
                  <MenuItem value={1280}>1280px</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Height</InputLabel>
                <Select
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  label="Height"
                  disabled={loading}
                >
                  <MenuItem value={512}>512px</MenuItem>
                  <MenuItem value={768}>768px</MenuItem>
                  <MenuItem value={1024}>1024px</MenuItem>
                  <MenuItem value={1280}>1280px</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Seed (optional)"
                type="number"
                value={seedValue}
                onChange={(e) => setSeedValue(e.target.value)}
                disabled={loading}
                fullWidth
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 1 }}>
              <FormControlLabel
                control={<Switch checked={enhance} onChange={(e) => setEnhance(e.target.checked)} />}
                label="Enhance Prompt"
              />
              <FormControlLabel
                control={<Switch checked={noLogo} onChange={(e) => setNoLogo(e.target.checked)} />}
                label="No Logo"
              />
              <FormControlLabel
                control={<Switch checked={safe} onChange={(e) => setSafe(e.target.checked)} />}
                label="Safe Mode"
              />
              <FormControlLabel
                control={<Switch checked={privateMode} onChange={(e) => setPrivateMode(e.target.checked)} />}
                label="Private"
              />
            </Stack>

            <Button
              variant="contained"
              color="primary"
              onClick={handleGenerate}
              disabled={!prompt || loading}
              sx={{ mt: 2 }}
              fullWidth
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate Image'}
            </Button>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Stack>
        </Paper>

        {imageUrl && (
          <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom>
              Generated Image
            </Typography>
            <Box
              component="img"
              src={imageUrl}
              alt="Generated image"
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 1,
                mt: 2,
              }}
            />
          </Paper>
        )}

        {enhance && enhancedPrompt && (
          <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom>
              Enhanced Prompt
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {enhancedPrompt}
            </Typography>
          </Paper>
        )}
      </Stack>
    </Box>
  );
};

export default ImageGenerator;
