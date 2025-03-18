import React, { useState } from 'react';
import { Box, TextField, Button, Select, MenuItem, FormControl, InputLabel, Stack } from '@mui/material';
import { pollinationsService } from '../services/pollinationsService';

export const AudioGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [voice, setVoice] = useState('alloy');
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const url = await pollinationsService.generateAudio({
        prompt,
        voice,
        model: 'openai-audio'
      });
      setAudioUrl(url);
    } catch (error) {
      console.error('Error generating audio:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <TextField
          fullWidth
          label="Text to Speech"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          multiline
          rows={3}
        />

        <FormControl>
          <InputLabel>Voice</InputLabel>
          <Select
            value={voice}
            label="Voice"
            onChange={(e) => setVoice(e.target.value)}
          >
            <MenuItem value="alloy">Alloy</MenuItem>
            <MenuItem value="echo">Echo</MenuItem>
            <MenuItem value="fable">Fable</MenuItem>
            <MenuItem value="nova">Nova</MenuItem>
            <MenuItem value="shimmer">Shimmer</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={!prompt || loading}
        >
          {loading ? 'Generating...' : 'Generate Audio'}
        </Button>

        {audioUrl && (
          <Box>
            <audio controls src={audioUrl}>
              Your browser does not support the audio element.
            </audio>
          </Box>
        )}
      </Stack>
    </Box>
  );
};
