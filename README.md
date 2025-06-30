# MoodMirror 🧠💜

A beautiful, full-stack emotional text analysis application that provides instant insights into the emotional content of any text using AI.

## Features

### 🎨 Frontend
- **Clean, Modern UI**: Minimalist design with smooth animations and micro-interactions
- **Dark/Light Mode**: Persistent theme switching with system preference detection
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Real-time Analysis**: Instant emotional analysis with loading states
- **Interactive Charts**: Beautiful bar charts showing emotion percentages
- **History Management**: Local storage of last 5 analyses with easy access
- **Clipboard Integration**: One-click paste functionality
- **Character Counter**: Real-time character count with visual feedback

### 🚀 Backend
- **AI-Powered Analysis**: OpenAI GPT integration for accurate emotional analysis
- **Rate Limiting**: Protection against abuse with configurable limits
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **RESTful API**: Clean, documented API endpoints
- **Performance Optimized**: Fast response times with efficient processing

### 🧠 Emotional Intelligence
- **11 Emotion Types**: Joyful, Calm, Anxious, Angry, Sad, Frustrated, Confused, Grateful, Excited, Neutral, Mixed
- **Confidence Percentages**: Up to 3 primary emotions with percentage breakdown
- **Cause Analysis**: AI-generated explanations for emotional patterns
- **Constructive Suggestions**: Actionable advice for emotional well-being

## Quick Start

### Prerequisites
- Node.js (v16+)
- OpenAI API Key

### Installation

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd moodmirror
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Add your OpenAI API key to .env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Start Development**
   ```bash
   npm run dev
   ```

This starts both the frontend (Vite) and backend (Express) servers concurrently.

### Production Build

```bash
npm run build
npm run preview
```

## API Documentation

### POST /api/analyze
Analyzes the emotional content of provided text.

**Request:**
```json
{
  "text": "Your text to analyze here..."
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "overallTone": "Anxious",
    "primaryEmotions": [
      {"emotion": "Anxious", "percentage": 60},
      {"emotion": "Confused", "percentage": 40}
    ],
    "causeExplanation": "The text expresses uncertainty about future outcomes...",
    "suggestion": "Consider breaking down your concerns into actionable steps...",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### GET /api/health
Health check endpoint for monitoring.

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Recharts** for data visualization
- **Lucide React** for icons
- **Vite** for build tooling

### Backend
- **Node.js** with Express
- **OpenAI API** for AI analysis
- **Express Rate Limit** for protection
- **CORS** for cross-origin requests

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ThemeToggle.tsx
│   ├── LoadingSpinner.tsx
│   ├── EmotionBadge.tsx
│   ├── EmotionChart.tsx
│   ├── InsightCard.tsx
│   └── HistoryPanel.tsx
├── hooks/              # Custom React hooks
│   └── useTheme.ts
├── utils/              # Utility functions
│   ├── api.ts
│   ├── storage.ts
│   └── emotions.ts
├── types/              # TypeScript definitions
│   └── index.ts
└── App.tsx             # Main application component

server/
└── index.js            # Express server
```

## Configuration

### Environment Variables
- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `PORT`: Server port (default: 3001)

### Rate Limiting
- 10 requests per 15 minutes per IP
- Configurable in `server/index.js`

### Local Storage
- Stores last 5 analyses automatically
- Theme preference persistence
- No sensitive data stored

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is free to use and modify. Created with ❤️ by Shrey Jain.

## Support

For issues or questions, please create an issue in the repository.