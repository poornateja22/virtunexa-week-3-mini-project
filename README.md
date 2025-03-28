# Job Application Tracker

## Overview

The Job Application Tracker is a web-based application that helps users manage and organize their job applications effectively. It allows users to add, edit, delete, filter, import, and export job applications while providing key statistics and reminders for upcoming deadlines. The project is built using HTML, CSS (Bootstrap), and JavaScript with local storage for data persistence.

## Features

### 1. Job Application Management
- Add, edit, delete job applications
- Store job details such as:
  -  Company Name
  - Job Position
  - Location
  - Job Type (Full-time, Part-time, Internship, etc.)
  - Salary (if applicable)
  - Application Status (Applied, Interview, Offered, Rejected, etc.)
  - Date Applied
  - Application Deadline
  - Job Listing URL
  - Personal Notes
  - Reminder system for application follow-ups

### 2. Application Status Tracking
- Categorizes job applications based on status:
  - Applied - Application submitted
  - Interview - Interview scheduled
  - Offered - Offer received
  - Rejected - Application declined
  - Hired - Successfully joined the company
- Filter and sort applications based on status

### 3. Dashboard & Statistics
- Displays an overview of:
  - Total applications
  - Active applications
  - Number of interviews
  - Job offers received
  - Applications with upcoming deadlines

### 4. Import & Export

- Import from CSV: Load job applications from a CSV file
- Export to CSV: Download all job applications for backup

## Technologies Used

HTML5 - Structuring web pages
CSS3 (Bootstrap 5) - Styling and responsiveness
JavaScript (ES6+) - Functionality and event handling
Local Storage - Data persistence

## Future Enhancements

User Authentication: Allow users to save their applications online
Database Integration: Store applications in Firebase, MongoDB, or SQL
Job Search API Integration: Fetch job listings from LinkedIn/Indeed
Email Reminders: Send notifications for upcoming deadlines
PDF Export: Generate downloadable job reports
Advanced Filters: Search by company, job type, or salary
