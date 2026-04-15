# AutoBook Generator - Frontend

A modern, responsive Next.js 16 frontend for the AI-powered book generation system.

## 🚀 Features

- **4-Step Workflow**: Concept → Outline → Chapters → Finalization
- **AI-Powered Outline Generation**: Create book outlines using Gemini AI
- **Human-in-the-Loop Review**: Approve or provide feedback on generated content
- **Progressive Chapter Generation**: Generate chapters one at a time or in batch
- **Word Document Export**: Compile final book to professional .docx format
- **Real-time Progress Tracking**: Visual indicators for generation progress
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 📋 Project Structure

```
frontend/
├── app/
│   ├── globals.css          # Global Tailwind styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main dashboard (4-step workflow)
├── components/
│   ├── ConceptStep.tsx      # Step 1: Create book concept
│   ├── OutlineStep.tsx      # Step 2: Review outline
│   ├── ChaptersStep.tsx     # Step 3: Generate chapters
│   ├── FinalStep.tsx        # Step 4: Compile & download
│   ├── StepIndicator.js     # Progress indicator
│   └── OutlineReview.js     # Legacy component (deprecated)
├── services/
│   ├── api.js               # Axios API client & endpoints
│   └── api.ts               # TypeScript version
├── public/                  # Static assets
└── package.json             # Dependencies
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running at `http://127.0.0.1:8000`

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` to match your backend URL:
   ```
   NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000)

## 📱 Workflow Overview

### Step 1: Concept
- Enter book title
- Provide initial research notes/ideas
- AI generates outline

### Step 2: Outline Review
- Review AI-generated outline
- Provide optional feedback
- Approve to proceed to chapters

### Step 3: Chapter Generation
- Generate chapters one-by-one
- View chapter summaries
- Track progress (up to 10 chapters)
- Expand chapters to view full content

### Step 4: Finalization
- Review chapter statistics
- Compile to Word document
- Download professional .docx file

## 🔌 API Integration

The frontend communicates with the backend via these endpoints:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/outline/generate` | Generate outline from concept |
| POST | `/outline/review` | Approve/reject outline |
| POST | `/chapters/generate/{id}` | Generate chapter |
| GET | `/chapters/{id}` | Fetch all chapters for book |
| POST | `/book/compile/{id}` | Compile book to docx |

## 🎨 Design Features

- **Gradient Background**: Modern dark-to-slate gradient
- **Tailwind CSS**: Utility-first styling
- **Lucide Icons**: Clean, consistent iconography
- **Responsive Grid**: Mobile-first responsive design
- **Loading States**: Smooth animations during API calls
- **Error Handling**: User-friendly error messages
- **Progress Indicators**: Visual step tracking

## 📦 Dependencies

- **Next.js 16**: React framework
- **React 19**: UI library
- **Tailwind CSS 4**: Styling
- **Axios**: HTTP client
- **Lucide React**: Icon library

## 🚀 Build & Deploy

### Build for production:
```bash
npm run build
npm start
```

### Environment Variables for Production:
```
NEXT_PUBLIC_API_BASE=https://your-api-domain.com
```

## 🐛 Troubleshooting

### "Cannot fetch outline"
- Ensure backend is running at the configured URL
- Check `NEXT_PUBLIC_API_BASE` in `.env.local`
- Verify CORS settings on backend

### "Chapter generation fails"
- Ensure outline is approved (`status_outline_notes` = `no_notes_needed`)
- Check that book ID matches database records
- Verify Gemini API key configuration on backend

### API calls timeout
- Check backend service health
- Increase timeout in `services/api.js` if needed
- Verify network connectivity

## 📝 Notes

- All API calls use JSON request/response format
- Chapter limit: 10 chapters per book
- Outline feedback is optional but recommended
- Compiled .docx files are compatible with MS Word, Google Docs, etc.

## 🔐 Security

- API base URL configurable via environment variables
- No sensitive data stored in client-side code
- All requests validated by backend

## 📄 License

Part of the AutoBook Generator project.
