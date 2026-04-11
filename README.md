# 🔍 AI-Powered Code Reviewer & Generator

A full-stack AI tool that reviews your code for bugs, security vulnerabilities, and performance issues in real time — and generates production-ready code from plain English prompts.

**Live Demo:** https://ai-powered-code-generator-and-revie.vercel.app

---

## ✨ Features

- **AI Code Review** — Paste any code and get an instant structured review with severity scoring (Critical / High / Medium / Low)
- **AI Code Generator** — Describe what you want in plain English and get production-ready code streamed back live
- **Real-time Streaming** — Responses stream token by token using Server-Sent Events (SSE), just like ChatGPT
- **Send to Review** — One-click workflow to send generated code directly into the reviewer
- **Review History** — Every review saved per user with language breakdown and severity analytics dashboard
- **PDF Export** — Download any review as a formatted PDF report
- **JWT Authentication** — Secure register/login with per-user data isolation
- **8 Languages Supported** — JavaScript, TypeScript, Python, Java, C++, Rust, Go, and more
- **Side-by-side Layout** — Code editor with line numbers on the left, AI review on the right

---

## 🛠️ Tech Stack

**Frontend**
- React + Vite
- Tailwind CSS
- React Router DOM
- React Hot Toast

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication (jsonwebtoken + bcryptjs)
- Groq SDK (LLaMA 3.3 70B)
- Server-Sent Events (SSE) for streaming

**Deployment**
- Frontend → Vercel
- Backend → Railway
- Database → MongoDB Atlas

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Groq API key (free at console.groq.com)

### 1. Clone the repo
```bash
git clone https://github.com/naina-shukla13/AI-Powered-Code-generator-and-reviewer.git
cd AI-Powered-Code-generator-and-reviewer
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:
```env
PORT=5001
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
GROQ_API_KEY=your_groq_api_key
CLIENT_URL=http://localhost:5173
```

Start the backend:
```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```

Open `http://localhost:5173`

---

## 📁 Project Structure

```
ai-code-reviewer/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── reviewController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── reviewRoutes.js
│   └── server.js
└── frontend/
    └── src/
        ├── pages/
        │   ├── Home.jsx
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Dashboard.jsx
        │   └── Reviewer.jsx
        ├── api.js
        └── App.jsx
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/reviews/stream` | Stream AI code review | Yes |
| POST | `/api/reviews/generate` | Stream AI code generation | Yes |
| GET | `/api/reviews` | Get user's review history | Yes |
| GET | `/api/reviews/:id` | Get single review | Yes |
| DELETE | `/api/reviews/:id` | Delete a review | Yes |

---

## 💡 How It Works

1. User pastes code → selects language → clicks **Review Code**
2. Frontend sends a fetch request to `/api/reviews/stream`
3. Backend streams the Groq LLaMA response as SSE chunks
4. Frontend reads the stream and renders the review in real time
5. Once complete, the review is saved to MongoDB with severity score

For code generation, the same streaming flow applies via `/api/reviews/generate`

---

## 🌐 Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | https://ai-powered-code-generator-and-revie.vercel.app |
| Backend | Railway | https://ai-powered-code-generator-and-reviewer-production.up.railway.app |
| Database | MongoDB Atlas | Cluster0 |

---

## 👩‍💻 Author

**Naina Shukla**
- GitHub: [@naina-shukla13](https://github.com/naina-shukla13)

---

## 📄 License

MIT License — feel free to use this project for learning or portfolio purposes.
