import React, { useState, useEffect } from 'react';
import { Box, TextField, Paper, Typography, Select, MenuItem, FormControl, InputLabel, Stack, Button, Switch, FormControlLabel, Divider, Tooltip } from '@mui/material';
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
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom>
              Model Selection
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Model</InputLabel>
              <Select
                value={model}
                label="Model"
                onChange={(e) => setModel(e.target.value)}
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

            <Typography variant="h6" gutterBottom>
              Prompts
            </Typography>
            <TextField
              fullWidth
              label="System Instructions (Optional)"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Your Prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              multiline
              rows={3}
            />

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Generation Options
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <TextField
                type="number"
                label="Seed (optional)"
                value={seed}
                onChange={(e) => setSeed(e.target.value === '' ? '' : Number(e.target.value))}
                sx={{ width: 150 }}
              />
              <FormControlLabel
                control={<Switch checked={jsonMode} onChange={(e) => setJsonMode(e.target.checked)} />}
                label="JSON Mode"
              />
              <FormControlLabel
                control={<Switch checked={private_} onChange={(e) => setPrivate(e.target.checked)} />}
                label="Private"
              />
            </Stack>

            <Button
              variant="contained"
              onClick={handleGenerate}
              disabled={!prompt || loading}
              fullWidth
              sx={{ mt: 2 }}
            >
              {loading ? 'Generating...' : 'Generate Text'}
            </Button>
          </Stack>
        </Paper>

        {loading && (
          <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Typography>Generating text...</Typography>
          </Paper>
        )}

        {error && (
          <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        )}
        
        {generatedText && (
          <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Generated with: {model}
              </Typography>
              {systemPrompt && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  System: {systemPrompt}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                Prompt: {prompt}
              </Typography>
            </Box>
            <Typography whiteSpace="pre-wrap">{generatedText}</Typography>
          </Paper>
        )}
      </Stack>
    </Box>
  );
};
