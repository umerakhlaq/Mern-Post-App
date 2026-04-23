# ✅ Socket.io Real-Time Notifications - Setup Checklist

## Backend Setup

- [x] **Socket.io installed** 
  ```bash
  npm install socket.io
  ```

- [x] **Backend app.js updated**
  - HTTP server created
  - Socket.io initialized with CORS
  - User-room mapping enabled
  - Connection/disconnect handlers added

- [x] **Notification Routes Updated**
  - ✅ `like.js` - Emits 'new-notification' on like
  - ✅ `comment.js` - Emits 'new-notification' on reply
  - ✅ `user.js` - Emits 'new-notification' on follow
  - ✅ `post.js` - Emits 'new-notification' on comment

- [x] **Database Schema**
  - ✅ Notification model has `title`, `message`, `sender` fields
  - ✅ `sender` field is optional (for broadcasts)
  - ✅ All events include proper population

---

## Frontend Setup

- [x] **Socket.io-client installed**
  ```bash
  npm install socket.io-client
  ```

- [x] **Socket Context Created** (`context/SocketContext.jsx`)
  - ✅ Connection management
  - ✅ Auto-reconnection
  - ✅ User-join event on connect
  - ✅ Error handling

- [x] **App.jsx Updated**
  - ✅ SocketProvider wraps entire app
  - ✅ Placed inside AuthProvider
  - ✅ Accessible to all components via hook

- [x] **Notifications.jsx Updated**
  - ✅ useSocket hook integrated
  - ✅ Real-time listener for 'new-notification'
  - ✅ Toast notification on new message
  - ✅ New notifications added to list

- [x] **Sidebar.jsx Updated**
  - ✅ useSocket hook integrated
  - ✅ Real-time badge update
  - ✅ Unread count increment on new notification

---

## To Run the Application:

### Terminal 1 - Backend
```bash
cd backend
npm start
# Expected output:
# Database connected successfully
# Server running on port 3000
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
# Expected output:
# VITE... running at http://localhost:5173
```

---

## Testing Checklist:

- [ ] **Browser 1 (User A)**: Open http://localhost:5173, login with User A
- [ ] **Browser 2 (User B)**: Open http://localhost:5173, login with User B
- [ ] **Test Like**: User B likes User A's post
  - [ ] User B's like button shows reaction
  - [ ] User A sees notification immediately (no refresh needed)
  - [ ] Notification counter increments
  - [ ] Toast shows "New like notification!"
  
- [ ] **Test Follow**: User B follows User A
  - [ ] Follow button changes state
  - [ ] User A sees follow notification immediately
  - [ ] Notification includes User B's info
  
- [ ] **Test Comment**: User B comments on User A's post
  - [ ] Comment appears immediately in post
  - [ ] User A gets notification instantly
  - [ ] Notification shows comment preview
  
- [ ] **Test Reply**: User B replies to User A's comment
  - [ ] Reply socket event emits
  - [ ] User A sees reply notification
  - [ ] Badge updates in real-time

---

## Debug Commands:

### Check Backend Logs
```bash
# In backend terminal, look for:
New user connected: [socket-id]
User [user_id] joined room with socket [socket-id]
```

### Check Frontend Socket Connection
```javascript
// In browser console:
// Should see:
Socket connected: abc123...
User abc123 joined room

// To test emit:
// Go to any notification page and check for:
new-notification event listener active
```

### Verify MongoDB
```python
# In MongoDB Compass or mongosh:
use vibe_db
db.notifications.find({ type: 'like' }).pretty()
# Should return recent notifications with all fields
```

---

## Common Issues & Fixes:

### ❌ Port 3000 Already in Use
```bash
# Kill the process
netstat -ano | findstr :3000
taskkill /PID [PID] /F

# Or change port in .env
PORT=3001
```

### ❌ Socket Connection Fails
1. Check that backend is running on port 3000
2. Verify CORS origin in `app.js` includes frontend URL
3. Check browser console for socket error messages
4. Try hard refresh (Ctrl+Shift+R)

### ❌ Notifications Don't Update Badge
1. Verify Sidebar.jsx has socket listener
2. Check that `user._id` is being set correctly
3. Verify socket.emit('user-join', user._id) works
4. Check browser console for socket events

### ❌ No Toast Notification Showing
1. Verify react-hot-toast is installed
2. Check Toaster component in App.jsx
3. Verify socket listener in Notifications.jsx
4. Check browser console for toast.success() calls

---

## Socket Events Flow:

```
User B Action
    ↓
POST request to backend
    ↓
Create notification in MongoDB
    ↓
Backend emits: io.to(recipientId).emit('new-notification', {...})
    ↓
User A's socket receives 'new-notification'
    ↓
Frontend: toast shows + list updates + badge increments
    ↓
✅ User A sees instantly (no refresh needed!)
```

---

## Success Indicators:

✅ Backend starts without port errors  
✅ Frontend loads without socket errors  
✅ Socket tab in browser shows connected  
✅ New notifications appear in real-time  
✅ Badge updates automatically  
✅ Toast messages display  
✅ Refresh page still shows notifications (stored in DB)  

---

**Status**: 🚀 Ready to Test  
**Last Updated**: March 31, 2026
