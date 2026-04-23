# Real-Time Notifications with Socket.io - Complete Setup

## کیا ہے یہ فیچر؟

**Real-time Notifications** اب آپ کی application میں لائیو ہے! جب کوئی user:
- 👍 آپ کی post کو like کرے
- 💬 آپ کی post پر comment کرے  
- 👤 آپ کو follow کرے
- 💭 آپ کے comment پر reply کرے

..تو **فوری** notification دیکھے گا بغیر page refresh کیے! ⚡

---

## کیا کیا گیا؟

### Backend میں:
✅ **Socket.io Server Setup** (`backend/src/app.js`)
- HTTP server create کیا
- Socket.io initialized کیا
- User-room mapping setup کیا

✅ **Socket Events Emit** (تمام routes میں):
- `like.js` - Post/comment like notification
- `comment.js` - Comment/reply notification  
- `user.js` - Follow notification
- `post.js` - New comment notification

✅ **Database Schema Updated** (`notification.js`):
- `title` field شامل
- `message` field شامل
- `sender` field optional بنایا

### Frontend میں:
✅ **Socket.io Client** (`frontend/src/context/SocketContext.jsx`)
- Socket connection establish کرتا ہے
- User ID کے ساتھ socket join کرتا ہے
- Auto reconnection کے ساتھ

✅ **Notifications Listener** (`Notifications.jsx`)
- Real-time notifications سننا
- Toast notification دکھانا
- Unread count update کرنا

✅ **Sidebar Badge Update** (`Sidebar.jsx`)
- Unread notification counter
- Real-time بیج update

✅ **App Provider Wrap** (`App.jsx`)
- SocketProvider شامل کیا
- AuthProvider کے اندر

---

## Testing کریں:

### **Step 1: Backend Restart**
```bash
# پہلے موجودہ backend بند کریں (Ctrl+C)
cd backend
npm start
```

Console میں دیکھے گا:
```
Database connected successfully
Server running on port 3000
Socket.io listening for connections
```

### **Step 2: Frontend چیک کریں**
```bash
# دوسری terminal میں
cd frontend
npm run dev
```

Browser console میں دیکھے گا:
```
Socket connected: abc123...
User user_id joined room with socket abc123...
```

### **Step 3: Real-Time Test**
1. **دو browsers/tabs میں users کو login کریں**
   - Tab 1: User A (logged in)
   - Tab 2: User B (logged in)

2. **User A کی post پر User B like کرے**
   ```
   ✅ User B: Like button دبائے
   ⚡ User A: فوری notification دیکھے بغیر refresh کیے
   📍 Notification counter + 1
   ```

3. **User B User A کو follow کرے**
   ```
   ✅ User B: Follow button دبائے
   ⚡ User A: فوری "You have a new follower" notification
   ```

4. **User B User A کی post پر comment کرے**
   ```
   ✅ User B: Comment type کریں اور submit کریں
   ⚡ User A: فوری comment notification
   ```

---

## Files Modified:

**Backend:**
- [src/app.js](src/app.js) - Socket.io server setup
- [src/model/notification.js](src/model/notification.js) - Schema update
- [src/router/like.js](src/router/like.js) - Socket emit
- [src/router/comment.js](src/router/comment.js) - Socket emit
- [src/router/user.js](src/router/user.js) - Follow socket
- [src/router/post.js](src/router/post.js) - Comment socket

**Frontend:**
- [src/App.jsx](src/App.jsx) - SocketProvider wrap
- [src/context/SocketContext.jsx](src/context/SocketContext.jsx) - Socket setup
- [src/pages/Notifications.jsx](src/pages/Notifications.jsx) - Listen events
- [src/components/Sidebar.jsx](src/components/Sidebar.jsx) - Badge update

---

## اگر کام نہیں کر رہا:

### 🔴 Backend console میں error آ رہی ہو:
```bash
# Backend logs check کریں
cd backend
npm run dev  # Development mode میں بہتر error messages
```

### 🔴 Socket connection fail ہو:
1. Check: کیا backend port 3000 پر run کر رہا ہے?
2. Check: کیا frontend URL صحیح ہے? (`BASE_URL` in constants.js)
3. Browser console میں networks tab check کریں

### 🔴 Notification نہیں دیکھ رہا:
1. دونوں users logged in ہیں؟
2. Frontend browser console میں socket events visible ہیں?
3. MongoDB میں notifications create ہو رہے ہیں?

---

## Database میں Verify کریں:

```javascript
// MongoDB میں یہ command چلائیں:
db.notifications.findOne({ type: 'like' })

// Output ہونا چاہیے:
{
  _id: ObjectId(...),
  recipient: ObjectId(...),
  sender: ObjectId(...),
  type: "like",
  post: ObjectId(...),
  read: false,
  createdAt: ISODate(...),
  updatedAt: ISODate(...)
}
```

---

## Features خلاصہ:

| Feature | Status | Details |
|---------|--------|---------|
| Like Notifications | ✅ | Real-time + socket emit |
| Comment Notifications | ✅ | Real-time + socket emit |
| Follow Notifications | ✅ | Real-time + socket emit |
| Reply Notifications | ✅ | Real-time + socket emit |
| Unread Badge | ✅ | Real-time counter |
| Toast Messages | ✅ | New notification alert |
| Auto Reconnection | ✅ | Disconnect/reconnect handling |
| Database Persistence | ✅ | All notifications saved |

---

## اگلے Steps (Optional):

1. **Sound Alert:** Notification sound add کریں
2. **Browser Notifications:** Push notifications
3. **Typing Indicator:** "Someone is typing..." message
4. **Read Receipts:** پیچھے جانکاری قبول کریں

---

**Version**: 1.0 - Real-Time Notifications Complete  
**Last Updated**: March 31, 2026  
**Status**: ✅ Production Ready
