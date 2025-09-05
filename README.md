# Threads Clone Mobile App

## Overview

Threads Clone is a professional social media mobile application inspired by Twitter/X Threads, designed for seamless user interaction and content sharing. The app enables users to register, log in, create posts with hashtags and images, interact through likes, comments, and follows, and discover other users. Built with a focus on robust authentication, real-time updates, and consistent error handling, Threads Clone delivers a modern and reliable user experience.

## Features

- **User Authentication:** Secure login and registration using JWT tokens.
- **Post Creation:** Compose posts with text, hashtags, and optional images.
- **Social Interactions:** Like, comment, and follow other users.
- **User Discovery:** Search and view user profiles, followers, and following lists.
- **Real-Time Updates:** Automatic feed refresh after user actions.
- **Error Handling:** Consistent alert-based feedback for errors and validation.
- **Responsive UI:** Dark mode, loading states, and mobile-optimized design.

## Tech Stack

- React Native
- JavaScript
- Expo
- Apollo Client (GraphQL)
- SecureStore (JWT management)
- React Navigation v6
- GraphQL (queries & mutations)
- Vector Icons

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/threads-clone-mobile.git
   cd threads-clone-mobile/client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env` and set your GraphQL server URL.
4. Start the development server:
   ```bash
   npm start
   ```
5. Run on your device or simulator using Expo Go or the provided commands.

## Usage

- Register a new account or log in with existing credentials.
- Create posts with hashtags and images.
- Like, comment, and follow other users.
- Search for users and view their profiles.
- All actions provide real-time feedback and error alerts.

## Project Structure

```
client/
  ├── src/
  │   ├── screens/         # App screens (Home, Login, Register, PostDetail, UserDetail, etc.)
  │   ├── navigators/      # Navigation setup
  │   ├── utils/           # Utility functions (error handling, etc.)
  │   └── ...
  ├── assets/              # Images and icons
  ├── app.config.js        # Expo configuration
  ├── .env.example         # Environment variable example
  └── ...
```

## License

This project is licensed under the MIT License.
