
# 🏕️ YelpCamp

A full-featured campground listing web application where users can browse, create, review, and manage campgrounds. Inspired by Yelp, built with Node.js and Express, now with enhanced authentication and user account management features.

Visit: [YelpCamp](https://yelpcamp-explore.vercel.app)

---

## 🚀 Features

### 🧭 Core Functionality
- User registration, login, logout with session handling
- Campground creation, editing, and deletion
- Campground image uploads (via Cloudinary or Multer)
- Reviews with star ratings
- Location maps powered by Maptiler
- Flash messages for feedback
- Responsive and mobile-friendly design (Bootstrap 5)

### 🛡️ Enhanced User Management
- Settings page for:
  - Changing username or email
  - Changing password
  - Deleting account
- OTP verification via email:
  - During registration
  - During email change
  - During forgot password flow
- Forgot **username** and **password** routes
- Secure OTP storage via session with expiry logic

---

## 📸 Screenshots

![Homepage](/demo/homepage.png)
![Register](/demo/register.png)
![All Campgrounds](/demo/index.png)
![Showpage](/demo/showpage.png)
![Settings](/demo/settings.png)


---

## 🧰 Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: EJS, Bootstrap
- **Database**: MongoDB with Mongoose
- **Authentication**: Passport.js (Local Strategy)
- **Email Verification**: OTP via Sendgrid
- **Image Uploads**: Multer + Cloudinary
- **Maps**: Maptiler API
- **Validation**: Joi + Express middleware

---

## 🔧 Setup & Installation

```bash
git clone https://github.com/Amogh04/YelpCamp.git
cd YelpCamp
npm install
````

### 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
DB_URL=mongodb://localhost:27017/yelpcamp
MAPTILER_API_KEY=your_maptiler_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
RESEND_API_KEY=your_resend_key
CLOUDINARY_SECRET=your_secret
EMAIL=your_email_address
SECRET=session_secret
```

---

## 🏁 Running the App


```bash
npm start
```

Visit: `http://localhost:3000`

---

## 🗂 Folder Structure

```
yelpcamp/
├── models/            # Mongoose schemas (User, Campground, Review)
├── controllers/            # Backend logic/function files
│   ├── campgrounds.js
│   ├── reviews.js
│   ├── users.js
├── routes/            # Modular route files
│   ├── campgrounds.js
│   ├── reviews.js
│   ├── users.js
├── views/             # EJS templates
│   ├── users/         
│   └── campgrounds/   
│   └── layouts/       # Boilerplate/Templates
│   └── partials/
├── utilities/         # ExpressError, email, otp helpers, custom middleware
├── seeds/             # Random data
├── public/            # Static files (CSS, JS)
├── app.js             # App entry point
└── .env               # Config values
└── package.json       # Packages and Dependencies
```

---

## 🧪 Notable Routes

| Route              | Description                           |
| ------------------ | ------------------------------------- |
| `/register`        | Register new users (OTP verified)     |
| `/login`           | Log in existing users                 |
| `/forgot` | Send OTP to reset password and retrieve username via email          |
| `/settings`        | Update account info or delete account |
| `/verify`          | Generic email OTP verification        |

---

## 🙋‍♂️ Contributing

Feel free to fork and submit a pull request if you'd like to improve YelpCamp. Bug fixes, feature requests, and suggestions are always welcome.


---

## 👨‍💻 Author

Built by [Amogh Jain](https://github.com/Amogh04)
