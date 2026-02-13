# 🚀 Quick Start Guide
## MVG Voting System - Get Running in 15 Minutes

---

## ⚡ Super Quick Setup Checklist

- [ ] Node.js installed
- [ ] Google Sheet created with 2 tabs (Contestants, Votes)
- [ ] Google Sheets API enabled
- [ ] Service account created
- [ ] Credentials JSON downloaded
- [ ] Sheet shared with service account email
- [ ] Project files downloaded
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured
- [ ] `credentials.json` placed in `backend/config/`
- [ ] Logo and banner images added to `frontend/assets/`
- [ ] Server started (`npm start`)

---

## 📝 Minimal Setup Steps

### 1. Create Google Sheet (2 minutes)

**Create new sheet with these exact tabs:**

**Tab 1: "Contestants"** (Header row + sample data)
```
ID  | Name          | Description   | Active | Image URL
1   | John Doe      | Senior Rep    | TRUE   |
2   | Jane Smith    | Junior Rep    | TRUE   |
```

**Tab 2: "Votes"** (Header row only, data added automatically)
```
Timestamp | Name | Email | Mobile | ContestantID | IPAddress
```

**Get your Sheet ID:**
```
https://docs.google.com/spreadsheets/d/[COPY_THIS_PART]/edit
```

---

### 2. Google Cloud Setup (5 minutes)

1. Go to: https://console.cloud.google.com/
2. Create project → Enable "Google Sheets API"
3. Create Service Account:
   - IAM & Admin → Service Accounts → Create
   - Name: "voting-service"
   - Role: "Editor"
   - Create Key → JSON → Download

4. **Copy the service account email** (from JSON file):
   ```
   voting-service@project-id.iam.gserviceaccount.com
   ```

5. **Share your Google Sheet** with this email (Editor access)

---

### 3. Project Setup (5 minutes)

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Edit .env:**
```env
PORT=3000
GOOGLE_SHEET_ID=paste_your_sheet_id_here
ADMIN_PASSWORD=ChooseSecurePassword123
```

**Add credentials:**
1. Rename downloaded JSON to `credentials.json`
2. Move to: `backend/config/credentials.json`

---

### 4. Add Branding (2 minutes)

Place your images in `frontend/assets/`:

**Required:**
- `logo.png` - Your school logo (200x200px recommended, transparent background)
  - This appears in the center of all pages

**Optional but Recommended:**
- `building.jpg` - Your school building photo (1920x1080px or higher)
  - Used as subtle background (8% opacity)
  - Makes the design more premium
  - Use the beautiful architectural photo of MVG Foundation Colleges

**Note:** The banner is now designed with CSS (green gradient with text) instead of using a banner image. This looks more modern and eye-catching!

---

### 5. Launch! (1 minute)

```bash
npm start
```

**Access:**
- Voting: http://localhost:3000
- Results: http://localhost:3000/results.html
- Admin: http://localhost:3000/admin.html

---

## 🎯 First Tasks After Launch

### Test the System

1. **Vote as a user:**
   - Go to http://localhost:3000
   - Fill in test data
   - Vote for a contestant
   - Check redirect to results

2. **Check Google Sheet:**
   - Open your "Votes" sheet
   - Verify the vote was recorded

3. **Try duplicate vote:**
   - Use same email/mobile
   - Should be rejected

4. **Access admin panel:**
   - Go to /admin.html
   - Login with your password
   - Add/edit contestants
   - View voters list
   - Export CSV

---

## 🔧 Common First-Time Issues

### "Authentication Failed"
- ✅ Check `credentials.json` location
- ✅ Verify service account has Sheet access
- ✅ Ensure API is enabled

### "Contestants Not Loading"
- ✅ Sheet names must be exactly "Contestants" and "Votes"
- ✅ Active column must say "TRUE" or "FALSE" (uppercase)
- ✅ Check GOOGLE_SHEET_ID in .env

### "Cannot Submit Vote"
- ✅ Check internet connection
- ✅ Verify mobile number is 11 digits starting with 09
- ✅ Check email format

---

## 📱 Testing on Mobile

1. Find your local IP:
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

2. Access from phone:
```
http://YOUR_IP_ADDRESS:3000
```

Example: `http://192.168.1.100:3000`

**Note:** Phone must be on same WiFi network

---

## 🎨 Quick Customization

### Change Colors
Edit `frontend/css/styles.css`:
```css
:root {
    --primary-green: #2D5F2E;   /* Your color here */
}
```

### Change Title
Edit `frontend/index.html`:
```html
<h1>Student Representative Voting</h1>
<!-- Change to your event name -->
```

### Modify Mobile Format
Edit `backend/routes/vote.js` if not using Philippine format (09XXXXXXXXX)

---

## 📊 Understanding Your Data

### In Google Sheets

**Contestants Sheet:**
- Add rows to add candidates
- Set Active to FALSE to hide (don't delete!)
- IDs must be unique numbers

**Votes Sheet:**
- View all votes in real-time
- Each row = one vote
- Email/Mobile checked for duplicates

### In Admin Panel

- **Overview:** Summary statistics
- **Contestants:** CRUD operations
- **Voters:** Lead generation export

---

## 🚀 Going Live Checklist

Before making it public:

- [ ] Test with multiple devices
- [ ] Try duplicate vote scenarios
- [ ] Verify all contestants show correctly
- [ ] Test admin panel completely
- [ ] Export CSV to verify data format
- [ ] Change default admin password
- [ ] Add your actual logo and banner
- [ ] Test on slow connection
- [ ] Share with 2-3 people for beta test
- [ ] Set up backup of Google Sheet
- [ ] Document your admin password securely

---

## 🆘 Need Help?

### Step-by-step debugging:

1. **Check console logs:**
```bash
npm start
# Watch for error messages
```

2. **Test Google Sheets connection:**
- Can you manually edit the sheet?
- Is the service account email showing in "Share" list?

3. **Verify environment:**
```bash
# In backend/ folder, check if credentials.json exists:
ls config/credentials.json

# Check .env file exists:
cat .env
```

4. **Test API directly:**
```bash
# In browser, try:
http://localhost:3000/api/health
http://localhost:3000/api/contestants
```

---

## 🎉 You're Ready!

Your voting system should now be running. 

**Next steps:**
1. Share voting link with students
2. Monitor results in real-time
3. Export voter data for follow-ups
4. Customize further as needed

**Pro Tips:**
- Keep Google Sheet as backup
- Export CSV regularly
- Monitor for suspicious voting patterns
- Engage voters with live result updates

---

## 📞 Quick Reference

**Default URLs:**
- Voting: `http://localhost:3000/`
- Results: `http://localhost:3000/results.html`
- Admin: `http://localhost:3000/admin.html`

**Default Files to Check:**
- Credentials: `backend/config/credentials.json`
- Environment: `.env`
- Logo: `frontend/assets/logo.png`
- Banner: `frontend/assets/banner.png`

**Google Sheet Structure:**
- Tab 1: "Contestants" (5 columns: ID, Name, Description, Active, Image URL)
- Tab 2: "Votes" (6 columns: Timestamp, Name, Email, Mobile, ContestantID, IPAddress)

---

**Happy Voting! 🗳️ Good luck with your election!**

*Questions? Check README.md for detailed documentation.*