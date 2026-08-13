# Enterprise Document Intelligence

Enterprise Document Intelligence is a document-based question-answering
application that allows authenticated users to upload documents, process
them using OCR and text extraction, generate vector embeddings, and ask
questions based on uploaded document content.

The application also includes chat history, document management,
authentication, user profiles, and Role-Based Access Control (RBAC).

## Features

### Authentication

-   User signup and login
-   Password hashing using bcrypt
-   JWT-based authentication
-   Protected API routes
-   User profile information
-   Default `Viewer` role for newly registered users

### Role-Based Access Control (RBAC)

Three roles are supported:

-   `Admin`
-   `Editor`
-   `Viewer`

  Feature             Admin   Editor   Viewer
  ------------------- ------- -------- --------
  Login / Signup      Yes     Yes      Yes
  View Profile        Yes     Yes      Yes
  View Documents      Yes     Yes      Yes
  Upload Documents    Yes     Yes      No
  Delete Documents    Yes     No       No
  User Management     Yes     No       No
  Change User Roles   Yes     No       No
  Chat                Yes     Yes      Yes

Role authorization is enforced through authentication and role
middleware on protected backend routes.

### User Management

Admin users can: - View registered users - View user names and emails -
View current roles - Change a user's role between `Admin`, `Editor`, and
`Viewer` - Update roles from the User Management UI - Cannot change
their own role

### Document Upload

Supported formats: - PDF - DOCX - PNG - JPG - JPEG

The upload flow processes the document, extracts text, creates chunks
and embeddings, builds a FAISS vector index, stores document metadata,
and attaches the document to the current chat.

### OCR

Tesseract OCR is used for image-based documents and scanned PDF pages.

For scanned PDFs: 1. PDF page is converted to an image. 2. Tesseract
extracts the text. 3. Extracted text enters the normal
document-processing pipeline.

### PDF Text Extraction

PDF text is extracted page-by-page using PyMuPDF (`fitz`).

Page markers are preserved:

``` text
--- Page 1 ---

Document content...

--- Page 2 ---

Document content...
```

This page information is used for source citations.

### DOCX Extraction

DOCX paragraphs are extracted using `python-docx`.

### Image Text Extraction

Images are processed using `pytesseract`.

Supported image formats: - `.png` - `.jpg` - `.jpeg`

### Document Chunking

Extracted text is split into smaller chunks.

Current configuration: - Chunk size: `500` - Overlap: `100`

Page information is preserved inside chunks:

``` text
[Page 1]
Document content...
```

If page information is unavailable:

``` text
[Page information unavailable]
```

### Embeddings

Document chunks are converted into vector embeddings using Sentence
Transformers.

Model:

``` text
all-MiniLM-L6-v2
```

### FAISS Vector Search

FAISS is used for semantic similarity search.

For each processed document, the vector store contains: - FAISS `.index`
file - Pickled `.pkl` chunks file

Query flow:

``` text
Question
   ↓
Question Embedding
   ↓
FAISS Search
   ↓
Relevant Chunks
```

### Document Question Answering

Users can ask questions about uploaded documents.

The pipeline is:

``` text
User Question
      ↓
Question Embedding
      ↓
FAISS Similarity Search
      ↓
Relevant Document Chunks
      ↓
Context
      ↓
Prompt
      ↓
Ollama / Llama 3.2
      ↓
Answer
```

The AI is instructed to answer using only the retrieved document
context.

If the answer cannot be found, it is instructed to respond:

``` text
I couldn't find that information in the document.
```

### Ollama Integration

The AI service communicates with a locally running Ollama server.

Current model:

``` text
llama3.2
```

### Page Citations

Retrieved chunks contain source-page information and the prompt
instructs the AI to cite supporting pages.

Citation format:

``` text
[Page X]
```

Example:

``` text
The policy provides annual leave according to the employee policy. [Page 2]
```

Multiple pages can be cited:

``` text
The policy applies to both groups. [Page 2] [Page 4]
```

### Chat System

Users can: - Create a new chat - Attach a document to a chat - Ask
questions - Continue conversations - Store user and assistant messages -
View previous chats

Each chat stores: - User - Documents - Messages - Created time - Updated
time

### Chat History

The My Chats page displays previous conversations with: - Chat title -
Message count - Attached document - Last updated time

Users can open a previous chat and continue the conversation.

Chat history is stored in the backend MongoDB database. The My Chats page retrieves saved conversations through the chat API. Persistence after page refresh/re-login is currently being verified and finalized.

### Document Management

Users can: - View their documents - View document details - See file
names and file types - Delete documents according to their role
permissions

When an Admin deletes a document: 1. The physical file is deleted. 2.
The document database record is deleted. 3. The document is removed from
associated chats.

### Dashboard

The application includes a dashboard with navigation to major
application features such as: - Dashboard - Documents - Chats -
Profile - User Management - Upload

### Profile

The Profile page displays information about the authenticated user,
including: - Name - Email - Role

## Application Flow

### Registration

``` text
Signup
  ↓
User Created
  ↓
Default Role = Viewer
```

### Login

``` text
Login
  ↓
Credentials Verified
  ↓
JWT Generated
  ↓
Token Stored
  ↓
Authenticated Requests
```

### Admin Role Management

``` text
Admin Login
    ↓
User Management
    ↓
Select User
    ↓
Change Role
    ↓
Backend Validates Admin
    ↓
Role Updated in MongoDB
```

Example:

``` text
ABC
Viewer
  ↓
Admin changes role
  ↓
Editor
```

### Document Processing

``` text
Login
 ↓
Create/Open Chat
 ↓
Upload Document
 ↓
AI Service
 ↓
Text Extraction / OCR
 ↓
Chunking
 ↓
Embeddings
 ↓
FAISS
 ↓
Save Document
 ↓
Attach Document to Chat
```

### Question Answering

``` text
Question
 ↓
Retrieve Relevant Chunks
 ↓
Build Context
 ↓
Ollama / Llama 3.2
 ↓
Answer
 ↓
Page Citation
 ↓
Save Conversation
```

## Architecture

### Frontend

The frontend is built with React and React Router.

Main pages include:

``` text
Login
Signup
Dashboard
Upload
Documents
Chats
Chat
Profile
User Management
```

### Backend

The backend uses:

``` text
Node.js
Express.js
MongoDB
Mongoose
JWT
bcrypt
Multer
```

Example structure:

``` text
backend/
├── controllers/
│   ├── authController.js
│   └── chatController.js
├── middleware/
│   ├── authMiddleware.js
│   ├── roleMiddleware.js
│   └── multerMiddleware.js
├── models/
│   ├── User.js
│   ├── Chat.js
│   └── documents.js
├── routes/
│   ├── authRoutes.js
│   └── chatRoutes.js
└── services/
    └── aiService.js
```

### AI Service

The AI service uses:

``` text
Python
FastAPI
PyMuPDF
python-docx
Pillow
Tesseract OCR
pytesseract
Sentence Transformers
FAISS
NumPy
Ollama
Llama 3.2
```

Main files:

``` text
ai_service/
├── app.py
├── chunking.py
├── embeddings.py
├── faiss_index.py
├── retriever.py
├── prompt.py
└── vector_service.py
```

## Complete AI Pipeline

``` text
                  DOCUMENT
                      │
                      ▼
               FastAPI Upload
                      │
                      ▼
          ┌───────────────────────┐
          │    Text Extraction    │
          │                       │
          │ PDF → PyMuPDF         │
          │ DOCX → python-docx    │
          │ Image → Tesseract     │
          └───────────────────────┘
                      │
                      ▼
                  Chunking
                      │
                      ▼
            Sentence Transformer
                      │
                      ▼
                 Embeddings
                      │
                      ▼
                    FAISS
                      │
                      ▼
                Vector Store
                      │
                      │
                USER QUESTION
                      │
                      ▼
              Query Embedding
                      │
                      ▼
               FAISS Retrieval
                      │
                      ▼
             Relevant Chunks
                      │
                      ▼
                   Prompt
                      │
                      ▼
              Ollama Llama 3.2
                      │
                      ▼
                   Answer
                      │
                      ▼
                Page Citation
```

## Database Models

### User

``` text
User
├── name
├── email
├── password
└── role
```

### Chat

``` text
Chat
├── userId
├── documents[]
├── messages[]
├── createdAt
└── updatedAt
```

### Message

``` text
Message
├── role
├── content
└── createdAt
```

## Security

Implemented security mechanisms include: - Password hashing with
bcrypt - JWT authentication - Protected routes - Role-based
authorization - User ownership checks - Document ownership validation -
Chat ownership validation - Prevention of unauthorized document access -
Prevention of unauthorized role changes - Prevention of an Admin
changing their own role

## Technologies Used

### Frontend

-   React
-   React Router
-   Axios
-   JavaScript
-   CSS / Inline Styling

### Backend

-   Node.js
-   Express.js
-   MongoDB
-   Mongoose
-   JWT
-   bcrypt
-   Multer

### AI / Document Processing

-   Python
-   FastAPI
-   PyMuPDF
-   python-docx
-   Pillow
-   Tesseract OCR
-   pytesseract
-   Sentence Transformers
-   FAISS
-   NumPy
-   Ollama
-   Llama 3.2

## Project Status

The implemented and demonstrable functionality includes:

-   Authentication
-   Dashboard UI
-   Document upload
-   Document listing
-   OCR
-   PDF text extraction
-   DOCX text extraction
-   Image text extraction
-   Vector embeddings
-   FAISS retrieval
-   Document-based Q&A
-   Ollama integration
-   Page citations
-   Chat creation
-   Chat history
-   My Chats
-   Profile
-   User Management
-   Role management
-   RBAC
-   Admin / Editor / Viewer permissions
-   Document ownership checks
-   Chat ownership checks

## Future Improvements

Potential improvements include: - Improved citation accuracy - OCR
preprocessing - Additional document formats - Improved semantic
retrieval - Conversation summaries - Chat search - Automated testing -
Production deployment - Cloud-based vector storage - More granular
permissions - Improved responsive UI

## Conclusion

Enterprise Document Intelligence combines document processing, OCR,
semantic search, vector retrieval, and local LLM-based question
answering into a single application.

The system also provides authentication, chat history, document
management, user management, profiles, and Role-Based Access Control for
controlled access to document intelligence functionality.
