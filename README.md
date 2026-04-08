# Clark

Clark AI is your personal study sidekick. Upload PDFs, chat with AI, make quizzes & flashcards, collaborate with friends, and actually enjoy learning again.

## Features

### Smart Study Materials

- PDF to Interactive Content
- Summarize PDFs
- Generate PDFS
- Generate Flashcards
- Generate Quizes
- Use tags to access all features

### Prerequisites

- Node.js (v18 or later recommended)
- npm (v9 or later) or yarn (v1.22 or later)
- Git (for version control)

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory and add the following:

```env
NEXT_PUBLIC_API_BASE_URL=your_api_base_url_here
NEXT_PUBLIC_API_BASE_URL_TWO=your_second_api_base_url_here
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_api_key

# Optional, if your setup uses it
NEXT_PUBLIC_ACCESS_TOKEN=your_access_token

# Keep secrets in .env.local and never commit real values
```

4. **Run the development server**:

```bash
npm run dev
# or
yarn dev
```

5. **Open your browser**:
   Visit [http://localhost:3000](http://localhost:3000) to see the application in action.

## Tech Stack

### Frontend

- Next.js 15
- TypeScript
- Tailwind CSS

## Project Structure

```
clarkai-fe/
├── public/                  # Static files
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── (auth)/          # Authentication pages
│   │   ├── api/             # API routes
│   │   ├── dashboard/       # Main application pages
│   │   └── layout.tsx       # Root layout
│   │
│   ├── components/          # Reusable components
│   │   ├── ui/              # UI components
│   │   ├── layout/          # Layout components
│   │   └── shared/          # Shared components
│   │
│   ├── config/              # Configuration files
│   ├── constants/           # Application constants
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions
│   ├── services/            # API services
│   ├── store/               # State management
│   ├── styles/              # Global styles
│   └── types/               # TypeScript type definitions
│
├── .eslintrc.js            # ESLint configuration
├── .gitignore              # Git ignore file
├── next.config.js          # Next.js configuration
├── package.json            # Project dependencies
└── tsconfig.json           # TypeScript configuration
```

## 🧪 Testing

Run the test suite with:

```bash
npm test
# or
yarn test
```

### Production Build

Create an optimized production build:

```bash
npm run build
# or
yarn build
```
