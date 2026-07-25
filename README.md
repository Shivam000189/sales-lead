# Lead Management Platform

A full-stack Lead Management Platform built for small sales teams to capture, organize, assign, and manage leads throughout their lifecycle.

The application consists of a **public lead capture portal** and a **secure dashboard** with role-based authentication, lead assignment, activity tracking, notes, filtering, pagination, and a RESTful JSON API.

---

## Live Demo

**Frontend:** 

**Backend API:** 

---

## Built For

This project was developed as part of the **Digital Heroes Full Stack Development Training Task**.

> **Footer Credit**
>
> Built for Digital Heroes Training Task
>
> https://digitalheroesco.com

---

# Features

## Public Lead Capture

- Public lead submission form
- Form validation
- Creates new leads directly in the system
- No authentication required

---

## Authentication

- JWT Authentication
- Secure Password Hashing
- Protected Routes
- Role-Based Authorization

Roles:

- Admin
- Member

---

## Admin Permissions

- View all leads
- Create leads
- Edit leads
- Delete leads
- Assign leads to members
- Update lead status
- View activity history
- Add notes

---

## Member Permissions

- View assigned leads
- Update lead status
- Add notes
- View activity history

Members **cannot**

- Delete leads
- Assign leads
- Access admin-only routes

Permissions are enforced on both the frontend and backend.

---

# Lead Lifecycle

Each lead moves through a complete sales pipeline.

```
New
↓

Contacted
↓

Qualified
↓

Proposal Sent
↓

Won / Lost
```

Each status change is stored in the activity log.

---

# Activity Trail

Every important action is recorded.

Examples:

- Lead Created
- Lead Updated
- Lead Assigned
- Status Changed
- Note Added

Each activity contains:

- User
- Action
- Timestamp

---

# Notes System

Each lead supports multiple notes.

Each note includes:

- Content
- Author
- Timestamp

---

# Dashboard

The dashboard provides:

- Total Leads
- New Leads
- Contacted Leads
- Qualified Leads
- Won Leads
- Lost Leads

Additional features:

- Recent Activity
- Lead Statistics
- Search
- Filters
- Pagination

---

# Tech Stack

## Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Axios
- React Query
- React Hook Form
- React Hot Toast
- Lucide React

---

## Backend

- Node.js
- Express.js
- TypeScript

---

## Database

- MongoDB

---

## Authentication

- JWT
- bcrypt

---

## Testing

- Jest
- Supertest

---

# Project Structure

```
project
│
├── frontend
│   ├── src
│   ├── components
│   ├── pages
│   ├── routes
│   ├── services
│   └── context
│
├── backend
│   ├── src
│   ├── controllers
│   ├── routes
│   ├── middleware
│   ├── prisma
│   ├── tests
│   └── utils
│
└── README.md
```

---

# Database Design

Main entities

## User

- id
- name
- email
- password
- role

---

## Lead

- id
- name
- email
- phone
- company
- status
- assignedTo
- createdAt
- updatedAt

---

## Note

- id
- content
- leadId
- authorId
- createdAt

---

## Activity

- id
- action
- leadId
- userId
- createdAt

---

# Installation

## Clone Repository

```bash
git clone https://github.com/Shivam000189/digital-h

cd ..
```

---

## Backend Setup

```bash
cd server

npm install
```

Create

```
.env
```

Example

```env
DATABASE_URL=

JWT_SECRET=

PORT=

MONGO_URI
```

Start backend

```bash
npm run dev
```

---

## Frontend Setup

```bash
cd frontend

npm install
```

Create

```
.env
```

Example

```env
VITE_API_URL=http://localhost:5000/api
```

Run

```bash
npm run dev
```

---

# API Documentation

Base URL

```
/api
```

---

## Authentication

### Login

```
POST /auth/login
```

Request

```json
{
  "email": "shivam@test.com",
  "password": "123456"
}
```

Response

```json
{
  "token": "jwt-token"
}
```

Status Codes

```
200 OK

401 Unauthorized
```

---

## Get Leads

```
GET /leads
```

Supports

- Pagination
- Search
- Status Filter
- Assigned User Filter

Example

```
GET /leads?page=1&limit=10&status=Qualified
```

Response

```json
{
  "data": [],
  "page": 1,
  "totalPages": 3,
  "totalItems": 24
}
```

Status Codes

```
200 OK

401 Unauthorized
```

---

## Get Lead

```
GET /leads/:id
```

---

## Create Lead

```
POST /leads
```

Admin Only

---

## Update Lead

```
PATCH /leads/:id
```

Admin / Assigned Member

---

## Delete Lead

```
DELETE /leads/:id
```

Admin Only

---

## Public Lead Capture

```
POST /capture
```

No authentication required.

---

## Add Note

```
POST /leads/:id/notes
```

---

## Assign Lead

```
PATCH /leads/:id/assign
```

Admin Only

---

# API Response Codes

| Code | Description |
|-------|-------------|
|200|Success|
|201|Created|
|400|Bad Request|
|401|Unauthorized|
|403|Forbidden|
|404|Not Found|
|500|Internal Server Error|

---

# Authentication & Authorization

The application uses JWT-based authentication.

Protected routes require

```
Authorization

Bearer <token>
```

Authorization is validated on both

- Client
- Server

Unauthorized requests receive

```
401 Unauthorized
```

Forbidden actions receive

```
403 Forbidden
```

---

# Pagination

Supported Query Parameters

```
?page=1

?limit=10
```

---

# Filtering

```
?status=New

?status=Qualified

?assignedTo=userId
```

---

# Search

```
?search=john
```

Searches

- Name
- Email
- Company

---

# Testing

Automated tests cover:

- Authentication
- Protected Routes
- Permission Enforcement
- Lead Creation
- Lead Assignment
- Lead Status Updates

Run tests

```bash
cd backend

npm test
```

---

# Deployment

Frontend

- Vercel

Backend

- Render

Database

- Neon PostgreSQL

---

# Test Credentials

## Admin

Email

```
shivam@test.com
```

Password

```
123456
```

---

## Member

Email

```
member@example.com
```

Password

```
123456
```

---

# Screenshots

## Public Form

![Public Lead Capture](./screenshots/img5.png)

---

---

## Dashboard

[Dashboard Capture](./screenshots/img4.png)

---

## Leads

![Leads](./screenshots/img2.png)

---

## Lead Details

![leads](./screenshots/img3.png)

---

# Assignment Requirements Checklist

| Requirement | Status |
|------------|--------|
|Public Lead Capture Form|✅|
|Authenticated Dashboard|✅|
|Admin & Member Roles|✅|
|Role-Based Permissions|✅|
|Lead Lifecycle|✅|
|Lead Assignment|✅|
|Notes with Timestamps|✅|
|Activity Trail|✅|
|REST JSON API|✅|
|Pagination|✅|
|Filtering|✅|
|Proper HTTP Status Codes|✅|
|API Documentation|✅|
|Automated Tests|✅|
|Free-Tier Deployment|✅|
|Public GitHub Repository|✅|

---

# Future Improvements

- Email notifications
- CSV import/export
- Advanced analytics dashboard
- Lead reminders
- File attachments
- WebSocket live updates
- Audit reports

---

# License

This project was developed for the **Digital Heroes Full Stack Development Training Task**.

---

## Author

**Shivam Sharma**

GitHub: https://github.com/Shivam000189/

X: https://x.com/shivam_s0

---

### Footer Credit

Built for **Digital Heroes Training Task**

https://digitalheroesco.com