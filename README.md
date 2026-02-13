# Manuel V Gallego Foundation Colleges
## Voting + Lead Generation System

A lightweight, mobile-first voting system using Google Sheets as the database. Perfect for student elections, contests, and surveys with built-in lead generation capabilities.

---

## 🌟 Features

- ✅ **Mobile-First Design** - Optimized for phones and slow connections
- ✅ **Google Sheets Database** - No complex database setup required
- ✅ **Vote Restrictions** - One vote per email/mobile number
- ✅ **Live Results** - Real-time vote counting with progress bars
- ✅ **Admin Panel** - Manage contestants and view voter data
- ✅ **Lead Generation** - Collect and export voter information
- ✅ **Duplicate Prevention** - Built-in validation against duplicate votes
- ✅ **CSV Export** - Export voter data for marketing purposes

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **Google Account** - For Google Sheets access
- **Text Editor** - VS Code, Sublime, or any code editor

---

## 🚀 Setup Instructions

### Step 1: Google Sheets Setup

#### 1.1 Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it: "MVG Voting System"
4. Create two sheets (tabs):

**Sheet 1: Contestants**
```
| ID | Name | Description | Active | Image URL |
|----|------|-------------|--------|-----------|
| 1  | John Doe | Senior Rep | TRUE | |
| 2  | Jane Smith | Junior Rep | TRUE | |
```

**Sheet 2: Votes**
```
| Timestamp | Name | Email | Mobile | ContestantID | IPAddress |
|-----------|------|-------|--------|--------------|-----------|
```

5. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[THIS_IS_YOUR_SPREADSHEET_ID]/edit
   ```

#### 1.2 Enable Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: "MVG Voting System"
3. Enable the **Google Sheets API**:
   - Click "Enable APIs and Services"
   - Search for "Google Sheets API"
   - Click "Enable"

#### 1.3 Create Service Account

1. In Google Cloud Console, go to "IAM & Admin" → "Service Accounts"
2. Click "Create Service Account"
3. Name: "mvg-voting-service"
4. Grant role: "Editor"
5. Click "Done"
6. Click on the service account you just created
7. Go to "Keys" tab
8. Click "Add Key" → "Create New Key"
9. Choose "JSON"
10. Download the JSON file

#### 1.4 Share Spreadsheet with Service Account

1. Open your Google Sheet
2. Click "Share" button
3. Copy the service account email from the JSON file (looks like: `mvg-voting-service@project-id.iam.gserviceaccount.com`)
4. Paste it in the share dialog
5. Give "Editor" permission
6. Uncheck "Notify people"
7. Click "Share"

---

### Step 2: Project Setup

#### 2.1 Download and Install

```bash
# Navigate to your project folder
cd mvg-voting-system

# Install dependencies
npm install
```

#### 2.2 Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` file with your credentials:
```env
PORT=3000
NODE_ENV=development
GOOGLE_SHEET_ID=your_spreadsheet_id_here
ADMIN_PASSWORD=your_secure_password_here
```

#### 2.3 Add Google Credentials

1. Rename your downloaded JSON credentials file to `credentials.json`
2. Place it in: `backend/config/credentials.json`

**Important:** Never commit `credentials.json` to version control!

---

### Step 3: Add Your Branding

#### 3.1 Logo (Required)

1. Place your logo in: `frontend/assets/logo.png`
   - Recommended size: 200x200px (or 400x400px for retina)
   - Format: PNG with transparent background
   - Use the circular MVGFC logo

#### 3.2 Building Background (Optional but Recommended)

1. Place building photo in: `frontend/assets/building.jpg`
   - Recommended size: 1920x1080px or higher
   - Format: JPG (compressed to under 500KB)
   - Use your campus architectural photo
   - Appears as subtle background (8% opacity)

**Tip:** Use [TinyJPG.com](https://tinyjpg.com) to compress images

#### 3.3 Banner Design (Already Included!)

The banner is now a beautiful CSS gradient design with:
- ✅ Dynamic green gradient background
- ✅ Gold title text
- ✅ Responsive text sizing
- ✅ No image file needed!

**To customize banner text**, edit `frontend/index.html`:
```html
<div class="banner-title">🗳️ Student Representative Voting</div>
```

#### 3.4 Customize Colors (Optional)

Edit `frontend/css/styles.css` to change colors:

```css
:root {
    --primary-green: #2D5F2E;    /* Main green */
    --light-green: #4A8B4C;      /* Hover states */
    --accent-green: #7CB342;     /* Highlights */
}
```

**See DESIGN_ASSETS.md for complete asset guidelines!**

---

### Step 4: Run the Application

```bash
# Start the server
npm start

# Or for development with auto-restart:
npm run dev
```

The system will be available at:
- **Voting Form:** http://localhost:3000
- **Results Page:** http://localhost:3000/results.html
- **Admin Panel:** http://localhost:3000/admin.html

---

## 🎯 Usage Guide

### For Voters

1. Visit the voting page
2. Enter full name, email, and mobile number
3. Select one candidate
4. Submit vote
5. Automatically redirected to results page

### For Administrators

1. Go to: `/admin.html`
2. Enter admin password (set in `.env`)
3. Dashboard tabs:
   - **Overview:** Statistics and quick actions
   - **Contestants:** Add, edit, or remove candidates
   - **Voters List:** View all votes and export data

#### Adding Contestants

1. Go to "Contestants" tab
2. Click "Add New Contestant"
3. Fill in name and description
4. Set status to "Active"
5. Click "Save"

#### Exporting Voter Data

1. Go to "Voters List" tab
2. Click "Export to CSV"
3. Open CSV file in Excel or Google Sheets
4. Use for email marketing, follow-ups, etc.

---

## 📱 Mobile Optimization

The system is optimized for:
- Slow 3G/4G connections
- Small screen sizes (320px+)
- Touch-friendly buttons and inputs
- Minimal data usage

---

## 🔒 Security Features

- **Duplicate Prevention:** Email and mobile validation
- **Rate Limiting:** Prevents spam and abuse
- **Admin Authentication:** Password-protected admin panel
- **Input Validation:** Sanitized user inputs
- **XSS Protection:** HTML escaping on all outputs

---

## 🐛 Troubleshooting

### Problem: "Failed to authenticate with Google Sheets"

**Solution:**
- Verify `credentials.json` is in `backend/config/`
- Check that the service account email has access to your spreadsheet
- Ensure Google Sheets API is enabled in Google Cloud Console

### Problem: "Contestant not loading"

**Solution:**
- Check your Google Sheet structure matches exactly
- Ensure the "Active" column uses "TRUE" or "FALSE" (all caps)
- Verify the sheet names are exactly "Contestants" and "Votes"

### Problem: "Duplicate vote" error when it shouldn't be

**Solution:**
- Check for leading/trailing spaces in the Votes sheet
- Email and mobile comparisons are case-insensitive and ignore spaces

### Problem: Admin login not working

**Solution:**
- Check the `ADMIN_PASSWORD` in your `.env` file
- Clear browser cache and cookies
- Try a different browser

---

## 📊 Google Sheet Structure Details

### Contestants Sheet
- **Column A (ID):** Unique number (1, 2, 3...)
- **Column B (Name):** Contestant name
- **Column C (Description):** Optional description
- **Column D (Active):** TRUE or FALSE (must be all caps)
- **Column E (Image URL):** Optional image URL (future feature)

### Votes Sheet
- **Column A (Timestamp):** Auto-filled by system
- **Column B (Name):** Voter's full name
- **Column C (Email):** Voter's email
- **Column D (Mobile):** Voter's mobile number
- **Column E (ContestantID):** ID of voted contestant
- **Column F (IPAddress):** Voter's IP (for logging)

---

## 🚀 Deployment

### Deploy to Heroku

1. Install Heroku CLI
2. Create Heroku app:
```bash
heroku create mvg-voting
```

3. Set environment variables:
```bash
heroku config:set GOOGLE_SHEET_ID=your_id_here
heroku config:set ADMIN_PASSWORD=your_password_here
```

4. Add credentials to Heroku:
```bash
heroku config:set GOOGLE_CREDENTIALS="$(cat backend/config/credentials.json)"
```

5. Deploy:
```bash
git push heroku main
```

### Deploy to Other Platforms

The system works on any Node.js hosting:
- **Railway**
- **Render**
- **DigitalOcean App Platform**
- **AWS Elastic Beanstalk**
- **Google Cloud Run**

---

## 📈 Analytics & Marketing

### Lead Generation Tips

1. **Export regularly:** Download CSV weekly
2. **Segment voters:** Sort by contestant preference
3. **Follow-up campaigns:** Email voters after results
4. **Social proof:** Share vote counts on social media
5. **Thank you emails:** Automated post-vote communication

### Metrics to Track

- Total votes per day
- Conversion rate (visitors → voters)
- Most popular time slots
- Mobile vs desktop usage
- Contestant popularity trends

---

## 🎨 Customization Ideas

### Add Photos
Edit contestants sheet and add image URLs in column E

### Change Form Fields
Edit `frontend/index.html` to add/remove fields

### Custom Validation
Modify `backend/routes/vote.js` for custom rules

### Email Notifications
Integrate with SendGrid, Mailgun, or similar services

---

## 📞 Support

For questions or issues:
- Check the troubleshooting section above
- Review Google Sheets API documentation
- Verify all environment variables are set correctly

---

## 📄 License

MIT License - Free to use and modify for your institution

---

## 🙏 Credits

Developed for **Manuel V Gallego Foundation Colleges**

Built with ❤️ using:
- Node.js + Express
- Google Sheets API
- Vanilla JavaScript
- Modern CSS

---

**Happy Voting! 🗳️**