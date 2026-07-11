# Manufacturing Scheduling System

Full-stack manufacturing scheduling system for managing machines, production tasks, and scheduler activity in a single interface. The project is built around a plant-floor workflow where tasks are assigned to compatible machines based on machine type, capabilities, availability, and scheduling status.

##View live:
Frontend:[https://task-scheduling-system-zb2n.vercel.app/](https://task-scheduling-system-zb2n.vercel.app/)
Backend: https://task-scheduling-system-ec5m-p8olr5k9f.vercel.app/

## Overview

This application helps simulate and manage a manufacturing environment with:

- machine management
- task management
- automated scheduler execution
- activity tracking
- analytics and dashboard views

The current product focus is the `Machines` and `Tasks` domain. Older driver and route modules were legacy reference modules and have been removed from the active application flow.

## Tech Stack

### Frontend

- `React`
- `TypeScript`
- `Vite`
- `React Router`
- `TanStack React Query`
- `SCSS`
- `Redux Toolkit`
- `Axios`
- `Framer Motion`
- `React Toastify`

### Backend

- `Node.js`
- `Express.js`
- `MongoDB`
- `Mongoose`

### Deployment

- `Vercel` for frontend deployment
- `MongoDB Atlas` for database hosting

## Core Modules

### Machines

- add, edit, delete, and view machines
- machine details with status, capabilities, efficiency, working time, idle time, maintenance time, and task history
- bulk delete support

### Tasks

- add, edit, delete, and view tasks
- filter and paginate tasks
- mark running tasks as completed
- bulk delete support

### Scheduler

- run scheduler from the frontend
- assign tasks to matching machines
- update machine and task states
- surface current assignments and unscheduled tasks

### Dashboard, Analytics, and Activity

- dashboard overview of plant health
- analytics for machine and task status trends
- activity timeline for scheduler and task events

## Scheduler Logic

The scheduler works by matching tasks to machines using:

- `required_machine_type`
- `required_capabilities`
- machine availability

When a task is completed:

- task status is updated
- machine status is released back to idle
- previous assignment history is preserved
- efficiency and tracked time metrics are updated

## Project Structure

```text
driver-scheduling-system/
├── Backend-server/
│   ├── index.js
│   ├── models/
│   │   ├── ActivityFeedsModel.js
│   │   ├── MachinesModel.js
│   │   └── TasksModel.js
│   ├── routes/
│   │   ├── AddNewMachine_Route.js
│   │   ├── AddNewTask_Route.js
│   │   ├── CompleteTask_Route.js
│   │   ├── EditMachine_Route.js
│   │   ├── EditTask_Route.js
│   │   ├── GetActivityTimeline_Route.js
│   │   ├── GetAllMachines_Route.js
│   │   ├── GetAllTasks_Route.js
│   │   ├── GetDashboard_Route.js
│   │   ├── GetMachineDetails_Route.js
│   │   ├── GetMachineUtilization_Route.js
│   │   ├── GetSystemEfficiency_Route.js
│   │   ├── GetTaskDetails_Route.js
│   │   ├── ResetScheduler_Route.js
│   │   └── RunScheduler_Route.js
│   └── utils/
│       ├── machineIdGenerator.js
│       ├── operatingTime.js
│       ├── serverManager.js
│       └── taskIdGenerator.js
├── Frontend-client/
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── MachinesPage_Components/
│       │   └── TasksPage_Components/
│       ├── pages/
│       │   ├── ActivityPage/
│       │   ├── AnalyticsPage/
│       │   ├── Dashboard/
│       │   ├── MachineDetailsPage/
│       │   ├── MachinesPage/
│       │   ├── SchedulerPage/
│       │   ├── TaskDetailsPage/
│       │   └── TasksPage/
│       └── utils/hooks/api/
└── README.md
```

## Main API Areas

### Machines

- `GET /api/machines`
- `GET /api/machines/:machineId`
- `POST /api/machines`
- `PUT /api/machines/:machineId`
- `DELETE /api/machines/:machineId`

### Tasks

- `GET /api/tasks`
- `GET /api/tasks/:taskId`
- `POST /api/tasks`
- `PUT /api/tasks/:taskId`
- `DELETE /api/tasks/:taskId`
- `POST /api/tasks/:taskId/complete`

### Scheduler and Insights

- `POST /api/run-scheduler`
- `POST /api/scheduler/run`
- `POST /api/scheduler/reset`
- `GET /api/dashboard`
- `GET /api/activity`
- `GET /api/analytics/machine-utilization`
- `GET /api/analytics/system-efficiency`

### Auth

- `POST /api/auth/sendotp`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/changepassword`

JWT-protected routes accept:

```http
Authorization: Bearer your_jwt_token
```

Mutation routes for machines, tasks, and scheduler operations now require a verified user. `Admin` and `Manager` can create, edit, and delete machines and reset the scheduler. `Admin`, `Manager`, and `Operator` can create, edit, and delete tasks, run the scheduler, and complete tasks. Running tasks cannot be deleted until they are completed. Public signup creates `Operator` users by default; `Admin` or `Manager` signup requires `roleSignupSecret` matching `ROLE_SIGNUP_SECRET`.

## Local Setup

### Prerequisites

- `Node.js` 18+
- `npm`
- `MongoDB Atlas` connection string or local MongoDB instance

### Backend

```bash
cd Backend-server
npm install
```

Create a `.env` file with:

```env
PORT=6060
DATABASE_URL=your_mongodb_connection_string
JWT_SECRET_KEY=replace_with_a_long_random_secret
JWT_EXPIRES_IN=2h
ROLE_SIGNUP_SECRET=optional_secret_for_admin_or_manager_signup
MAIL_HOST=your_smtp_host
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your_smtp_username
MAIL_PASSWORD=your_smtp_password_or_app_password
MAIL_FROM=Task Scheduling System
```

Run the server:

```bash
npm start
```

### Frontend

```bash
cd Frontend-client
npm install
```

Create a `.env` file with:

```env
VITE_API_BASE_URL=http://localhost:6060
```

Run the frontend:

```bash
npm run dev
```


## Team

- `Ranveer Singh`
- `Imran Ali`


