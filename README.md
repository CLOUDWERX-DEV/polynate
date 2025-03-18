# Polynate

<p align="center">
  <img src="public/logo512.png" alt="Polynate Logo" width="200" />
</p>

<p align="center">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT"></a>
  <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-19.0.0-61DAFB?logo=react" alt="React"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-4.9.5-3178C6?logo=typescript" alt="TypeScript"></a>
  <a href="https://mui.com/"><img src="https://img.shields.io/badge/Material%20UI-6.4.8-0081CB?logo=material-ui" alt="Material UI"></a>
</p>

<p align="center">
  <strong>AI-powered text and audio content generation platform</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-usage">Usage</a> •
  <a href="#-development">Development</a> •
  <a href="#-license">License</a>
</p>

Polynate is a modern React-based AI playground that provides a user-friendly interface for interacting with various AI generation services from [Pollinations.ai](https://pollinations.ai).

## ✨ Features

- **Text Generation**: Create text content using advanced language models
- **Image Generation**: Generate images from text prompts with customizable parameters
- **Audio Generation**: Convert text to speech with different voice options
- **Image Analysis**: Analyze images using AI vision models

## 🖼️ Screenshots

**Click to expand screenshots**

> _Note: Screenshots will be added once the UI is finalized._
>
> _Example: ![Polynate Screenshot](./docs/images/screenshot1.png)_

## 🚀 Getting Started

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

## 📖 Usage

Polynate offers three main generation tools:

1. **Text Generator**: Enter a prompt and choose a model to generate AI text
2. **Image Generator**: Create images from text descriptions with options for dimensions, seed, and more
3. **Audio Generator**: Convert text to spoken audio with different voice options

## 🔌 API Integration

Polynate integrates with the [Pollinations.ai](https://pollinations.ai) API to provide AI generation services. The integration is seamless and doesn't require API keys for basic usage.

## 🛠️ Technologies Used

- **React 19**: Modern UI library for building interactive interfaces
- **TypeScript**: Type-safe JavaScript for better developer experience
- **Material UI 6**: React component library for clean, responsive design
- **Axios**: HTTP client for API requests
- **React Router**: Navigation and routing solution

## 👨‍💻 Development

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

## 👥 Contributing

Contributions are welcome! Here's how you can contribute:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please make sure to update tests as appropriate and follow the code style of the project.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Pollinations.ai](https://pollinations.ai) for providing the AI generation APIs
- [React](https://reactjs.org/) for the amazing UI library
- All the open-source libraries that made this project possible
