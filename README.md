# FamilyTracker - Family Management App

A comprehensive family tracking and management Progressive Web App (PWA) built with React, TypeScript, Vite, and Firebase. This app provides real-time location tracking, task management, family messaging, and a secure digital vault with a modern Life360-style design.

## 🚀 Features

### Core Functionality
- **Real-time Location Tracking** with geofencing alerts
- **Phone Status Monitoring** (online/offline status)
- **Task/Chore Management** with photo verification
- **Family Messaging** system
- **Digital Vault** for passwords and important information

### Novel Features
- **Multiple Hubs System** - Switch between family, sports teams, school groups
- **Enhanced Chore Verification** - Photo proof required before completion approval
- **Automatic Ranking System** - Track who completes which tasks
- **Gamification Elements** - Points and custom rewards
- **Legacy Planning Features** - Access information when family members are unavailable

### Technical Features
- **Progressive Web App (PWA)** - Works across all platforms
- **Real-time Updates** - Live location and status updates
- **Offline Support** - Service worker for offline functionality
- **Responsive Design** - Works on mobile, tablet, and desktop
- **Secure Authentication** - Firebase Auth integration
- **Modern UI/UX** - Life360-style design with smooth animations

## 🛠️ Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite (fast development and building)
- **Styling**: Tailwind CSS v4 with custom animations
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **Maps**: Google Maps API
- **Animations**: GSAP for smooth transitions
- **State Management**: React Query + Zustand
- **PWA**: Service Worker with offline support
- **Testing**: Vitest + React Testing Library + Playwright
- **Code Quality**: ESLint + Prettier + Husky

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- Firebase account
- Google Maps API key

## 🚀 Quick Start

**For detailed setup instructions, see [QUICKSTART.md](./QUICKSTART.md)**

### 1. Clone the Repository
```bash
git clone https://github.com/kingct19/Family-Tracking-and-Management-App.git
cd Family-Tracking-and-Management-App
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Copy the example environment file and configure your Firebase and Google Maps credentials:

```bash
cp env.example .env
```

**Google Maps Setup:** See [GOOGLE_MAPS_SETUP.md](./GOOGLE_MAPS_SETUP.md) for detailed instructions.

Edit `.env` with your credentials:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id

# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# App Configuration
VITE_APP_NAME=FamilyTracker
VITE_APP_VERSION=1.0.0
```

### 4. Firebase Setup

#### Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable the following services:
   - Authentication (Email/Password)
   - Firestore Database
   - Storage
   - Functions (optional)

#### Configure Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Hub members can read/write hub data
    match /hubs/{hubId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.members;
    }
  }
}
```

### 5. Start Development Server
```bash
npm run dev
```

The app will open at [http://localhost:3000](http://localhost:3000).

## 📱 PWA Installation

The app is designed as a Progressive Web App and can be installed on mobile devices:

1. Open the app in a mobile browser (Chrome, Safari, Edge)
2. Look for the "Add to Home Screen" prompt
3. Tap "Add" to install the app
4. The app will appear on your home screen like a native app

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
├── features/            # Feature-based architecture
│   ├── auth/           # Authentication features
│   ├── dashboard/      # Dashboard features
│   ├── location/       # Location tracking features
│   ├── tasks/          # Task management features
│   ├── messages/       # Messaging features
│   ├── vault/          # Digital vault features
│   └── settings/       # Settings features
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
│   ├── animations.ts   # GSAP animation utilities
│   ├── performance.ts  # Performance monitoring
│   ├── security.ts     # Security utilities
│   ├── validation.ts   # Zod validation schemas
│   └── sanitization.ts # Input sanitization
├── config/             # Configuration files
├── styles/             # Global styles
├── types/              # TypeScript type definitions
└── test/               # Test setup files
```

## 🔧 Available Scripts

### `npm run dev`
Runs the app in development mode with Vite. Open [http://localhost:3000](http://localhost:3000) to view it.

### `npm run build`
Builds the app for production to the `dist` folder. Optimized for best performance.

### `npm run preview`
Preview the production build locally.

### `npm test`
Runs unit tests with Vitest.

### `npm run test:coverage`
Runs tests with coverage reporting.

### `npm run test:e2e`
Runs end-to-end tests with Playwright.

### `npm run lint`
Runs ESLint to check code quality.

### `npm run format`
Formats code with Prettier.

## 🌟 Key Features Implementation

### Location Tracking
- Real-time GPS tracking with configurable update intervals
- Geofencing with customizable alerts
- Background location tracking support
- Privacy controls for location sharing

### Task Management
- Photo verification for task completion
- Automatic ranking and points system
- Gamification with rewards and achievements
- Due date tracking and reminders

### Family Hubs
- Multiple hub support (family, sports, school, work)
- Role-based permissions (parent, child, guardian)
- Easy hub switching and management
- Member invitation system

### Digital Vault
- End-to-end encryption for sensitive data
- Password management with auto-generation
- Document storage with secure access
- Legacy planning for emergency access

## 🔒 Security Features

- Firebase Authentication with email/password
- Firestore security rules for data protection
- Input validation with Zod schemas
- XSS protection with DOMPurify sanitization
- Content Security Policy (CSP)
- Rate limiting middleware
- Encrypted storage for sensitive information
- Role-based access control

## 📱 Mobile Optimization

- Responsive design for all screen sizes
- Touch-friendly interface
- Offline functionality with service worker
- Native app-like experience when installed
- Push notification support
- Core Web Vitals optimization

## 🚀 Deployment

### Firebase Hosting
```bash
npm run build
firebase deploy
```

### Other Platforms
The built files in the `dist` folder can be deployed to any static hosting service:
- Netlify
- Vercel
- AWS S3 + CloudFront
- GitHub Pages

## 🧪 Testing

The project includes comprehensive testing:

- **Unit Tests**: Vitest + React Testing Library
- **Integration Tests**: Feature-based testing
- **E2E Tests**: Playwright for full user flows
- **Performance Tests**: Lighthouse CI integration
- **Accessibility Tests**: axe-core integration

Run tests:
```bash
npm test                 # Unit tests
npm run test:e2e        # E2E tests
npm run test:lighthouse # Performance tests
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Firebase for backend services
- React team for the amazing framework
- Google Maps for location services
- Tailwind CSS for beautiful styling
- GSAP for smooth animations
- All open-source contributors

## 📚 Documentation

### Setup Guides
- **[QUICKSTART.md](./QUICKSTART.md)** - Complete setup guide (5 minutes)
- **[GOOGLE_MAPS_SETUP.md](./GOOGLE_MAPS_SETUP.md)** - Google Maps API setup instructions
- **[env.example](./env.example)** - Environment variables template

### Implementation Guides
- **[group-safety-app-implementation.plan.md](./group-safety-app-implementation.plan.md)** - Full implementation plan (10 phases)
- **[PHASE1_LOCATION_COMPLETE.md](./PHASE1_LOCATION_COMPLETE.md)** - Phase 1.1: Location tracking (✅ Complete)
- **[LIFE360_ARCHITECTURE_COMPLETE.md](./LIFE360_ARCHITECTURE_COMPLETE.md)** - Life360-style architecture (✅ Complete)

### Verification
```bash
# Verify your setup is complete
node scripts/verify-setup.js
```

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation above

## 🗺️ Roadmap

### ✅ Completed
- Phase 1.1: Real-time location tracking with Google Maps
- Life360-style map-first interface
- Firebase Authentication & Firestore
- Beautiful Material Design 3 UI

### 🚧 In Progress
- Phase 1.2: Geofencing system with alerts
- Phase 1.3: Device monitoring (battery, online status)

### 📋 Upcoming
- Phase 2: Real-time chat and broadcast alerts
- Phase 3: Photo-proof task verification
- Phase 4: XP system and gamification
- Phase 5: Multi-hub membership
- Phase 6: Digital vault with encryption
- Phase 7: Feature toggles per hub
- Phase 8: Role progression system
- Phase 9: PWA optimization & offline support
- Phase 10: Comprehensive testing & accessibility

See [group-safety-app-implementation.plan.md](./group-safety-app-implementation.plan.md) for details.

---

**Built with ❤️ for families to stay connected and organized.**
