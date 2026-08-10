# TrackIt - Internship Management and Task Tracking System

TrackIt is a full-stack web application developed to support the
day-to-day management of internship students.

The system allows administrators and supervisors to manage interns,
projects and tasks, monitor progress, review work submissions and
provide feedback. Interns can view assigned work, update their progress,
submit completed work and maintain daily work logs.

## Features

### Administrator / Supervisor

- Secure login
- Manage intern accounts
- Activate and deactivate interns
- Create and edit projects
- Assign interns to projects
- Create and assign tasks
- Set task priorities and deadlines
- Monitor task progress
- Review daily work logs
- Review work submissions
- Approve work or request revisions
- Provide supervisor feedback
- View dashboard summaries

### Intern

- Secure login
- View assigned projects and tasks
- View task priorities and deadlines
- Update task progress
- Submit daily work logs
- Submit repository/document links
- Submit completion notes
- View supervisor feedback

## Technology Stack

### Frontend

- React
- Vite
- Axios
- React Router

### Backend

- Java 21
- Spring Boot
- Spring Web
- Spring Security
- Spring Validation
- Spring Data MongoDB
- JWT Authentication
- BCrypt Password Encryption

### Database

- MongoDB Atlas

### Development Tools

- Visual Studio Code
- Maven
- Postman
- Git
- GitHub

## Main Modules

1. Authentication and Authorization
2. Intern Management
3. Project Management
4. Task Management
5. Daily Work Logs
6. Submission and Feedback
7. Dashboard


## User Roles

The application contains three roles:

- ADMIN
- INTERN

Role-based authorization is implemented using Spring Security and JWT.

## Project Structure

TrackIt/
├── backend/ # Spring Boot REST API
├── frontend/ # React frontend
└── README.md

## Running the Project Locally

### Prerequisites

Install:

- Java 21
- Node.js
- npm
- Git
- MongoDB Atlas account or MongoDB connection

### Backend Setup

Navigate to:

cd backend

Configure the MongoDB connection and JWT configuration using your local
application configuration.

Do not commit database passwords or secret keys to GitHub.

Run:

./mvnw spring-boot:run

On Windows PowerShell:

.\mvnw spring-boot:run

Backend:

http://localhost:8080

### Frontend Setup

Open another terminal:

cd frontend

Install dependencies:

npm install

Start Vite:

npm run dev

Frontend:

http://localhost:5173

## Complete System Workflow

1. Administrator logs into TrackIt.
2. Administrator creates an intern account.
3. Administrator creates a project.
4. Intern is assigned to the project.
5. Administrator or supervisor creates and assigns a task.
6. Intern logs into TrackIt.
7. Intern views assigned work.
8. Intern updates task progress.
9. Intern records a daily work log.
10. Intern submits completed work.
11. Supervisor reviews the submission.
12. Supervisor approves the work or requests revision.
13. Dashboard statistics are updated.

## Security

TrackIt implements:

- BCrypt password hashing
- JWT authentication
- Role-based authorization
- Protected REST endpoints
- Input validation

Sensitive credentials and environment files must not be committed to
the repository.

## API Base URL

http://localhost:8080/api

Main API groups:

- /api/users
- /api/projects
- /api/tasks
- /api/worklogs
- /api/submissions
- /api/dashboard

## Assignment

Project: Internship Management and Task Tracking System

Backend: Spring Boot

Frontend: React

Database: MongoDB
