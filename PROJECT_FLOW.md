# TicketLelo - Complete Project Flow

## 📋 Overview

TicketLelo is an event ticketing platform with QR code generation, PDF tickets, email delivery, and admin management.

---

## 🔄 Complete User Flow

### 1️⃣ **Public Landing Page** (`/`)

**Purpose**: Event registration for anyone (no login required)

**Flow**:

1. User visits the homepage
2. Sees list of active events
3. Fills out registration form:
   - Full Name
   - Email Address
   - WhatsApp Phone Number
   - Selects Event
   - Selects Batch (if available)
   - Optional Message
4. Clicks "Register Now"

**What Happens**:

- Creates a Firebase user account automatically (with random password)
- Generates unique Ticket ID
- Creates QR code for the ticket
- Generates PDF ticket with QR code
- Uploads PDF to Firebase Storage
- Sends email with ticket PDF attachment
- Stores registration in Firestore
- User can download ticket immediately

**Files Involved**:

- `src/app/(public)/page.jsx` - Landing page
- `components/forms/registration-form.jsx` - Registration form
- `lib/auth.js` - User creation (`signup` function)
- `lib/tickets.js` - Ticket generation
- `lib/qr.js` - QR code generation
- `lib/email.js` - Email sending
- `lib/firestore.js` - Database operations

---

### 2️⃣ **User Login** (`/login`)

**Purpose**: Existing users can login to view their tickets

**Flow**:

1. User clicks "Already registered?" on homepage OR visits `/login`
2. Enters email and password
3. Clicks "Sign In"
4. Redirected to `/dashboard`

**Note**: For users who registered via the public form:

- They DON'T know their password (it's random)
- They can still access their ticket via email
- For dashboard access, they need to use password reset

**Files Involved**:

- `src/app/(auth)/login/page.jsx` - Login page
- `lib/auth.js` - Login function
- `context/auth-context.jsx` - Auth state management

---

### 3️⃣ **User Dashboard** (`/dashboard`)

**Purpose**: Show all tickets for logged-in user

**Flow**:

1. After login, user lands here
2. Sees all their event registrations
3. Can filter by status: All / Used / Unused
4. Each ticket shows:
   - Event name, date, location
   - QR code image
   - Download button for PDF
   - Status badge (Used/Unused)
   - Timestamp when used (if applicable)
5. Can logout

**Files Involved**:

- `src/app/(user)/dashboard/page.jsx` - Dashboard page
- `components/dashboard/ticket-card.jsx` - Ticket display
- `lib/firestore.js` - Fetch user registrations

---

### 4️⃣ **Admin Panel Access** (`/admin/*`)

**Purpose**: Admin users manage events, batches, registrations, and scan tickets

**Access Requirements**:

1. User must be logged in
2. User's Firestore document must have `isAdmin: true`

**Admin Pages**:

#### A. **Events Management** (`/admin/dashboard`)

- Create new events (name, description, date, location, total tickets)
- View all events
- Edit existing events
- Delete events
- Toggle active/inactive status

#### B. **Batch Management** (`/admin/batches`)

- Select an event
- Create batches (name, start date, end date, max tickets)
- Edit batches
- Delete batches
- Toggle active/inactive status

#### C. **Registrations** (`/admin/registrations`)

- Select event and batch (optional)
- View all registrations
- Search by name, email, phone, ticket ID
- See statistics (total, used, unused)
- Export to Excel with all registration data

#### D. **QR Scanner** (`/admin/scanner`)

- Scan QR code using camera
- Manual ticket ID entry option
- Validates ticket
- Marks ticket as "Used"
- Shows ticket details and user info
- Prevents double scanning
- Shows scan history

**Files Involved**:

- `src/app/admin/layout.jsx` - Admin sidebar layout
- `src/app/admin/dashboard/page.jsx` - Events page
- `src/app/admin/batches/page.jsx` - Batches page
- `src/app/admin/registrations/page.jsx` - Registrations page
- `src/app/admin/scanner/page.jsx` - Scanner page
- `components/admin/event-management.jsx` - Event CRUD
- `components/admin/batch-management.jsx` - Batch CRUD
- `components/admin/registration-management.jsx` - View registrations
- `components/admin/qr-scanner.jsx` - QR scanning logic
- `components/admin/html5-qrcode-plugin.jsx` - Camera scanner
- `middleware.js` - Admin route protection

---

## 🗃️ Database Structure (Firestore)

### **Collections**:

#### 1. `users`

```javascript
{
  id: "user-uid",
  email: "user@example.com",
  fullName: "John Doe",
  whatsappPhone: "+1234567890",
  createdAt: Timestamp,
  isAdmin: false  // Set to true for admin access
}
```

#### 2. `events`

```javascript
{
  id: "event-id",
  name: "Tech Conference 2026",
  description: "Annual tech conference",
  date: "2026-03-15",
  location: "Convention Center",
  totalTickets: 500,
  isActive: true,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### 3. `batches`

```javascript
{
  id: "batch-id",
  eventId: "event-id",
  name: "Morning Batch",
  startDate: "2026-03-15",
  endDate: "2026-03-15",
  maxTickets: 100,
  isActive: true,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### 4. `registrations`

```javascript
{
  id: "registration-id",
  ticketId: "TKT-ABC123",
  userId: "user-uid",
  eventId: "event-id",
  batchId: "batch-id" || null,
  fullName: "John Doe",
  email: "user@example.com",
  whatsappPhone: "+1234567890",
  message: "Looking forward to it!" || "",
  status: "Unused" || "Used",
  qrCodeUrl: "https://...",
  ticketPdfUrl: "https://...",
  createdAt: Timestamp,
  usedAt: Timestamp || null
}
```

---

## 🔐 Firebase Security Rules

**IMPORTANT**: You must set up Firestore security rules for the app to work!

See `firestore.rules` file for production-ready rules.

For **quick testing** (NOT FOR PRODUCTION):

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

---

## 📧 Email Configuration

Uses **EmailJS** to send ticket emails. Required environment variables:

```env
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
```

**Email Template** should include:

- `{{fullName}}` - Recipient name
- `{{eventName}}` - Event name
- `{{ticketId}}` - Ticket ID
- `{{ticketPdfUrl}}` - Download link
- `{{message}}` - Custom message

---

## 🎯 Expected Outputs

### For Users:

1. **Registration Success**:
   - Toast notification: "Registration successful! Check your email."
   - PDF ticket downloaded automatically
   - Email received with ticket attachment
   - QR code visible on ticket

2. **Dashboard View**:
   - All registered events displayed as cards
   - QR code visible on each card
   - Download PDF button works
   - Status shows "Used" or "Unused"

### For Admins:

1. **Event Management**:
   - Can create, edit, delete events
   - Events appear in public registration form

2. **Batch Management**:
   - Can create batches linked to events
   - Batches appear in registration form dropdown

3. **Registrations View**:
   - See all registrations filtered by event/batch
   - Export Excel with all data
   - Search functionality works

4. **QR Scanner**:
   - Camera opens and scans QR codes
   - Ticket validated immediately
   - Status changes from "Unused" to "Used"
   - Cannot scan same ticket twice
   - Manual entry works for backup

---

## 🚀 How to Run

### 1. Install Dependencies

```bash
cd /home/krrish/Desktop/TicketLelo/ticketlelo
npm install
```

### 2. Configure Firebase

- Create project at https://console.firebase.google.com/
- Enable Authentication (Email/Password)
- Enable Firestore Database
- Enable Storage
- Update `.env` with your Firebase config

### 3. Setup EmailJS

- Create account at https://www.emailjs.com/
- Create email service and template
- Update `.env` with EmailJS credentials

### 4. Update Firestore Rules

- Go to Firebase Console → Firestore → Rules
- Copy content from `firestore.rules` OR use test rules above
- Publish rules

### 5. Create Admin User

**Method 1 - Via Registration**:

1. Register a user via the public form
2. Go to Firebase Console → Firestore → `users` collection
3. Find your user document
4. Add field: `isAdmin: true`

**Method 2 - Manual Creation**:

1. Firebase Console → Firestore → `users` collection
2. Add document with ID = your email as USER ID
3. Fields:
   ```
   email: "admin@example.com"
   fullName: "Admin User"
   whatsappPhone: "+1234567890"
   isAdmin: true
   createdAt: (timestamp)
   ```
4. Firebase Console → Authentication → Add user manually
5. Use same email and set password

### 6. Start Development Server

```bash
npm run dev
```

Server starts at: `http://localhost:3000`

### 7. Test Flow

#### Test User Flow:

1. Go to `http://localhost:3000`
2. Create an event first (need admin access)
3. Register for event via public form
4. Check email for ticket PDF
5. Login with email at `/login`
6. View tickets at `/dashboard`

#### Test Admin Flow:

1. Login as admin user
2. Go to `/admin/dashboard`
3. Create an event
4. Go to `/admin/batches` and create batches
5. Go to `/admin/registrations` to view registrations
6. Go to `/admin/scanner` to scan QR codes

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Missing or insufficient permissions"

**Solution**: Update Firestore security rules (see above)

### Issue 2: Admin panel redirects to login

**Solution**: Set `isAdmin: true` in user's Firestore document

### Issue 3: Email not sending

**Solution**:

- Check EmailJS credentials in `.env`
- Verify email template exists
- Check EmailJS dashboard for quota limits

### Issue 4: QR scanner not working

**Solution**:

- Use HTTPS (required for camera access)
- For local testing: `localhost` works
- Grant camera permissions in browser

### Issue 5: PDF not generating

**Solution**:

- Check Firebase Storage rules (allow write)
- Verify Firebase Storage is enabled

---

## 📱 Production Deployment

1. **Build the app**:

   ```bash
   npm run build
   ```

2. **Deploy to Vercel/Netlify**:
   - Add environment variables
   - Connect GitHub repo
   - Deploy

3. **Production Checklist**:
   - ✅ Update Firestore rules (use secure rules from `firestore.rules`)
   - ✅ Update Firebase Storage rules
   - ✅ Configure custom domain
   - ✅ Test email sending
   - ✅ Test QR scanning on mobile
   - ✅ Create admin accounts
   - ✅ Remove test data

---

## 🎨 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: JavaScript (JSX)
- **Styling**: Tailwind CSS
- **UI Components**: Custom shadcn/ui components
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **Forms**: react-hook-form + zod
- **QR Codes**: qrcode library
- **PDF**: jspdf
- **Excel**: xlsx
- **Email**: emailjs-com
- **QR Scanner**: html5-qrcode

---

## 📞 Support

For issues or questions about the flow, check:

1. Browser console for errors
2. Firebase Console → Firestore for data
3. Firebase Console → Storage for PDFs
4. EmailJS Dashboard for email logs

---

**Project Status**: ✅ Complete and Ready for Testing
