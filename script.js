// DOM Elements
const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
const navLinks = document.querySelector(".nav-links");
const applicationForm = document.getElementById("application-form");
const applicationsTableBody = document.getElementById("applications-table-body");
const noApplicationsMsg = document.getElementById("no-applications");
const searchInput = document.getElementById("search-applications");
const statusFilter = document.getElementById("filter-status");
const jobTypeFilter = document.getElementById("filter-job-type");
const sortBySelect = document.getElementById("sort-by");
const sortThenBySelect = document.getElementById("sort-then-by");
const editModal = document.getElementById("edit-modal");
const detailsModal = document.getElementById("details-modal");
const importExportModal = document.getElementById("import-export-modal");
const editForm = document.getElementById("edit-form");
const closeModalBtns = document.querySelectorAll(".close-modal");
const importExportBtn = document.getElementById("import-export-btn");
const themeToggle = document.getElementById("theme-toggle");
const tableHeaders = document.querySelectorAll(".applications-table th[data-sort]");

// Stats elements
const totalCountEl = document.getElementById("total-count");
const activeCountEl = document.getElementById("active-count");
const interviewCountEl = document.getElementById("interview-count");
const offersCountEl = document.getElementById("offers-count");
const upcomingCountEl = document.getElementById("upcoming-count");

// Import/Export elements
const importFileInput = document.getElementById("import-file");
const importBtn = document.getElementById("import-btn");
const exportCsvBtn = document.getElementById("export-csv-btn");
const exportPdfBtn = document.getElementById("export-pdf-btn");

// Mobile Menu Toggle
mobileMenuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("active");
});

// Scroll to section when clicking nav links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        navLinks.classList.remove("active");
        document.querySelector(this.getAttribute("href")).scrollIntoView({
            behavior: "smooth",
        });
    });
});

// Theme Toggle
themeToggle.addEventListener("change", () => {
    if (themeToggle.checked) {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
        document.querySelector(".theme-icon").textContent = "☀️";
    } else {
        document.documentElement.setAttribute("data-theme", "light");
        localStorage.setItem("theme", "light");
        document.querySelector(".theme-icon").textContent = "🌙";
    }
});

// Check for saved theme preference
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    themeToggle.checked = true;
    document.querySelector(".theme-icon").textContent = "☀️";
}

// Application functionality
let applications = JSON.parse(localStorage.getItem("jobApplications")) || [];
let currentApplicationId = parseInt(localStorage.getItem("applicationId")) || 1;
let currentSortField = "dateApplied";
let currentSortDirection = "desc";
let secondarySortField = null;

// Initialize the application
function init() {
    renderApplications();
    updateStats();
}

// Save application to localStorage
function saveApplications() {
    localStorage.setItem("jobApplications", JSON.stringify(applications));
    localStorage.setItem("applicationId", currentApplicationId.toString());
}

// Add new application
applicationForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const newApplication = {
        id: currentApplicationId++,
        company: document.getElementById("company").value,
        position: document.getElementById("position").value,
        location: document.getElementById("location").value,
        jobType: document.getElementById("job-type").value,
        status: document.getElementById("status").value,
        salary: document.getElementById("salary").value,
        dateApplied: document.getElementById("date-applied").value,
        deadline: document.getElementById("deadline").value,
        jobUrl: document.getElementById("job-url").value,
        reminder: document.getElementById("reminder").checked,
        notes: document.getElementById("notes").value,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString()
    };

    applications.push(newApplication);
    saveApplications();
    applicationForm.reset();

    renderApplications();
    updateStats();
    showToast("Application added successfully!", "success");

    // Scroll to applications section
    document.getElementById("view-applications").scrollIntoView({
        behavior: "smooth",
    });
});

// Render applications table
function renderApplications() {
    const filteredApplications = filterApplications();
    const sortedApplications = sortApplications(filteredApplications);

    applicationsTableBody.innerHTML = "";

    if (sortedApplications.length === 0) {
        noApplicationsMsg.style.display = "block";
    } else {
        noApplicationsMsg.style.display = "none";

        sortedApplications.forEach((app) => {
            const row = document.createElement("tr");

            const formattedDate = new Date(app.dateApplied).toLocaleDateString();
            const formattedDeadline = app.deadline ? new Date(app.deadline).toLocaleDateString() : "—";

            let statusClass = "";
            switch (app.status) {
                case "Applied":
                    statusClass = "status-applied";
                    break;
                case "Interview":
                    statusClass = "status-interview";
                    break;
                case "Rejected":
                    statusClass = "status-rejected";
                    break;
                case "Offered":
                    statusClass = "status-offered";
                    break;
            }

            row.innerHTML = `
                <td>${app.company}</td>
                <td>${app.position}</td>
                <td>${formattedDate}</td>
                <td><span class="status-badge ${statusClass}">${app.status}</span></td>
                <td>${app.jobType || "—"}</td>
                <td>${formattedDeadline}</td>
                <td>
                    <button class="action-btn view-btn" data-id="${app.id}">View</button>
                    <button class="action-btn edit-btn" data-id="${app.id}">Edit</button>
                    <button class="action-btn delete-btn" data-id="${app.id}">Delete</button>
                </td>
            `;

            applicationsTableBody.appendChild(row);
        });

        // Add event listeners to action buttons
        document.querySelectorAll(".view-btn").forEach((btn) => {
            btn.addEventListener("click", viewApplication);
        });

        document.querySelectorAll(".edit-btn").forEach((btn) => {
            btn.addEventListener("click", openEditModal);
        });

        document.querySelectorAll(".delete-btn").forEach((btn) => {
            btn.addEventListener("click", deleteApplication);
        });
    }
}

// Filter applications based on search and filters
function filterApplications() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value;
    const jobTypeValue = jobTypeFilter.value;

    return applications.filter((app) => {
        const matchesSearch =
            app.company.toLowerCase().includes(searchTerm) ||
            app.position.toLowerCase().includes(searchTerm) ||
            (app.location && app.location.toLowerCase().includes(searchTerm)) ||
            (app.notes && app.notes.toLowerCase().includes(searchTerm));

        const matchesStatus = statusValue === "All" || app.status === statusValue;
        const matchesJobType = jobTypeValue === "All" || app.jobType === jobTypeValue;

        return matchesSearch && matchesStatus && matchesJobType;
    });
}

// Sort applications
function sortApplications(apps) {
    return [...apps].sort((a, b) => {
        let comparison = 0;
        
        // Primary sort
        if (currentSortField === "dateApplied" || currentSortField === "deadline") {
            const dateA = new Date(a[currentSortField] || "1900-01-01");
            const dateB = new Date(b[currentSortField] || "1900-01-01");
            comparison = dateA - dateB;
        } else {
            const valueA = (a[currentSortField] || "").toLowerCase();
            const valueB = (b[currentSortField] || "").toLowerCase();
            if (valueA < valueB) comparison = -1;
            if (valueA > valueB) comparison = 1;
        }
        
        // Reverse if descending
        if (currentSortDirection === "desc") {
            comparison = comparison * -1;
        }
        
        // Secondary sort if primary sort resulted in equality
        if (comparison === 0 && secondarySortField && secondarySortField !== "none") {
            if (secondarySortField === "dateApplied") {
                const dateA = new Date(a[secondarySortField] || "1900-01-01");
                const dateB = new Date(b[secondarySortField] || "1900-01-01");
                return dateA - dateB;
            } else {
                const valueA = (a[secondarySortField] || "").toLowerCase();
                const valueB = (b[secondarySortField] || "").toLowerCase();
                if (valueA < valueB) return -1;
                if (valueA > valueB) return 1;
            }
        }
        
        return comparison;
    });
}

// Search and filter functionality
searchInput.addEventListener("input", renderApplications);
statusFilter.addEventListener("change", renderApplications);
jobTypeFilter.addEventListener("change", renderApplications);

// Sort functionality
sortBySelect.addEventListener("change", (e) => {
    const [field, direction] = e.target.value.split("-");
    currentSortField = field;
    currentSortDirection = direction;
    renderApplications();
});

sortThenBySelect.addEventListener("change", (e) => {
    secondarySortField = e.target.value;
    renderApplications();
});

// Table header sort
tableHeaders.forEach(header => {
    header.addEventListener("click", () => {
        const field = header.dataset.sort;
        
        if (field === currentSortField) {
            // Toggle direction if same field
            currentSortDirection = currentSortDirection === "asc" ? "desc" : "asc";
        } else {
            // New field, default to ascending
            currentSortField = field;
            currentSortDirection = "asc";
        }
        
        // Update sort dropdown to match
        sortBySelect.value = `${currentSortField}-${currentSortDirection}`;
        
        renderApplications();
    });
});

// View application details
function viewApplication(e) {
    const appId = parseInt(e.target.dataset.id);
    const application = applications.find((app) => app.id === appId);

    if (application) {
        const formattedDate = new Date(application.dateApplied).toLocaleDateString();
        const formattedDeadline = application.deadline 
            ? new Date(application.deadline).toLocaleDateString() 
            : "Not specified";
        const formattedUpdated = new Date(application.lastUpdated).toLocaleString();

        let statusClass = "";
        switch (application.status) {
            case "Applied":
                statusClass = "status-applied";
                break;
            case "Interview":
                statusClass = "status-interview";
                break;
            case "Rejected":
                statusClass = "status-rejected";
                break;
            case "Offered":
                statusClass = "status-offered";
                break;
        }

        const detailsContainer = document.getElementById("application-details");
        detailsContainer.innerHTML = `
            <div style="margin-bottom: 20px;">
                <h4 style="margin-bottom: 5px;">${application.position}</h4>
                <h5 style="color: #7f8c8d; margin-top: 0;">${application.company}</h5>
            </div>
            
            <div style="margin-bottom: 15px;">
                <span class="status-badge ${statusClass}">${application.status}</span>
                <span style="margin-left: 10px; font-size: 0.9rem;">${application.jobType || "Not specified"}</span>
            </div>
            
            <div style="margin-bottom: 15px;">
                <p><strong>Location:</strong> ${application.location || "Not specified"}</p>
                <p><strong>Date Applied:</strong> ${formattedDate}</p>
                <p><strong>Deadline/Follow-up:</strong> ${formattedDeadline}</p>
                ${application.salary ? `<p><strong>Salary:</strong> ${application.salary}</p>` : ""}
                ${
                    application.jobUrl
                        ? `<p><strong>Job URL:</strong> <a href="${application.jobUrl}" target="_blank">${application.jobUrl}</a></p>`
                        : ""
                }
                <p><strong>Reminder Set:</strong> ${application.reminder ? "Yes" : "No"}</p>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h5>Notes:</h5>
                <p style="white-space: pre-line;">${application.notes || "No notes added."}</p>
            </div>
            
            <div style="font-size: 0.8rem; color: #7f8c8d; margin-top: 20px;">
                <p>Last updated: ${formattedUpdated}</p>
            </div>
        `;

        detailsModal.style.display = "flex";
    }
}

// Open edit modal
function openEditModal(e) {
    const appId = parseInt(e.target.dataset.id);
    const application = applications.find((app) => app.id === appId);

    if (application) {
        document.getElementById("edit-id").value = application.id;
        document.getElementById("edit-company").value = application.company;
        document.getElementById("edit-position").value = application.position;
        document.getElementById("edit-location").value = application.location || "";
        document.getElementById("edit-job-type").value = application.jobType;
        document.getElementById("edit-status").value = application.status;
        document.getElementById("edit-salary").value = application.salary || "";
        document.getElementById("edit-date-applied").value = application.dateApplied;
        document.getElementById("edit-deadline").value = application.deadline || "";
        document.getElementById("edit-job-url").value = application.jobUrl || "";
        document.getElementById("edit-reminder").checked = application.reminder;
        document.getElementById("edit-notes").value = application.notes || "";

        editModal.style.display = "flex";
    }
}

// Update application
editForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const appId = parseInt(document.getElementById("edit-id").value);
    const appIndex = applications.findIndex((app) => app.id === appId);

    if (appIndex !== -1) {
        applications[appIndex] = {
            ...applications[appIndex],
            company: document.getElementById("edit-company").value,
            position: document.getElementById("edit-position").value,
            location: document.getElementById("edit-location").value,
            jobType: document.getElementById("edit-job-type").value,
            status: document.getElementById("edit-status").value,
            salary: document.getElementById("edit-salary").value,
            dateApplied: document.getElementById("edit-date-applied").value,
            deadline: document.getElementById("edit-deadline").value,
            jobUrl: document.getElementById("edit-job-url").value,
            reminder: document.getElementById("edit-reminder").checked,
            notes: document.getElementById("edit-notes").value,
            lastUpdated: new Date().toISOString()
        };

        saveApplications();
        renderApplications();
        updateStats();
        closeModal(editModal);
        showToast("Application updated successfully!", "success");
    }
});

// Delete application
function deleteApplication(e) {
    const appId = parseInt(e.target.dataset.id);
    const appIndex = applications.findIndex((app) => app.id === appId);

    if (confirm("Are you sure you want to delete this application?")) {
        if (appIndex !== -1) {
            applications.splice(appIndex, 1);
            saveApplications();
            renderApplications();
            updateStats();
            showToast("Application deleted successfully!", "info");
        }
    }
}

// Update stats
function updateStats() {
    const total = applications.length;
    const active = applications.filter(app => app.status !== "Rejected" && app.status !== "Offered").length;
    const interviews = applications.filter(app => app.status === "Interview").length;
    const offers = applications.filter(app => app.status === "Offered").length;
    
    // Count applications with upcoming deadlines (next 7 days)
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    const upcoming = applications.filter(app => {
        if (!app.deadline) return false;
        const deadlineDate = new Date(app.deadline);
        return deadlineDate >= today && deadlineDate <= nextWeek;
    }).length;

    totalCountEl.textContent = total;
    activeCountEl.textContent = active;
    interviewCountEl.textContent = interviews;
    offersCountEl.textContent = offers;
    upcomingCountEl.textContent = upcoming;
}

// Modal functionality
function closeModal(modal) {
    modal.style.display = "none";
}

closeModalBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        closeModal(btn.closest(".modal"));
    });
});

window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
        closeModal(e.target);
    }
});

// Import/Export Modal
importExportBtn.addEventListener("click", (e) => {
    e.preventDefault();
    importExportModal.style.display = "flex";
});

// Import functionality
importBtn.addEventListener("click", () => {
    const file = importFileInput.files[0];
    if (!file) {
        showToast("Please select a file to import.", "error");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csv = e.target.result;
            const lines = csv.split("\n");
            const headers = lines[0].split(",");
            
            // Check required headers
            const requiredHeaders = ["company", "position", "status", "dateApplied"];
            const allHeadersPresent = requiredHeaders.every(header => 
                headers.map(h => h.trim().toLowerCase()).includes(header.toLowerCase())
            );

            if (!allHeadersPresent) {
                showToast("CSV file is missing required headers (company, position, status, dateApplied).", "error");
                return;
            }

            // Get index of each header
            const headerIndexMap = {};
            headers.forEach((header, index) => {
                headerIndexMap[header.trim().toLowerCase()] = index;
            });

            const importedApplications = [];
            let skippedRows = 0;

            // Process data lines (skip header)
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue; // Skip empty lines
                
                const values = lines[i].split(",");
                
                // Basic validation
                if (values.length !== headers.length) {
                    skippedRows++;
                    continue;
                }

                const application = {
                    id: currentApplicationId++,
                    company: values[headerIndexMap["company"]].trim(),
                    position: values[headerIndexMap["position"]].trim(),
                    status: values[headerIndexMap["status"]].trim(),
                    dateApplied: values[headerIndexMap["dateapplied"]].trim(),
                    createdAt: new Date().toISOString(),
                    lastUpdated: new Date().toISOString()
                };

                // Add optional fields if present
                if (headerIndexMap["location"] !== undefined) {
                    application.location = values[headerIndexMap["location"]].trim();
                }
                
                if (headerIndexMap["jobtype"] !== undefined) {
                    application.jobType = values[headerIndexMap["jobtype"]].trim();
                }
                
                if (headerIndexMap["salary"] !== undefined) {
                    application.salary = values[headerIndexMap["salary"]].trim();
                }
                
                if (headerIndexMap["deadline"] !== undefined) {
                    application.deadline = values[headerIndexMap["deadline"]].trim();
                }
                
                if (headerIndexMap["joburl"] !== undefined) {
                    application.jobUrl = values[headerIndexMap["joburl"]].trim();
                }
                
                if (headerIndexMap["notes"] !== undefined) {
                    application.notes = values[headerIndexMap["notes"]].trim();
                }
                
                if (headerIndexMap["reminder"] !== undefined) {
                    application.reminder = values[headerIndexMap["reminder"]].trim().toLowerCase() === "true";
                } else {
                    application.reminder = false;
                }

                importedApplications.push(application);
            }

            // Add imported applications to existing applications
            applications = [...applications, ...importedApplications];
            saveApplications();
            renderApplications();
            updateStats();
            
            closeModal(importExportModal);
            showToast(
                `Successfully imported ${importedApplications.length} applications${
                    skippedRows > 0 ? ` (${skippedRows} rows skipped)` : ""
                }.`,
                "success"
            );
            
            // Reset file input
            importFileInput.value = "";
            
        } catch (error) {
            console.error(error);
            showToast("Error importing data. Please check your file format.", "error");
        }
    };
    
    reader.readAsText(file);
});

// Export to CSV
exportCsvBtn.addEventListener("click", () => {
    if (applications.length === 0) {
        showToast("No applications to export.", "error");
        return;
    }

    // Create CSV headers
    const headers = [
        "company",
        "position",
        "location",
        "jobType",
        "status",
        "salary",
        "dateApplied",
        "deadline",
        "jobUrl",
        "reminder",
        "notes"
    ];

    // Create CSV rows
    const rows = applications.map(app => {
        return [
            app.company || "",
            app.position || "",
            app.location || "",
            app.jobType || "",
            app.status || "",
            app.salary || "",
            app.dateApplied || "",
            app.deadline || "",
            app.jobUrl || "",
            app.reminder ? "true" : "false",
            app.notes ? app.notes.replace(/\n/g, "\\n") : ""
        ].map(value => `"${value}"`).join(",");
    });

    // Combine headers and rows
    const csv = [headers.join(","), ...rows].join("\n");

    // Create and download file
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", `job_applications_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast("Applications exported to CSV successfully!", "success");
});

// Export to PDF
exportPdfBtn.addEventListener("click", () => {
    showToast("PDF export feature will be coming soon!", "info");
    // Note: Implementing PDF export would typically require a library like jsPDF
    // This would be a future enhancement
});

// Toast notification system
function showToast(message, type = "info") {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement("div");
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
            <span class="toast-message">${message}</span>
        </div>
        <button class="toast-close">&times;</button>
    `;

    document.body.appendChild(toast);

    // Display animation
    setTimeout(() => {
        toast.classList.add("show");
    }, 10);

    // Auto hide after 3 seconds
    const hideTimeout = setTimeout(() => {
        hideToast(toast);
    }, 3000);

    // Close button functionality
    const closeBtn = toast.querySelector(".toast-close");
    closeBtn.addEventListener("click", () => {
        clearTimeout(hideTimeout);
        hideToast(toast);
    });
}

function hideToast(toast) {
    toast.classList.remove("show");
    setTimeout(() => {
        toast.remove();
    }, 300); // Match the CSS transition duration
}

// Initialize application
init();