# Polynate - Technical Documentation

This document provides a comprehensive technical overview of the Polynate application, including architecture, component design, interfaces, and UI elements.

## Architecture Overview

Polynate is a React-based web application built with TypeScript that provides a user interface for interacting with the Pollinations.ai API services. The application is structured around the following key components:

```
polynate/
├── public/               # Static files and assets
├── src/
│   ├── components/       # UI components
│   ├── services/         # API service wrappers
│   ├── types/            # TypeScript type definitions
│   └── App.tsx           # Application entry point
└── package.json          # Project dependencies and scripts
```

## Core Services

### Pollinations Service

The `pollinationsService.ts` is the central service that handles all API interactions with the Pollinations.ai endpoints:

- **Image Generation API**: `https://image.pollinations.ai/prompt`
- **Text Generation API**: `https://text.pollinations.ai`

The service encapsulates the following capabilities:

1. **Text Generation**: Handles API calls to generate text using various language models
2. **Image Generation**: Creates image URLs with query parameters based on user inputs
3. **Audio Generation**: Generates audio from text prompts
4. **Image Analysis**: Analyzes images using vision models

## Component Architecture

### Image Generator Component

The `ImageGenerator.tsx` component provides:

- Dynamic model selection from API-fetched models
- Customizable dimensions (128-2048px)
- Random seed generation with toggle option
- Prompt enhancement via API
- Various image generation options (private mode, no logo, safe mode)

Key implementations:
- Dynamic fetching of image models from the API with no hardcoded fallbacks
- Random seed generation with UI indication
- Custom dimension inputs with validation

### Text Generator Component

The `TextGenerator.tsx` component offers:
- Text prompt input with model selection
- System prompt customization
- Various generation options

### Audio Generator Component

The `AudioGenerator.tsx` component provides:
- Text-to-speech conversion
- Voice selection
- Audio model options

## Interface Definitions

The application uses TypeScript interfaces for type safety:

### Image Generation Parameters
```typescript
export interface ImageGenParams {
  prompt: string;
  width?: number;
  height?: number;
  seed?: number;
  model?: string;
  nologo?: boolean;
  private?: boolean;
  enhance?: boolean;
  safe?: boolean;
}
```

### Text Generation Parameters
```typescript
export interface TextGenParams {
  prompt: string;
  model?: string;
  seed?: number;
  system?: string;
  private?: boolean;
  json?: boolean;
}
```

### Audio Generation Parameters
```typescript
export interface AudioGenParams {
  prompt: string;
  model?: string;
  voice?: string;
}
```

### Vision Parameters
```typescript
export interface VisionParams {
  imageUrl: string;
  prompt: string;
  model?: string;
}
```

## UI Components and Elements

### Material UI Integration

The application leverages Material UI v6 for consistent styling and component behavior:

- **Layout**: Box, Stack, Paper components for structured layouts
- **Controls**: Button, Switch, Checkbox, TextField, Select for user inputs
- **Feedback**: Alert, CircularProgress for user notifications and loading states
- **Typography**: Typography component for consistent text styling

### Responsive Design

The interface adapts to different screen sizes using Material UI's responsive layout system:
- Stack components with direction adjustments based on screen size
- Responsive spacing and sizing

## API Integration Details

### Model Fetching Logic

The application follows these steps to fetch available models:

1. First attempts a direct API call to the models endpoint
2. Sets appropriate CORS headers for cross-origin requests
3. Falls back to pollinationsService if direct API call fails
4. Parses and validates the response to ensure only valid models are displayed
5. No hardcoded fallback models - only shows what's available from the API

### Image Generation Process

1. User inputs a prompt and selects parameters
2. Optional: Prompt enhancement via API
3. Parameters are converted to URL query parameters
4. URL is constructed and returned to display the generated image

## Future Development Tasks

1. **Enhanced Error Handling**: More detailed error messages and recovery options
2. **Caching**: Implement model caching to reduce API calls
3. **User Accounts**: Add authentication for saved prompts and generation history
4. **Batch Processing**: Allow multiple generations in a single request
5. **Additional Customization**: More options for image and text generation
