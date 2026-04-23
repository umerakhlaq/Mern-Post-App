# Broadcast Feature - Complete Guide

## کیا ہے Broadcast؟
**Broadcast** ایک admin feature ہے جو **تمام users کو فوری پیغام بھیجتا ہے**۔ یہ database میں `Notification` collection میں save ہوتا ہے۔

---

## Database Flow

```
Admin sends Broadcast
    ↓
Backend creates Notification for EACH user with:
  - recipient: user._id
  - sender: admin._id
  - type: "broadcast"
  - title: "[Admin's title]"
  - message: "[Admin's message]"
    ↓
Users see it in Notifications page with amber "ADMIN BROADCAST" label
```

---

## کیسے کام کرتا ہے؟

### 1️⃣ **Admin Dashboard میں Broadcast بھیجنا**
- Admin Dashboard پر "Broadcast" button (megaphone icon) دبائیں
- **Title** prompt میں name درج کریں
- **Message** prompt میں full description مکمل کریں
- "OK" دبائیں - broadcast ہو جائے گا

### 2️⃣ **User کو Broadcast ملنا**
- User اپنے **Notifications** page پر جائے
- Broadcast دیکھے گا:
  ```
  🔴 ADMIN BROADCAST
  [Title]
  [Message]
  ```

---

## Testing Checklist

### ✅ Backend Side
- [ ] Database connected (`mongodb+srv://...`)
- [ ] Backend server running (`npm start` یا `npm run dev`)
- [ ] Notification schema میں `title`, `message`, `sender` fields ہیں

### ✅ Frontend Side
- [ ] Frontend running (`npm run dev`)
- [ ] Admin logged in (email: `admin@vibe.com`, password: `AdminPassword@123`)
- [ ] Broadcast button دیکھ سکتے ہیں Admin Dashboard پر

### ✅ Complete Test
1. Admin: Broadcast button → Title + Message → Send
2. User: Refresh browser → Notifications page
3. User: ADMIN BROADCAST visible with title & message
4. Check console for errors if not showing

---

## Data Structure میں Database

```javascript
{
  "_id": ObjectId,
  "recipient": ObjectId("user_id"),
  "sender": ObjectId("admin_id"),
  "type": "broadcast",
  "title": "Important Update",
  "message": "System maintenance at 2 PM",
  "read": false,
  "createdAt": "2026-03-31T...",
  "updatedAt": "2026-03-31T..."
}
```

---

## اگر Broadcast نظر نہیں آ رہا تو:

### 🔴 Problem 1: Backend نہ چل رہی ہو
```bash
cd backend
npm install
npm start
# یا development mode میں:
npm run dev
```

### 🔴 Problem 2: Frontend cache
```bash
# Browser console میں:
F12 → Application → Local Storage → Clear All
# پھر refresh کریں
```

### 🔴 Problem 3: Verify in MongoDB
```
Notifications collection میں type: "broadcast" والے records ہیں؟
```

### 🔴 Problem 4: Check API Response
```bash
# Browser console میں fetch test:
fetch('http://localhost:5000/admin/broadcast', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ 
    title: 'Test', 
    message: 'Testing broadcast'
  })
}).then(r => r.json()).then(console.log)
```

---

## Code Files

- **Backend Route**: `backend/src/router/admin.js` (lines 196-213)
- **Notification Model**: `backend/src/model/notification.js`
- **Frontend Display**: `frontend/src/pages/Notifications.jsx` (lines 174-181)
- **Admin Send**: `frontend/src/pages/AdminDashboard.jsx` (lines 235-251)

---

## فائدے

✅ System announcements بھیج سکتے ہو  
✅ تمام users کو فوری notify کر سکتے ہو  
✅ Emergency messages بھیج سکتے ہو  
✅ Account updates announce کر سکتے ہو  

---

**Version**: 1.0 - Complete Broadcast Feature  
**Last Updated**: March 31, 2026
