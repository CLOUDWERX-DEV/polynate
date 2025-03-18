# Polynate

<img src="public/logo192.png" alt="Polynate Logo" width="100" />

Polynate is a modern React-based AI playground that provides a user-friendly interface for interacting with various AI generation services from [Pollinations.ai](https://pollinations.ai).

## Features

- **Text Generation**: Create text content using advanced language models
- **Image Generation**: Generate images from text prompts with customizable parameters
- **Audio Generation**: Convert text to speech with different voice options
- **Image Analysis**: Analyze images using AI vision models

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/polynate.git
cd polynate

# Install dependencies
npm install

# Start the development server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

## Usage

Polynate offers three main generation tools:

1. **Text Generator**: Enter a prompt and choose a model to generate AI text
2. **Image Generator**: Create images from text descriptions with options for dimensions, seed, and more
3. **Audio Generator**: Convert text to spoken audio with different voice options

## API Integration

Polynate integrates with the [Pollinations.ai](https://pollinations.ai) API to provide AI generation services. The integration is seamless and doesn't require API keys for basic usage.

## Technologies Used

- **React 19**: Modern UI library for building interactive interfaces
- **TypeScript**: Type-safe JavaScript for better developer experience
- **Material UI 6**: React component library for clean, responsive design
- **Axios**: HTTP client for API requests
- **React Router**: Navigation and routing solution

## Development

### Available Scripts

```bash
# Run in development mode
npm start

# Build for production
npm run build

# Run tests
npm test
```

### Project Structure

```
polynate/
├── public/               # Static files
├── src/
│   ├── components/       # React components
│   ├── services/         # API services
│   ├── types/            # TypeScript type definitions
│   └── App.tsx          # Application entry point
└── package.json         # Dependencies and scripts
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Pollinations.ai](https://pollinations.ai) for providing the AI generation APIs
- [React](https://reactjs.org/) and [Material UI](https://mui.com/) teams for excellent libraries
