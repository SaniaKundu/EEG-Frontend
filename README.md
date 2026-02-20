# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

## Backend (Flask) — local dev ⚙️

This project includes a Flask backend that exposes `POST /detect-mood` to accept an image (`image`) and an EEG CSV (`eeg`).

Quick start

1. Change to the backend folder and create a virtualenv:

   ```bash
   cd backend
   python -m venv .venv
   .venv/bin/activate      # on Linux/macOS
   .venv\Scripts\activate # on Windows (PowerShell/CMD)
   pip install -r requirements.txt
   ```

2. Copy `.env.example` → `.env` and fill secrets (do not commit `.env`):

   - `MONGO_URI` (optional for saving results)
   - `YOUTUBE_API_KEY` (optional, used for music links)
   - `SECRET_KEY` (optional)

3. Run backend for development:

   ```bash
   cd backend
   python app.py
   ```

4. Start the frontend (project root):

   ```bash
   npm install
   npm run dev
   ```

Optional: start both frontend + backend with one command (dev only):

```bash
npm install
npm run dev:all
```

This uses `concurrently` to run both servers for local development.

Integration test

- A small integration test is available via `scripts/run-test.sh` which posts the sample files in `samples/` to the backend:

```bash
# Ensure backend is running, then from project root:
./scripts/run-test.sh http://127.0.0.1:5000
# or, using npm script
npm run test:integration
```

Notes
- Frontend expects the backend at `VITE_API_BASE_URL` (defaults to `http://127.0.0.1:5000`). Copy `.env.local.example` to `.env.local` in the project root to change it in development.
- CORS is enabled for local testing; configure origins in `backend/app.py` as needed.
- `deepface` and `pandas` are required by the backend; `deepface` may need extra ML dependencies (TensorFlow). If you don't want that, replace `face_emotion.detect_face_emotion` with a simple heuristic.

Security: keep server secrets in `backend/.env` or a secret manager and never in the frontend.
