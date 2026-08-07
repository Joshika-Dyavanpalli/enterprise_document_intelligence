# Enterprise Document Intelligence

An AI-powered Enterprise Document Intelligence system that enables users to upload documents and ask natural language questions based on the document content. The application extracts text from uploaded PDFs, generates vector embeddings, and retrieves context-aware answers using a Large Language Model (LLM).

---

## Features

- User Authentication (Signup & Login)
- JWT-based Authorization
- Secure PDF Upload
- Document Storage using MongoDB
- Text Extraction from PDF Documents
- Vector Embedding Generation
- AI-powered Question Answering
- Retrieval-Augmented Generation (RAG)
- FastAPI AI Service Integration
- React Frontend
- Node.js Backend

---

## Tech Stack

### Frontend
- React.js
- React Router
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Multer

### AI Service
- FastAPI
- Python
- Ollama
- Sentence Transformers
- FAISS
- PyPDF2

---

## Project Architecture

```
React Frontend
        │
        ▼
Node.js + Express Backend
        │
        ▼
FastAPI AI Service
        │
 ┌──────┴────────┐
 │               │
 ▼               ▼
FAISS Vector DB  Ollama LLM
        │
        ▼
 Generated Answer
```

---

## Project Structure

```
enterprise_document_intelligence/

│
├── frontend/
│   ├── src/
│   ├── pages/
│   ├── services/
│   └── components/
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── uploads/
│   └── config/
│
├── ai_service/
│   ├── app.py
│   ├── embeddings.py
│   ├── retrieval.py
│   ├── chunking.py
│   ├── pdf_reader.py
│   └── prompt.py
│
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd enterprise_document_intelligence
```

---

## Backend Setup

```bash
cd backend

npm install

npm start
```

Server runs on

```
http://localhost:5000
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on

```
http://localhost:5173
```

---

## AI Service Setup

Create and activate a virtual environment.

```bash
python -m venv venv
```

Activate

Windows

```bash
venv\Scripts\activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Run FastAPI

```bash
python -m uvicorn app:app --reload --port 8000
```

FastAPI runs on

```
http://127.0.0.1:8000
```

---

## Ollama Setup

Install Ollama.

Run Ollama Server

```bash
ollama serve
```

Pull the model

```bash
ollama pull llama3.2
```

---

## Environment Variables

Backend `.env`

```env
PORT=5000

MONGO_URI=your_mongodb_connection

JWT_SECRET=your_secret_key
```

---

## API Endpoints

### Authentication

| Method | Endpoint |
|---------|----------|
| POST | /auth/signup |
| POST | /auth/login |
| GET | /auth/profile |

### Documents

| Method | Endpoint |
|---------|----------|
| POST | /auth/upload |
| POST | /auth/ask |
| GET | /auth/documents |
| GET | /auth/document/:id |
| DELETE | /auth/document/:id |

---

## Workflow

1. User registers and logs in.
2. JWT token is generated.
3. User uploads a PDF document.
4. Backend stores the document.
5. FastAPI extracts text.
6. Document is chunked.
7. Embeddings are generated.
8. FAISS index is created.
9. User asks a question.
10. Relevant chunks are retrieved.
11. Ollama generates the final response.
12. Answer is displayed to the user.

---

## Future Enhancements
- Multi-document Search
- Chat History
- Docker Support
- Deployment
- Role-Based Access Control
- Cloud Storage Integration

---

## Author

Joshika Dyavanapalli
