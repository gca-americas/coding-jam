# Career Tailor (BulletProof)

An AI-powered resume tailoring application that sharpens your resume bullets to match a specific job posting.

## Setup Instructions

This project consists of a FastAPI backend and a vanilla HTML/CSS/JS frontend. You will need to run both to use the app.

### 1. Backend Setup

The backend uses `uv` for dependency management and runs on Python. It requires a Gemini API key.

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. The `.env` file is already configured with a `GEMINI_API_KEY`. If you need to use a different key, edit the `.env` file:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. Start the backend server using `uv`:
   ```bash
   uv run uvicorn main:app --reload
   ```
   *Note: The backend must run on port 8000 (which is the default) because the frontend expects it at `http://localhost:8000`.*

### 2. Frontend Setup

The frontend consists of static files and can be served using any simple HTTP server.

1. Open a **new** terminal window (keep the backend running) and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Start a local HTTP server. You can use Python 3's built-in server. Since the backend is running on port 8000, we'll run the frontend on a different port, like 3000:
   ```bash
   python3 -m http.server 3000
   ```

3. Open your web browser and navigate to:
   [http://localhost:3000](http://localhost:3000)

## Usage

1. Paste your current resume bullets or text into the **"Your Resume"** field.
2. Paste the target job description into the **"Job Posting"** field.
3. Click the **"Sharpen Resume"** button and wait for the AI to analyze and tailor your bullets.
4. Review your match score, found/missing keywords, and copy the newly tailored bullets for your application!

### Sample Input

If you'd like to test the app quickly, try copy-pasting the following samples:

**Sample Resume:**
```text
Full Stack Developer
- Spearheaded the migration of a legacy monolithic application to a microservices architecture using Node.js and Docker, reducing system downtime by 25%.
- Developed and maintained 15+ responsive React.js components, establishing a centralized UI library that accelerated frontend development cycles by 30%.
- Designed and implemented RESTful APIs using Express.js and PostgreSQL, optimizing database queries to handle over 10,000 concurrent users with <200ms latency.
- Mentored 3 junior developers, conducting bi-weekly code reviews to enforce best practices in Git version control and Jest unit testing.
- Integrated CI/CD pipelines via GitHub Actions, automating test deployments to AWS EC2 instances and reducing manual release efforts by 40%.
```

**Sample Job Posting:**
```text
Senior Full Stack Software Engineer (React / Python)
About the Role:
We are seeking an experienced Senior Full Stack Engineer to lead the development of our next-generation SaaS platform. In this role, you will work closely with product and design teams to build scalable, high-performance web applications.

Responsibilities:
- Architect and develop scalable web applications utilizing React.js on the frontend and Python/FastAPI on the backend.
- Design and manage relational databases (PostgreSQL) and implement efficient caching strategies using Redis.
- Drive the adoption of cloud-native technologies, managing deployments on AWS (EKS, S3, RDS) using Terraform.
- Champion code quality by establishing comprehensive testing frameworks (PyTest, Cypress) and participating in rigorous peer reviews.
- Collaborate with cross-functional teams in an Agile environment to translate business requirements into technical specifications.

Requirements:
- 5+ years of professional software engineering experience, with a strong focus on full-stack web development.
- Proficiency in modern JavaScript/TypeScript (React, Next.js) and Python (FastAPI, Django).
- Proven experience with containerization (Docker, Kubernetes) and CI/CD pipelines (GitLab CI, GitHub Actions).
- Strong understanding of cloud architecture, preferably AWS or GCP.
- Excellent problem-solving skills and a proven track record of mentoring junior engineers.
```
