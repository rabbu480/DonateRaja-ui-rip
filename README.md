# ShareHeart - Community Sharing Platform

A modern community sharing platform built with React, TypeScript, and Spring Boot backend integration.

## Features

- 🎨 **Modern UI Design** - Zomato-inspired red theme with gradient effects
- 🔐 **Authentication System** - JWT-based login/register with form validation
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🌙 **Dark Mode Support** - Toggle between light and dark themes
- 📦 **Item Management** - Create, browse, and manage donations/rentals
- 💬 **Real-time Messaging** - Chat with other users
- 📊 **Analytics Dashboard** - Track your activity and achievements
- ⭐ **User Profiles** - Comprehensive user management system

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Query** for state management and API calls
- **React Hook Form** with Zod validation
- **Wouter** for routing

### Backend Integration
- **Spring Boot** backend (port 8080)
- **JWT Authentication**
- **RESTful API** with Swagger documentation
- **PostgreSQL** database

## Prerequisites

Before running the application, make sure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Spring Boot backend** running on port 8080
- **PostgreSQL** database

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd shareheart
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:8080

# Database Configuration (if needed)
DATABASE_URL=postgresql://username:password@localhost:5432/shareheart

# Other environment variables
NODE_ENV=development
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Backend Integration

The frontend is configured to work with your existing Spring Boot backend. Make sure your backend:

1. **Runs on port 8080**
2. **Has CORS enabled** for `http://localhost:5173`
3. **Implements JWT authentication** with the following endpoints:
   - `POST /auth/login` - User login
   - `POST /auth/register` - User registration  
   - `GET /users/me` - Get current user profile

### API Endpoints Expected

The frontend expects these main API endpoints:

- **Authentication**: `/auth/login`, `/auth/register`, `/users/me`
- **Items**: `/items`, `/items/{id}`, `/items/search`
- **Requests**: `/item-requests`
- **Messages**: `/messages/conversations`
- **Wallet**: `/wallet/transactions`
- **Notifications**: `/notifications`
- **Favorites**: `/favorites`
- **Banners**: `/banners`

## Project Structure

```
shareheart/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions and API client
│   │   └── index.css      # Global styles and theme
├── server/                # Express server (development only)
├── shared/               # Shared types and schemas
├── package.json
└── README.md
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run db:push` - Push database schema changes

## Configuration

### Backend Connection

The app automatically connects to your Spring Boot backend. Update the API base URL in:

- `client/src/lib/api.ts` - Main API client
- `client/src/lib/queryClient.ts` - Query client configuration

### Authentication

JWT tokens are stored in `localStorage` and automatically included in API requests. The auth system handles:

- Login/logout flows
- Token refresh
- Protected route access
- User session management

## Deployment

### Frontend Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy the `dist/` folder to your hosting provider

### Environment Variables for Production

```env
VITE_API_BASE_URL=https://your-backend-api.com
```

## Troubleshooting

### Common Issues

1. **Backend Connection Failed**
   - Ensure Spring Boot backend is running on port 8080
   - Check CORS configuration in backend
   - Verify API endpoints match expected structure

2. **Authentication Issues**
   - Check JWT token format in backend response
   - Verify token storage in browser localStorage
   - Ensure backend accepts Bearer token format

3. **Build Issues**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

## API Integration Guide

### Setting up CORS in Spring Boot

Add this to your Spring Boot application:

```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

### JWT Response Format

The frontend expects login/register responses in this format:

```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

## Support

For questions or issues, please check your backend Swagger documentation and ensure all expected endpoints are properly implemented.

## License

This project is licensed under the MIT License.