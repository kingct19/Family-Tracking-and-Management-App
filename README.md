# FamilyTracker - Family Management App

A comprehensive family tracking and management Progressive Web App (PWA) built with React, TypeScript, and Firebase. This app provides real-time location tracking, task management, family messaging, and a secure digital vault.

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

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Custom CSS with Tailwind-inspired utility classes
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **Maps**: Google Maps API
- **Animations**: GSAP and Framer Motion
- **PWA**: Service Worker with offline support
- **Icons**: React Icons (Feather Icons)
- **Notifications**: React Hot Toast

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- Google Maps API key

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
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

Edit `.env` with your credentials:
```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=your-app-id

# Google Maps API Key
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# App Configuration
REACT_APP_APP_NAME=FamilyTracker
REACT_APP_VERSION=1.0.0
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
npm start
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
│   ├── Auth/           # Authentication components
│   ├── Layout/         # Layout components (Header, Sidebar)
│   └── UI/             # Generic UI components
├── contexts/           # React Context providers
│   ├── AuthContext.tsx     # Authentication state
│   ├── FamilyContext.tsx   # Family/hub management
│   └── LocationContext.tsx # Location tracking
├── pages/              # Page components
│   ├── Auth/           # Login/Register pages
│   ├── Dashboard/      # Main dashboard
│   ├── Location/       # Location tracking
│   ├── Tasks/          # Task management
│   ├── Messages/       # Family messaging
│   ├── Vault/          # Digital vault
│   └── Settings/       # User settings
├── config/             # Configuration files
│   └── firebase.ts     # Firebase configuration
├── services/           # Service files
│   └── serviceWorker.ts # PWA service worker
└── App.tsx            # Main app component
```

## 🔧 Available Scripts

### `npm start`
Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder. Optimized for best performance.

### `npm run build-pwa`
Builds the app and generates service worker for PWA functionality.

### `npm run eject`
**Note: This is a one-way operation. Once you eject, you can't go back!**
Removes the single build dependency and copies all configuration files into your project.

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
- Encrypted storage for sensitive information
- Role-based access control
- Secure API key management

## 📱 Mobile Optimization

- Responsive design for all screen sizes
- Touch-friendly interface
- Offline functionality with service worker
- Native app-like experience when installed
- Push notification support

## 🚀 Deployment

### Firebase Hosting
```bash
npm run build
firebase deploy
```

### Other Platforms
The built files in the `build` folder can be deployed to any static hosting service:
- Netlify
- Vercel
- AWS S3 + CloudFront
- GitHub Pages

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
- All open-source contributors

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for families to stay connected and organized.**
