# Frontend Flow Implementation

This document describes the implementation of the authentication, posts, and chat flow for the TBC application.

## Overview

The frontend implements a complete user flow:
1. **Homepage** - Login/Signup modals + Posts listing
2. **Posts** - Create, list, and view posts
3. **Chat** - Real-time STOMP WebSocket chat for each post

## Tech Stack

- **Framework**: React + TypeScript + Vite
- **Routing**: React Router v6
- **State Management**: React Query (@tanstack/react-query)
- **UI Components**: TailwindCSS + shadcn/ui
- **Real-time**: STOMP over WebSocket (@stomp/stompjs + sockjs-client)
- **HTTP Client**: Axios with auth interceptors
- **Notifications**: Sonner (toast notifications)

## File Structure

```
src/
├── app/                    # App Router pages (Next.js style)
│   ├── page.tsx           # Homepage
│   └── posts/
│       ├── page.tsx       # Posts listing
│       ├── new/
│       │   └── page.tsx   # Create new post
│       └── [id]/
│           ├── page.tsx   # Post detail
│           └── chat/
│               └── page.tsx # Post chat room
├── components/
│   ├── Header.tsx         # Navigation with auth buttons
│   ├── LoginModal.tsx     # Login form modal
│   ├── SignupModal.tsx    # Signup form modal
│   ├── PostCard.tsx       # Post preview card
│   ├── ChatRoom.tsx       # Real-time chat component
│   └── ui/                # shadcn/ui components
├── hooks/
│   ├── useAuth.ts         # Authentication hooks
│   ├── usePosts.ts        # Posts CRUD hooks
│   └── useChat.ts         # Chat functionality hooks
├── lib/
│   ├── api.ts             # Axios instance with auth
│   └── stompClient.ts     # STOMP WebSocket client
└── types/
    ├── auth.ts            # Authentication types
    ├── post.ts            # Post/Event types
    └── chat.ts            # Chat message types
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Posts (Using Events API)
- `GET /api/events` - List events/posts with pagination
- `GET /api/events/:id` - Get event/post details
- `POST /api/events` - Create new event/post
- `PUT /api/events/:id` - Update event/post
- `DELETE /api/events/:id` - Delete event/post

### Chat
- `GET /api/chat/rooms/:roomId/messages` - Get chat history
- WebSocket: `/ws` - STOMP endpoint
- Subscribe: `/topic/rooms/:roomId` - Room messages
- Publish: `/app/rooms/:roomId/send` - Send message

## Authentication Flow

1. **Login Modal**: Email + password → JWT token stored in localStorage
2. **Signup Modal**: Name, nickname, email, password → Auto-redirect to login
3. **Auth State**: Managed by React Query with automatic token refresh
4. **Protected Routes**: Redirect to homepage if not authenticated

## Posts Flow

1. **Homepage**: Shows latest 6 posts + banner
2. **Posts List**: Paginated grid of all posts with search
3. **Post Detail**: Full post content + "Enter Chat" button
4. **Create Post**: Form with title, content, optional image upload

## Chat Flow

1. **Room Creation**: Each post has a chat room (roomId = postId)
2. **Authentication**: JWT token sent via Authorization header
3. **Real-time**: STOMP WebSocket for instant messaging
4. **Features**: Message history, typing indicators, connection status

## Assumptions Made

### Backend Endpoints
- Using existing `/api/events` endpoints for posts functionality
- Chat rooms are keyed by post/event ID
- JWT authentication via Authorization header (fallback to query param)

### Frontend Behavior
- Posts and Events are used interchangeably
- Chat room ID matches the post/event ID
- Image uploads supported via multipart/form-data
- Auto-scroll to latest messages in chat

### Security
- JWT tokens stored in localStorage (not httpOnly cookies)
- CORS handled by backend configuration
- WebSocket authentication via JWT token

## Environment Variables

```bash
# Frontend (if needed)
VITE_API_BASE_URL=/api
VITE_WS_URL=/ws

# Backend (already configured)
# JWT secrets, database URLs, etc.
```

## Development Setup

1. **Install Dependencies**:
   ```bash
   cd tbc-front
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Backend Required**:
   - Spring Boot application running on port 8080
   - Database configured and running
   - WebSocket endpoint available at `/ws`

## Testing the Flow

1. **Authentication**:
   - Open homepage → Click "로그인" → Enter credentials
   - Or click "회원가입" → Fill form → Auto-redirect to login

2. **Posts**:
   - After login → Click "새 게시글 작성" → Fill form → Submit
   - View posts on homepage or `/posts` page
   - Click "자세히 보기" to see full post

3. **Chat**:
   - From post detail → Click "채팅 참여하기"
   - Enter messages → See real-time updates
   - Check connection status indicator

## Known Limitations

1. **Search**: Post search functionality not yet implemented
2. **Comments**: Post comments not yet implemented
3. **File Upload**: Only image uploads supported
4. **Notifications**: No push notifications for new messages
5. **Mobile**: Responsive design needs testing on mobile devices

## Future Enhancements

1. **Real-time Features**:
   - Typing indicators
   - Online user presence
   - Message read receipts

2. **Post Features**:
   - Rich text editor
   - Multiple image uploads
   - Post categories and tags

3. **User Features**:
   - User profiles
   - Friend system
   - Notification preferences

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**:
   - Check if backend is running
   - Verify JWT token is valid
   - Check browser console for CORS errors

2. **Authentication Issues**:
   - Clear localStorage and try again
   - Check if backend auth endpoints are working
   - Verify JWT token format

3. **Posts Not Loading**:
   - Check network tab for API errors
   - Verify backend events endpoints
   - Check React Query devtools

### Debug Tools

- React Query Devtools (in development)
- Browser Network tab for API calls
- Browser Console for WebSocket messages
- STOMP debug logs (enabled in development)
