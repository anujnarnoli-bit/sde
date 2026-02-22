# SDE Role Application App

A lightweight full-stack app for collecting candidate applications for a Software Development Engineer role.

## Features
- Candidate details collection (name, email, experience, preferred stack)
- Skill selection checklist
- Client-side validation
- Backend API for storing and listing submitted applications (in-memory)
- Health endpoint for deployment checks (`/health`)
- Submitted payload preview panel in the UI

## Run locally
```bash
npm start
```
Then open `http://localhost:8000`.

## API
- `POST /api/applications` stores one application
- `GET /api/applications` lists all stored applications for the current server process
- `GET /health` returns `{ "status": "ok" }`

## Get a public app link (Render)
This repo now includes `render.yaml` for one-click deploy.

1. Push this repo to GitHub.
2. In Render, choose **New +** → **Blueprint**.
3. Connect your GitHub repo and deploy.
4. Render will provide a live URL, typically like:
   - `https://sde-role-app.onrender.com`

Once deployed, your app link is the Render service URL.
