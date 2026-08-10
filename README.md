# Sakhi (सखी)

A free, bilingual (English/Marathi) PCOS risk-screening and daily support platform for young women in Maharashtra, India.

## Prerequisites

Before running the project, make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (comes with Node.js)

## Setup & Running the Project

### 1. Install Dependencies
Open your terminal in the project root directory (`Samarthya-HackHers-Sakhi`) and run:
```bash
npm install
```

### 2. Environment Variables
You already have your `.env` file set up with the required API keys (Supabase and Gemini). 
Ensure the file `.env` is located in the root of your project directory and contains:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 3. Database Setup (Supabase)
To set up the backend tables:
1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your project and navigate to the **SQL Editor**.
3. Open the `schema.sql` file in the root of this project.
4. Copy the entire contents of `schema.sql` and paste it into the Supabase SQL Editor.
5. Click **Run** to create all the necessary tables (`users`, `screening_responses`, `risk_scores`, etc.).

### 4. Start the Development Server
Once dependencies are installed and the database is set up, start the local development server:
```bash
npm run dev
```

The app will typically be available at `http://localhost:5173/`. Open this URL in your browser to view the application.

## Project Structure Highlights

- **`src/pages/`**: Contains all the page components. Shared pages like `Landing`, `Login`, `Signup`, `Dashboard`, `Settings`, and `Onboarding` are fully built.
- **`src/i18n/`**: Contains the English (`en.json`) and Marathi (`mr.json`) translation files.
- **`src/lib/`**: Contains shared utilities like the Supabase client (`supabaseClient.js`) and Auth context (`AuthContext.jsx`).
- **`src/components/`**: Contains shared components like the `Navbar`.
- **`src/index.css`**: Contains the Tailwind v4 theme configuration and design tokens.
