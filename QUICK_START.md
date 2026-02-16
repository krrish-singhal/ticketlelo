# 🚀 TicketLelo - Quick Start Guide

## Step-by-Step Setup (5 Minutes)

### Step 1: Firebase Setup (2 minutes)

1. **Update Firestore Rules**:
   - Go to https://console.firebase.google.com/
   - Select project: `ticketlelo-18bcd`
   - Click **Firestore Database** → **Rules** tab
   - Replace with:

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```

   - Click **Publish**

**Note:** Firebase Storage is NOT needed - PDFs are generated dynamically on-demand!

## 📧 EmailJS Setup (Optional but Recommended)

**If you want email notifications, follow these steps:**

1. **Go to [EmailJS Dashboard](https://dashboard.emailjs.com/)**
2. **Check your Email Service**:
   - Go to **Email Services** → Find your Gmail service
   - If showing "Reconnect Required" → Click **Reconnect**
   - Authorize Gmail access again

3. **Verify Email Template** (template ID: `template_l0mpkpw`):
   - Go to **Email Templates** → Find your template
   - Ensure it includes these variables:
     ```
     To: {{to_email}}
     Subject: Your Ticket for {{event_name}}
     
     Hi {{to_name}},
     
     Thank you for registering for {{event_name}}!
     
     Your ticket is ready. Click the link below to download:
     {{ticket_download_url}}
     
     Ticket ID: {{ticket_id}}
     
     See you at the event!
     ```

4. **Test the Service**: 
   - Go to **Email Services** → **Test**
   - Send a test email to verify it works

**If EmailJS fails**: Don't worry! Users can still register and download tickets from the dashboard.

---

### Step 2: Create Admin User (1 minute)

1. Go to Firebase Console → **Firestore Database**
2. Click **Start collection**
3. Collection ID: `users`
4. Document ID: **Use any string** (will be replaced later)
5. Add fields:
   ```
   email: "admin@ticketlelo.com"
   fullName: "Admin User"
   whatsappPhone: "+1234567890"
   isAdmin: true
   createdAt: (click clock icon for timestamp)
   ```
6. Click **Save**

7. Go to **Authentication** → **Users** → **Add user**
   - Email: `admin@ticketlelo.com`
   - Password: `admin123` (or your choice)
   - Click **Add user**

8. **IMPORTANT**: Copy the **User UID** from Authentication
9. Go back to Firestore → `users` collection
10. **Update** your document ID to match the User UID:
    - Click the three dots on the document → **Delete document**
    - Click **Add document**
    - Document ID: **Paste the User UID from Authentication**
    - Add the same fields again:
      ```
      id: (paste the same UID here)
      email: "admin@ticketlelo.com"
      fullName: "Admin User"
      whatsappPhone: "+1234567890"
      isAdmin: true
      createdAt: (click clock icon for timestamp)
      ```
    - Click **Save**

---

### Step 3: Start the App (1 minute)

```bash
cd /home/krrish/Desktop/TicketLelo/ticketlelo
npm run dev
```

Open: http://localhost:3000

---

## 🎯 Test the Flow

### Test 1: Create an Event (Admin)

1. Go to http://localhost:3000/login
2. Login with admin credentials:
   - Email: `admin@ticketlelo.com`
   - Password: `admin123`
3. You'll be redirected to `/admin/dashboard`
4. Fill out the form:
   - Name: "Tech Conference 2026"
   - Description: "Annual technology conference"
   - Date: Select any future date
   - Location: "Convention Center"
   - Total Tickets: 100
   - Check "Active"
5. Click **Create Event**
6. Event appears in the list below

---

### Test 2: Create a Batch (Admin)

1. Click **Batches** in the sidebar
2. Select event: "Tech Conference 2026"
3. Fill out form:
   - Batch Name: "Morning Session"
   - Start Date: Same as event date
   - End Date: Same as event date
   - Max Tickets: 50
   - Status: Active
4. Click **Create Batch**
5. Batch appears in the list

---

### Test 3: Register for Event (Public User)

1. **Open in incognito/private window** OR logout from admin
2. Go to http://localhost:3000
3. You should see "Tech Conference 2026" displayed as an event card with:
   - Event name, description
   - Date, location, total tickets
   - "Register Now" button
4. Click **Register Now** on the event card
5. Fill out registration form:
   - Full Name: "John Doe"
   - Email: "john@example.com"
   - WhatsApp: "+1234567890"
   - Event: Pre-selected as "Tech Conference 2026"
   - Select Batch: "Morning Session"
   - Message: "Looking forward to it!"
6. Click **Register Now**

**Expected Result**:

- ✅ Success toast appears  
- ✅ Registration saved in Firestore
- ✅ Email sent with ticket download link
- ✅ User can access ticket from dashboard

**Note**: If you get an EmailJS error about "Invalid grant", go to [EmailJS Dashboard](https://dashboard.emailjs.com/) → Integrations → Reconnect your Gmail account.

---

### Test 4: View User Dashboard

1. Still in the same window (or stay logged out)
2. Click **Already registered? View your tickets** link
3. Go to `/login`
4. Login with:
   - Email: `john@example.com`
   - Password: The random password created during registration

**Problem**: You don't know the password!

**Solution**: User should use the ticket PDF from email. To test dashboard:

**Option A - Create user manually**:

1. Logout from admin
2. Go to http://localhost:3000/login
3. Click "Register here" (goes to homepage)
4. Register again with different email
5. Use forgot password to set known password
6. Login and view dashboard

**Option B - Set password in Firebase**:

1. Go to Firebase Console → Authentication
2. Find user with email `john@example.com`
3. Click three dots → Reset password
4. Set password: `test123`
5. Now login with `john@example.com` / `test123`

After login:

- ✅ See ticket card with event details
- ✅ QR code displayed
- ✅ Download PDF button works
- ✅ Status shows "Unused"

---

### Test 5: View Registrations (Admin)

1. Login as admin
2. Go to `/admin/registrations`
3. Select event: "Tech Conference 2026"
4. Select batch: "Morning Session" (optional)
5. See John Doe's registration
6. Search for "john" - registration appears
7. Click **Export to Excel**
8. Excel file downloads with all registration data

---

### Test 6: Scan QR Code (Admin)

1. Login as admin
2. Go to `/admin/scanner`
3. Click **Use Manual Entry** (easier for testing)
4. Enter the Ticket ID (from John's ticket PDF)
   - Format: `TKT-xxxxxx`
5. Click **Validate Ticket**

**Expected Result**:

- ✅ Green success message
- ✅ Shows ticket details and user info
- ✅ Status changes to "Used"
- ✅ Shows "Ticket scanned successfully"

**Test Re-scan**:

1. Try scanning same ticket again
2. Should show error: "This ticket has already been used"

---

## 📊 Expected Outputs Summary

### ✅ **Public Homepage**

- Shows active events as cards in a grid layout
- Each card displays event name, description, date, location, and ticket count
- Click "Register Now" on any event card to open registration form
- Registration form pre-selects the chosen event
- Can go back to event list from registration form

### ✅ **After Registration**

- Toast: "Registration successful! Check your email for your ticket link."
- Email sent with download link to user
- User can also access ticket from dashboard

### ✅ **User Dashboard** (`/dashboard`)

- Shows all user's tickets
- QR code visible on each
- Download PDF button works
- Filter by status works

### ✅ **Admin Dashboard** (`/admin/dashboard`)

- Create/edit/delete events
- Events toggle active/inactive
- Created events appear on public page

### ✅ **Admin Batches** (`/admin/batches`)

- Create/edit/delete batches
- Batches linked to events
- Appear in registration form dropdown

### ✅ **Admin Registrations** (`/admin/registrations`)

- View all registrations by event
- Filter by batch
- Search by name/email/phone/ticket ID
- Export to Excel works
- Shows stats (total, used, unused)

### ✅ **Admin Scanner** (`/admin/scanner`)

- Camera scanner opens (or manual entry)
- Validates tickets
- Marks as "Used"
- Shows ticket details
- Prevents duplicate scans
- Shows scan history

---

## ⚠️ Quick Fixes

### If Admin Panel Redirects to Login:

1. Check Firestore → `users` collection
2. Find your user document (ID must match Firebase Auth UID)
3. Ensure field `isAdmin: true` exists

### If Registration Fails:

1. Check browser console for errors
2. Most likely: Firestore rules not updated
3. Go to Firebase → Firestore → Rules → use open rules above

### If Email Not Sending:

1. **Gmail API Error**: Go to [EmailJS Dashboard](https://dashboard.emailjs.com/)
   - Click **Integrations** → **Gmail**
   - Click **Reconnect** to refresh the Gmail API connection
2. **Check Template**: Ensure your EmailJS template uses these variable names:
   - `{{to_email}}` - Recipient email
   - `{{to_name}}` - Recipient name  
   - `{{event_name}}` - Event name
   - `{{ticket_download_url}}` - Download link
   - `{{ticket_id}}` - Ticket ID
3. **Check Service**: Verify your EmailJS service is active
4. **Backup**: If email fails, users can still download tickets from dashboard

### If PDF Not Downloading:

1. Check API route: `/api/generate-ticket/[ticketId]`
2. Check browser console for errors
3. Verify registration exists in Firestore
4. Verify `NEXT_PUBLIC_APP_URL` is set in `.env.local`

**Note:** PDFs are generated dynamically on-demand - no storage needed!

---

## 🎉 You're Ready!

Your TicketLelo app should now be fully functional with:

- ✅ Public event registration
- ✅ Ticket generation with QR codes
- ✅ Email delivery
- ✅ User dashboard
- ✅ Admin management panel
- ✅ QR code scanner

**Next Steps**:

1. Test all features thoroughly
2. Update security rules for production (see `firestore.rules`)
3. Configure EmailJS for production emails
4. Deploy to Vercel/Netlify
5. Share with users!

---

**Need Help?** Check `PROJECT_FLOW.md` for detailed documentation.
