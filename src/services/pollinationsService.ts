import axios from 'axios';
import { ImageGenParams, TextGenParams, AudioGenParams, VisionParams } from '../types';

interface Model {
  id: string;
  name: string;
  description?: string;
}

const IMAGE_API_URL = 'https://image.pollinations.ai/prompt';
const TEXT_API_URL = 'https://text.pollinations.ai';

export const pollinationsService = {
  generateImage: async (params: ImageGenParams) => {
    const queryParams = new URLSearchParams({
      width: params.width?.toString() || '1024',
      height: params.height?.toString() || '1024',
      ...(params.seed && { seed: params.seed.toString() }),
      ...(params.model && { model: params.model }),
      ...(params.nologo && { nologo: 'true' }),
      ...(params.private && { private: 'true' }),
      ...(params.enhance && { enhance: 'true' }),
      ...(params.safe && { safe: 'true' })
    });

    const url = `${IMAGE_API_URL}/${encodeURIComponent(params.prompt)}?${queryParams}`;
    return url;
  },

  generateText: async (params: TextGenParams) => {
    const response = await axios.post(TEXT_API_URL, {
      messages: [
        ...(params.system ? [{ role: 'system', content: params.system }] : []),
        { role: 'user', content: params.prompt }
      ],
      model: params.model || 'mistral',
      seed: params.seed,
      private: params.private
    });
    return response.data;
  },

  generateAudio: async (params: AudioGenParams) => {
    const url = `${TEXT_API_URL}/${encodeURIComponent(params.prompt)}`;
    const queryParams = new URLSearchParams({
      model: params.model || 'openai-audio',
      voice: params.voice || 'alloy'
    });
    return `${url}?${queryParams}`;
  },

  analyzeImage: async (params: VisionParams) => {
    const response = await axios.post(`${TEXT_API_URL}/openai`, {
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: params.prompt },
            { type: 'image_url', image_url: { url: params.imageUrl } }
          ]
        }
      ],
      model: params.model || 'openai'
    });
    return response.data;
  },

  getAvailableModels: async () => {
    try {
      console.log('Fetching models from endpoints...');
      
      // Set up default models in case API requests fail
      const defaultImageModels: Model[] = [
        { id: 'flux', name: 'Flux', description: 'Default image model' },
        { id: 'sdxl', name: 'Stable Diffusion XL', description: 'High quality image generation' },
      ];
      
      const defaultTextModels: Model[] = [
        { id: 'gpt-4', name: 'GPT-4', description: 'High-capability language model' },
        { id: 'claude-3', name: 'Claude 3', description: 'Advanced reasoning capabilities' },
        { id: 'mistral', name: 'Mistral', description: 'Fast and efficient language model' },
      ];
      
      // Try to fetch image models
      let imageModels = [...defaultImageModels]; // Start with defaults
      try {
        const imageResponse = await axios.get('https://image.pollinations.ai/models');
        console.log('Image models raw response:', imageResponse.data);
        
        if (imageResponse.data && typeof imageResponse.data === 'object') {
          if (Array.isArray(imageResponse.data)) {
            // Handle array response
            const apiImageModels = imageResponse.data
              .filter((model: any) => model.id || model.name)
              .map((model: any) => ({
                id: model.id || model.name,
                name: model.name || model.id,
                description: model.description || ''
              }));
              
            if (apiImageModels.length > 0) {
              imageModels = apiImageModels; // Replace defaults only if we got valid models
              console.log('Using API image models:', imageModels);
            }
          } else {
            // Handle object response
            const apiImageModels = Object.entries(imageResponse.data)
              .map(([id, details]: [string, any]) => ({
                id,
                name: typeof details === 'object' && details.name ? details.name : id,
                description: typeof details === 'object' && details.description ? details.description : ''
              }));
              
            if (apiImageModels.length > 0) {
              imageModels = apiImageModels; // Replace defaults only if we got valid models
              console.log('Using API image models (from object):', imageModels);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching image models:', err);
        console.log('Using default image models');
      }
      
      // Try to fetch text models
      let textModels = [...defaultTextModels]; // Start with defaults
      try {
        const textResponse = await axios.get('https://text.pollinations.ai/models');
        console.log('Text models raw response:', textResponse.data);
        
        if (textResponse.data && typeof textResponse.data === 'object') {
          if (Array.isArray(textResponse.data)) {
            // Handle array response
            const apiTextModels = textResponse.data
              .filter((model: any) => model.id || model.name)
              .map((model: any) => ({
                id: model.id || model.name,
                name: model.name || model.id,
                description: model.description || ''
              }));
              
            if (apiTextModels.length > 0) {
              textModels = apiTextModels; // Replace defaults only if we got valid models
              console.log('Using API text models:', textModels);
            }
          } else {
            // Handle object response
            const apiTextModels = Object.entries(textResponse.data)
              .map(([id, details]: [string, any]) => ({
                id,
                name: typeof details === 'object' && details.name ? details.name : id,
                description: typeof details === 'object' && details.description ? details.description : ''
              }));
              
            if (apiTextModels.length > 0) {
              textModels = apiTextModels; // Replace defaults only if we got valid models
              console.log('Using API text models (from object):', textModels);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching text models:', err);
        console.log('Using default text models');
      }
      
      console.log('Final image models:', imageModels);
      console.log('Final text models:', textModels);
      
      return { imageModels, textModels };
    } catch (error) {
      console.error('Error in getAvailableModels:', error);
      // Return default models on error
      return {
        imageModels: [
          { id: 'flux', name: 'Flux', description: 'Default image model' },
          { id: 'sdxl', name: 'Stable Diffusion XL', description: 'High quality image generation' },
        ],
        textModels: [
          { id: 'gpt-4', name: 'GPT-4', description: 'High-capability language model' },
          { id: 'claude-3', name: 'Claude 3', description: 'Advanced reasoning capabilities' },
          { id: 'mistral', name: 'Mistral', description: 'Fast and efficient language model' },
        ]
      };
    }
  }
};
