# DocFlow - Smart Document Approval & Tracking System

DocFlow is a comprehensive MERN stack application designed for educational institutions to streamline document submission, approval, and tracking processes. It features automated workflow routing, real-time tracking, and role-based access control.

![DocFlow Banner](https://via.placeholder.com/1200x400/1976d2/ffffff?text=DocFlow+Smart+Document+Approval+System)

## Features

### 🎯 Core Features
- **Multi-role System**: Students, Approvers, and Administrators
- **Document Submission**: Upload PDF, JPEG, PNG files with validation
- **Automated Workflow**: Predefined approval stages per document type
- **Real-time Tracking**: Live status updates using Socket.io
- **Email Notifications**: Automated emails for submissions and approvals
- **File Management**: Cloud storage integration with Cloudinary

### 👥 User Roles
- **Students**: Submit documents, track status, view history
- **Approvers**: Review, approve/reject documents, add comments
- **Administrators**: Manage users, workflows, system settings

### 📊 Dashboard Features
- **Student Dashboard**: Document submission and tracking
- **Approver Dashboard**: Pending reviews and department queue
- **Admin Dashboard**: System analytics and user management

## Tech Stack

### Frontend
- **React 18** with Vite
- **Material-UI** for components
- **React Router** for navigation
- **Axios** for API calls
- **Socket.io-client** for real-time updates
- **React Dropzone** for file uploads
- **Formik & Yup** for form handling
- **Chart.js** for data visualization

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Socket.io** for WebSocket connections
- **Multer** for file uploads
- **Cloudinary** for file storage
- **Nodemailer** for email notifications
- **Bcryptjs** for password hashing

## Prerequisites

Before you begin, ensure you have installed:
- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn** package manager

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/docflow.git
cd docflow

xddvdd