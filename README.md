# SDE Role Application App

A lightweight app for collecting candidate applications for a Software Development Engineer role.

## Features
- Candidate details collection (name, email, experience, preferred stack)
- Skill selection checklist
- Client-side validation
- Backend API for storing and listing submitted applications (in-memory)
- Submitted payload preview panel in the UI

## Run locally
```bash
node server.js
```
Then open `http://localhost:8000`.

## API
- `POST /api/applications` stores one application
- `GET /api/applications` lists all stored applications for the current server process
