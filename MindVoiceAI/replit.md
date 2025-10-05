# MindVoice Mental Health Assessment Platform

## Overview

MindVoice is a comprehensive mental health assessment platform that combines traditional psychological questionnaires with advanced voice analysis capabilities. The application provides a two-level assessment approach: Level 1 uses the standardized PHQ-9 depression questionnaire for initial screening, while Level 2 incorporates speech-based AI analysis to extract deeper insights from user voice patterns and speech content. The platform generates personalized recommendations and resources based on assessment results, including therapy tools, AI chatbot support, and local clinic referrals.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The application uses a React-based SPA built with TypeScript and Vite for fast development and optimized builds. The frontend follows a component-based architecture with:

- **UI Framework**: shadcn/ui components built on Radix UI primitives for accessible, customizable interfaces
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **State Management**: React Query (TanStack Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod for validation and type safety
- **Audio Processing**: Web Audio API integration through custom hooks for speech recognition and audio analysis

### Backend Architecture
The backend implements a RESTful API using Express.js with TypeScript:

- **Server Framework**: Express.js with middleware for JSON parsing, CORS, and request logging
- **API Design**: RESTful endpoints for assessment CRUD operations with proper HTTP status codes
- **Data Validation**: Zod schemas shared between frontend and backend for consistent validation
- **Development Tools**: Hot reloading with Vite integration and custom error handling middleware

### Data Storage Solutions
The application uses a flexible storage abstraction pattern:

- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Design**: Centralized schema definitions using Drizzle and Zod for assessments, demographics, PHQ-9 responses, and voice analysis data
- **Development Storage**: In-memory storage implementation for rapid prototyping and testing
- **Migration Support**: Drizzle-kit for database schema migrations and version control

### Voice Analysis and AI Integration
The platform incorporates multiple AI analysis components:

- **Speech Recognition**: Browser-native Web Speech API with fallback support
- **Text Analysis**: Sentiment analysis using the Sentiment.js library for client-side processing
- **Audio Feature Extraction**: Custom algorithms for speech rate, pause detection, and pitch analysis
- **AI Services**: Modular service architecture supporting both local TensorFlow Lite models and remote API calls
- **OpenAI Integration**: Structured analysis for sentiment, emotional indicators, and final assessment generation

### Authentication and Authorization
Currently implements a session-based approach with provisions for future enhancements:

- **Session Storage**: Uses connect-pg-simple for PostgreSQL-backed session storage
- **Security**: CSRF protection and secure cookie configuration
- **Privacy**: Local-first processing with optional cloud AI features

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connectivity for cloud deployment
- **drizzle-orm** and **drizzle-kit**: Type-safe ORM and migration tools for PostgreSQL
- **@tanstack/react-query**: Server state management with caching and synchronization
- **wouter**: Lightweight routing library for single-page application navigation

### UI and Design System
- **@radix-ui/react-***: Complete suite of accessible UI primitives (dialogs, forms, navigation, etc.)
- **tailwindcss**: Utility-first CSS framework with custom design tokens
- **class-variance-authority**: Type-safe component variants for styling
- **lucide-react**: Consistent icon system with React components

### Voice and Audio Processing
- **Web Speech API**: Browser-native speech recognition (no external dependency)
- **sentiment**: JavaScript sentiment analysis library for text processing
- **Custom audio analysis**: Client-side audio feature extraction algorithms

### Development and Build Tools
- **vite**: Fast build tool with hot module replacement and TypeScript support
- **@replit/vite-plugin-***: Replit-specific development plugins for enhanced developer experience
- **esbuild**: Fast JavaScript bundler for production builds
- **tsx**: TypeScript execution engine for development server

### Validation and Type Safety
- **zod**: Runtime type validation with TypeScript integration
- **@hookform/resolvers**: Form validation integration with React Hook Form
- **drizzle-zod**: Automatic Zod schema generation from Drizzle database schemas

The architecture prioritizes type safety, accessibility, and privacy while maintaining flexibility for future AI model integrations and deployment scenarios.