# NestJS Neo4j Learning Platform Backend

Backend service for a full-stack learning platform built with NestJS and Neo4j.  
The application provides REST API endpoints for course management, student enrollments, role management, and graph-based data relationships.

---

## Features

- REST API architecture
- Student and course management
- Course enrollment system
- Instructor and admin role management
- Neo4j graph database integration
- CRUD operations
- DTO validation
- Modular NestJS architecture
- TypeScript support

---

## Technologies Used

- NestJS
- TypeScript
- Neo4j
- REST API
- Node.js
- Class Validator
- JWT Authentication
- Graph Database Modeling

---

## Project Structure

```bash
src/
 ├── controllers/
 ├── services/
 ├── modules/
 ├── entities/
 ├── dtos/
 └── main.ts
```

---

## API Endpoints

### Students

- `POST /students/create`
- `POST /students/enroll`
- `POST /students/unenroll`
- `GET /students`
- `GET /students/instructors`
- `GET /students/admins`
- `POST /students/make-instructor`
- `POST /students/remove-instructor`
- `POST /students/make-admin`
- `POST /students/remove-admin`

### Courses

- `POST /courses/create`
- `GET /courses`
- `GET /courses/:slug/details`
- `PATCH /courses/:slug`
- `DELETE /courses/:slug`

---

## Installation

### 1. Clone repository

```bash
git clone https://github.com/saraaz1004/nestjs-neo4j-learning-platform.git
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file:

```env
NEO4J_URI=neo4j://127.0.0.1:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password
NEO4J_DATABASE=social
```

### 4. Start Neo4j database

Make sure Neo4j Desktop is running.

### 5. Run development server

```bash
npm run start:dev
```

Backend runs on:

```bash
http://localhost:3000
```

---

## Learning Outcomes

Through this project, I improved my understanding of:

- Backend architecture with NestJS
- Graph databases and Neo4j relationships
- REST API development
- DTO validation and TypeScript typing
- Modular application structure
- CRUD operations and role systems
- Full-stack integration with Next.js frontend

---

## Author

Sara Zivkovic
