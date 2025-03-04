# FluffyDuck

Welcome to the FluffyDuck repository! This project is a functional prototype of an AI agent that manages a restaurant's social media presence and customer inquiries via email/phone. Below you’ll find an overview of the project, how to run it locally, and instructions for local testing.

---

## Table of Contents

1. [Project Overview](#project-overview)  
2. [Installation & Setup](#installation--setup)  
3. [Running Locally](#running-locally)  
4. [Local Testing](#local-testing)  
5. [Key Technologies](#key-technologies)  
6. [Project Phases](#project-phases)  
7. [DevPost Info](#devpost-info)  
8. [License](#license)

---

## Project Overview

FluffyDuck is designed to help restaurant owners effectively engage their audience through social media, email, and basic AI-driven phone interactions. By automating repetitive tasks, restaurants can focus on what they do best—cooking delicious food and providing top-notch service.  

The repository contains:  
- A frontend (Vite + TypeScript + React + Tailwind)  
- A backend (FastAPI + Python) for AI tasks and integrations with third-party APIs like ElevenLabs, fal, Pica, and more  

Check out our Figma for design prototypes:  
[FluffyDuck Figma](https://www.figma.com/design/nqc0DwBp0ZK3bklu1dXBzi/doodling?node-id=0-1&t=atWOAR2aTAz9PFyH-1)

---

## Installation & Setup

1. **Clone the Repository**

   ```sh
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Install Node.js and Packages**

   Make sure you have Node.js and npm installed.  
   - Recommended: use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) to manage Node versions.

   Then install dependencies:

   ```sh
   npm install
   ```

3. **(Optional) Create a Python Environment**  
   If you plan to run the backend, create and activate a Python environment (via conda or virtualenv):

   Using pip + requirements:
   ```sh
   cd backend
   pip install -r requirements.txt
   ```

4. **Environment Variables**  
   - Copy or create a .env file in the backend.  
   - You’ll need keys for services like ElevenLabs, fal, PostHog, and possibly others.  
   - Example variables:
     ```
     ELEVENLABS_API_KEY=your-elevenlabs-api-key
     FAL_KEY=your-fal-api-key
     SUPABASE_URL=your-supabase-url
     SUPABASE_ANON_KEY=your-supabase-anon-key
     ...
     ```

---

## Running Locally

### Frontend (React)

1. **Run Vite Dev Server**

   ```sh
   npm run dev
   ```
   This starts the local dev server (usually on http://localhost:5173).

### Backend (FastAPI)

1. **Activate Your Python Environment (if using conda/virtualenv)**
   ```sh
   conda activate social-agent
   ```
   or
   ```sh
   source venv/bin/activate
   ```

2. **Run the Backend**
   ```sh
   cd backend
   uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000
   ```
   The backend should now be accessible at http://localhost:8000.

---

## Local Testing

We use [pytest](https://docs.pytest.org/) for our Python tests, including async tests. Make sure you have all dependencies installed (see above steps), and then:

1. **Activate your Python environment** (if not already done).
2. **Navigate to the backend directory**:
   ```sh
   cd backend
   ```
3. **Run tests**:
   ```sh
   python -m pytest tests --cov=src --cov-report=term-missing --cov-fail-under=80
   ```
   This will run all tests in the tests/ folder, generate a coverage report, and fail if code coverage is below 80%.

You can also inspect the GitHub Actions CI workflow in the [.github/workflows](./.github/workflows) directory to see how the tests and coverage are run in a CI environment.

---

## Key Technologies

- **Vite + TypeScript + React** for the frontend
- **shadcn-ui** component library
- **Tailwind CSS** for styling
- **FastAPI + Python** for the backend
- **ElevenLabs** for text-to-speech
- **fal** for image/video generation
- **Pica** to automate agent processes
- **Supabase** (or Upstash) for database or additional services

