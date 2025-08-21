File Upload & Parsing API (CSV/XLSX + JWT Auth)

This project is a Node.js + Express REST API that supports:

User signup/signin with JWT authentication

File upload (CSV/XLSX) using Multer

File parsing (CSV → JSON / XLSX → JSON) with progress tracking

PostgreSQL database integration

Secure API access via JWT tokens

🚀 Features

User authentication with bcrypt & JWT

Upload CSV/XLSX files

Asynchronous file parsing with progress updates

Fetch parsed file content

List uploaded files

Delete uploaded files

PostgreSQL-based persistence

Modular MVC + services + middleware structure

📦 Tech Stack

Backend: Node.js, Express.js

Database: PostgreSQL

Auth: JWT, bcrypt

File Upload: Multer

Parsing: csv-parser, xlsx

Other Utilities: dotenv, uuid, cors

⚙️ Installation
1. Clone Repo & Install Packages
git clone https://github.com/harshitduttshukla/fileuplodeass.git
cd fileuplodeass
npm install

2. Setup Environment Variables (.env)
DB_USERNAME=
DB_PASSWORD=
DB_NAME=filedb
PORT=4000
JWT_SECRET=

3. Database Setup

Create database & tables in PostgreSQL:

CREATE DATABASE filedb;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY,
  filename TEXT NOT NULL,
  filepath TEXT NOT NULL,
  mimetype TEXT NOT NULL,
  status TEXT DEFAULT 'processing',
  progress INT DEFAULT 0,
  parsed_content JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

4. Run the Server
node server.js


✅ API running at: http://localhost:4000

📂 Folder Structure
src/
  app.js
  routes/
    index.js
    auth.routes.js
    file.routes.js
  controllers/
    auth.controller.js
    file.controller.js
  middleware/
    auth.middleware.js
    upload.middleware.js
  services/
    parser.js
  models/
    db.js
  utils/
    jwt.js
server.js

🔑 API Endpoints
🔐 Auth
Method	Endpoint	Description	Auth Required
POST	/api/auth/signup	User signup	❌
POST	/api/auth/signin	User signin (returns JWT)	❌
📁 File Operations
Method	Endpoint	Description	Auth Required
POST	/api/files (form-data: file=@file.csv/xlsx)	Upload a file	✅
GET	/api/files/:id/progress	Check parsing progress	✅
GET	/api/files/:id	Get parsed file content	✅
GET	/api/files	List all files	✅
DELETE	/api/files/:id	Delete a file	✅

⚠️ Send JWT token as Authorization: Bearer <token>

🧪 Example Workflow (via Postman)

Signup
POST /api/auth/signup

{ "email": "test@example.com", "password": "123456" }


Signin → get JWT
POST /api/auth/signin

{ "email": "test@example.com", "password": "123456" }


Response:

{ "token": "your.jwt.token" }


Upload File
POST /api/files

Headers: Authorization: Bearer <token>

Body: form-data → file=@data.csv

Response:

{ "file_id": "uuid", "status": "processing", "progress": 0 }


Check Progress
GET /api/files/{id}/progress

Get Parsed Content
GET /api/files/{id}