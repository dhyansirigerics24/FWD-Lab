// --- Global Data Setup (Using localStorage for temporary persistence) ---

// Default patient data list for demonstration
const INITIAL_PATIENTS = [
    { id: 'P1001', name: 'Karan S.', age: 34, room: 'A-101', condition: 'Critical', lastUpdate: '10 min ago' },
    { id: 'P1002', name: 'Ria V.', age: 67, room: 'B-205', condition: 'Stable', lastUpdate: '2 min ago' },
    { id: 'P1003', name: 'Manish R.', age: 55, room: 'C-310', condition: 'Serious', lastUpdate: '25 min ago' },
    { id: 'P1004', name: 'Sarah L.', age: 22, room: 'A-105', condition: 'Fair', lastUpdate: '1 hour ago' },
];

// Helper to get patients from localStorage or use defaults
function getPatients() {
    const patientsJSON = localStorage.getItem('hospital_patients');
    // If data exists, parse and return it. If not, save the default list and return it.
    if (patientsJSON) {
        return JSON.parse(patientsJSON);
    } else {
        localStorage.setItem('hospital_patients', JSON.stringify(INITIAL_PATIENTS));
        return INITIAL_PATIENTS;
    }
}

// Helper to save patients to localStorage
function savePatients(patients) {
    localStorage.setItem('hospital_patients', JSON.stringify(patients));
}

// Helper function to show only the main dashboard
function showDashboard() {
    document.getElementById('staffing-report-view').style.display = 'none';
    document.getElementById('patient-details-view').style.display = 'none';
    document.getElementById('patient-admission-view').style.display = 'none';
    document.getElementById('main-dashboard-view').style.display = 'flex';
    renderDashboardSummary(); // Re-render summary cards when returning to dashboard
}

// --- NEW FUNCTION: Handle Patient Admission ---
function admitPatient(event) {
    event.preventDefault(); // Stop default form submission

    const patientId = document.getElementById('new-patient-id').value.trim().toUpperCase();
    const patientName = document.getElementById('new-patient-name').value.trim();
    const patientWard = document.getElementById('new-patient-ward').value.trim();
    const patientCondition = document.getElementById('new-patient-condition').value;
    const patientAge = document.getElementById('new-patient-age').value.trim();
    const lastUpdate = 'Just now';

    if (!patientId || !patientName || !patientWard || !patientCondition || !patientAge) {
        alert("Please fill in all required fields.");
        return;
    }

    const patients = getPatients();
    // Check for duplicate ID
    if (patients.some(p => p.id === patientId)) {
        alert(`Patient ID ${patientId} already exists. Please use a unique ID.`);
        return;
    }
    
    const newPatient = {
        id: patientId,
        name: patientName,
        age: parseInt(patientAge),
        room: patientWard,
        condition: patientCondition,
        lastUpdate: lastUpdate
    };

    patients.push(newPatient);
    savePatients(patients); // Save the updated list

    alert(`Patient ${patientName} (${patientId}) admitted successfully!`);
    
    // Clear the form and navigate back to the dashboard
    document.getElementById('patient-admission-form').reset();
    showDashboard();
}

// --- MODIFIED FUNCTION: Render the Patient Details Report Table ---
function renderPatientDetails() {
    // Hide other views
    document.getElementById('main-dashboard-view').style.display = 'none';
    document.getElementById('staffing-report-view').style.display = 'none';
    document.getElementById('patient-admission-view').style.display = 'none';
    // Show this view
    document.getElementById('patient-details-view').style.display = 'block';

    const patients = getPatients();
    const tableBody = document.getElementById('patient-details-table-body');
    tableBody.innerHTML = ''; // Clear previous entries

    let tableHTML = '';

    patients.forEach(patient => {
        let conditionColor = '#ccc';
        let conditionType = patient.condition.toLowerCase();

        if (conditionType === 'critical' || conditionType === 'serious') {
            conditionColor = '#e74c3c'; // Red/Serious
        } else if (conditionType === 'stable' || conditionType === 'improving') {
            conditionColor = '#2ecc71'; // Green/Stable
        } else if (conditionType === 'fair') {
             conditionColor = '#f39c12'; // Orange/Fair
        }
        
        tableHTML += `
            <tr>
                <td>${patient.id}</td>
                <td>${patient.name}</td>
                <td>${patient.age}</td>
                <td>${patient.room}</td>
                <td>
                    <span class="status-badge" style="background-color: ${conditionColor};">
                        ${patient.condition}
                    </span>
                </td>
                <td>${patient.lastUpdate}</td>
            </tr>
        `;
    });

    tableBody.innerHTML = tableHTML;
}

// --- NEW FUNCTION: Render Dashboard Summary Cards ---
function renderDashboardSummary() {
    const patients = getPatients();
    
    let criticalCount = 0;
    let stableCount = 0;
    let totalCount = patients.length;

    patients.forEach(patient => {
        const conditionType = patient.condition.toLowerCase();
        if (conditionType === 'critical' || conditionType === 'serious') {
            criticalCount++;
        } else {
            // Count Stable, Fair, Improving, etc., as non-critical for this summary
            stableCount++;
        }
    });
    
    // Update Summary Cards
    document.getElementById('report-total-patients').textContent = totalCount;
    document.getElementById('report-critical-patients').textContent = criticalCount;
    document.getElementById('report-stable-patients').textContent = stableCount;

    // Update Quick Patient Details (first two entries)
    const patientDetailsContainer = document.getElementById('patient-details-container');
    patientDetailsContainer.innerHTML = '';

    if (patients.length > 0) {
        patients.slice(0, 2).forEach(patient => {
            const statusClass = (patient.condition.toLowerCase() === 'critical' || patient.condition.toLowerCase() === 'serious') ? 'status-critical' : 'status-stable';
            const iconClass = (patient.condition.toLowerCase() === 'critical' || patient.condition.toLowerCase() === 'serious') ? 'fas fa-exclamation-triangle' : 'fas fa-check-circle';
            
            const detailCard = document.createElement('div');
            detailCard.className = 'patient-detail-card';
            detailCard.innerHTML = `
                <p>Patient <strong>${patient.name}</strong> - ${patient.room}</p>
                <p class="${statusClass}"><i class="${iconClass}"></i> ${patient.condition}</p>
            `;
            patientDetailsContainer.appendChild(detailCard);
        });
        document.getElementById('patient-data-status').style.display = 'none';
    } else {
        document.getElementById('patient-data-status').style.display = 'block';
    }
}

// --- NEW HELPER FUNCTION: Clear a specific alert from localStorage ---
function clearAlert(key) {
    localStorage.removeItem(key);
    // Re-render the alerts after clearing
    checkAndDisplaySOS(); 
}

// -------------------------------------------------------------------
// --- EXISTING CODE (for Staffing, SOS, and initial setup) ---
// -------------------------------------------------------------------

function requestCylinders() {
    const quantityInput = document.getElementById('cylinder-quantity');
    const quantity = parseInt(quantityInput.value);
    
    const adminId = localStorage.getItem('current_admin_id') || 'UNKNOWN_STAFF';

    if (quantity > 0) {
        console.log(`--- OXYGEN CYLINDER REQUEST ---`);
        console.log(`Requested Quantity: ${quantity}`);
        console.log(`Requested By Staff ID: ${adminId}`);
        console.log(`-------------------------------`);
        alert(`Request for ${quantity} oxygen cylinders submitted by Staff ID ${adminId}.`);
        quantityInput.value = 5; 
    } else {
        alert("Please enter a valid quantity (1 or more).");
    }
}


        // Default values to use if nothing is saved in localStorage
        const DEFAULT_STAFF_COUNTS = {
            doctors: 12,
            nurses: 35,
            admins: 8
        };

        // Helper function to get the correct initial count (saved or default)
        function getInitialCount(type) {
            const savedCount = localStorage.getItem(`staff_count_${type}`);
            return savedCount ? parseInt(savedCount) : DEFAULT_STAFF_COUNTS[type];
        }

        // --- SOS Alert Persistence (MODIFIED TO HANDLE DOCTOR REQUESTS) ---
        function checkAndDisplaySOS() {
            const sosAlert = localStorage.getItem('critical_sos_alert');
            // NEW: Check for Doctor Request alert
            const doctorRequestAlert = localStorage.getItem('critical_doctor_request_alert');

            const alertsCard = document.getElementById('critical-alerts-card');
            const defaultAlert = document.getElementById('default-alert');

            // Clear previous alerts
            alertsCard.querySelectorAll('.live-alert-item').forEach(el => el.remove());

            if (sosAlert || doctorRequestAlert) {
                
                alertsCard.classList.add('critical-active'); 
                defaultAlert.style.display = 'none';

                // 1. Display Doctor Request Alert (if present)
                if (doctorRequestAlert) {
                    const newAlert = document.createElement('div');
                    newAlert.className = 'alert-content live-alert-item';
                    newAlert.id = 'doctor-live-alert';
                    
                    // Extract Criticality for icon/color cue if needed, but display full message
                    const match = doctorRequestAlert.match(/Criticality: \*\*(.+?)\*\*/);
                    const criticality = match ? match[1] : 'REQUEST';

                    newAlert.innerHTML = `
                        <i class="fas fa-user-md" style="color: #007bff; font-size: 24px;"></i>
                        <p><strong>🚨 ${criticality}: Doctor Request!</strong> ${doctorRequestAlert.substring(doctorRequestAlert.indexOf('Patient'))}</p>
                        <button onclick="clearAlert('critical_doctor_request_alert')" style="background-color: #3498db; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Resolve</button>
                    `;
                    alertsCard.appendChild(newAlert);
                }

                // 2. Display SOS Alert (if present)
                if (sosAlert) {
                    const match = sosAlert.match(/SOS from Patient (.+) triggered at (.+)/);
                    let name = 'Unknown Patient';
                    let time = '';

                    if (match && match.length === 3) {
                        name = match[1].trim();
                        time = match[2].trim();
                    }

                    const newAlert = document.createElement('div');
                    newAlert.className = 'alert-content live-alert-item';
                    newAlert.id = 'sos-live-alert';
                    newAlert.innerHTML = `
                        <i class="fas fa-heart-crack" style="color: #e74c3c; font-size: 24px;"></i>
                        <p><strong>🚨 EMERGENCY: SOS from Patient ${name}!</strong> ${time ? `(${time})` : ''}</p>
                        <button onclick="clearAlert('critical_sos_alert')" style="background-color: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Resolve</button>
                    `;
                    alertsCard.appendChild(newAlert);
                }
                
            } else {
                // No active alerts
                defaultAlert.style.display = 'flex';
                alertsCard.classList.remove('critical-active'); 
            }
        }
        
        // --- STAFFING LOGIC ---
        
        const STAFF_SPECIALIZATIONS = {
            doctors: [
                'General Surgeon', 'Cardiology', 'Emergency Medicine', 'Pediatrics', 
                'Anesthesiology', 'Neurology', 'Internal Medicine', 'Orthopedics'
            ],
            nurses: [
                'ICU', 'ER', 'General Floor', 'OR', 'Trauma', 'Labor & Delivery'
            ],
            admins: [
                'Admissions', 'Billing', 'HR', 'IT Support', 'Records', 'Logistics'
            ]
        };

        const FIRST_NAMES = [
            'Alex', 'Maya', 'Chris', 'Jordan', 'Riley', 'Jamie', 'Skylar', 
            'Taylor', 'Drew', 'Avery', 'Kai', 'Morgan', 'Quinn', 'Rowan'
        ];
        const LAST_NAMES = [
            'Smith', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 
            'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Brown'
        ];

        function getRandomElement(arr) {
            return arr[Math.floor(Math.random() * arr.length)];
        }

        function generateRandomStaff(type, count) {
            const staffList = [];
            const specializationPool = STAFF_SPECIALIZATIONS[type];

            for (let i = 0; i < count; i++) {
                const id = `${type.slice(0, 1).toUpperCase()}${Math.floor(Math.random() * 9000 + 1000)}`;
                const name = `${getRandomElement(FIRST_NAMES)} ${getRandomElement(LAST_NAMES)}`;
                const specialization = getRandomElement(specializationPool);
                
                staffList.push({ id, name, type, specialization });
            }
            return staffList;
        }

        function showStaffingReport() {
            const dashboardView = document.getElementById('main-dashboard-view');
            const reportView = document.getElementById('staffing-report-view');
            const patientView = document.getElementById('patient-details-view');
            const admissionView = document.getElementById('patient-admission-view');
            
            dashboardView.style.display = 'none';
            patientView.style.display = 'none';
            admissionView.style.display = 'none';
            reportView.style.display = 'block';

            const doctorsCount = getInitialCount('doctors');
            const nursesCount = getInitialCount('nurses');
            const adminsCount = getInitialCount('admins');

            const allStaff = [
                ...generateRandomStaff('doctors', doctorsCount),
                ...generateRandomStaff('nurses', nursesCount),
                ...generateRandomStaff('admins', adminsCount)
            ];
            
            document.getElementById('report-doctors-count').textContent = doctorsCount;
            document.getElementById('report-nurses-count').textContent = nursesCount;
            document.getElementById('report-admins-count').textContent = adminsCount;
            
            const tableBody = document.getElementById('staffing-table-body');
            let tableHTML = '';
            
            allStaff.forEach(staff => {
                tableHTML += `
                    <tr>
                        <td class="staff-id">${staff.id}</td>
                        <td>${staff.name}</td>
                        <td class="staff-type">${staff.type}</td>
                        <td>${staff.specialization}</td>
                    </tr>
                `;
            });

            tableBody.innerHTML = tableHTML;
            
            document.getElementById('report-date').textContent = `(as of ${new Date().toLocaleDateString()})`;
        }
        
        // --- Initialization and Event Listeners ---
        document.addEventListener('DOMContentLoaded', () => {
            
            // Initial Dashboard Summary Render
            renderDashboardSummary();

            // Run SOS Check (now checks for Doctor Requests too)
            checkAndDisplaySOS();
            setInterval(checkAndDisplaySOS, 2000); 
            
            // 1. Quick Actions Button Handlers
            
            // Admit New Patient
            document.getElementById('admit-patient-btn').addEventListener('click', () => {
                document.getElementById('main-dashboard-view').style.display = 'none';
                document.getElementById('patient-admission-view').style.display = 'block';
            });

            // View All Reports (Directs to Patient Details)
            document.getElementById('view-reports-btn').addEventListener('click', (event) => {
                event.preventDefault();
                renderPatientDetails();
            });

            // Handle Patient Admission Form Submission
            document.getElementById('patient-admission-form').addEventListener('submit', admitPatient);


            // 2. Navbar Link and Back Button Handlers
            
            // Navbar: Staffing Link
            document.getElementById('staffing-link').addEventListener('click', (event) => {
                event.preventDefault();
                showStaffingReport();
            });
            
            // Navbar: Patient Details Link
            document.getElementById('patient-details-link').addEventListener('click', (event) => {
                event.preventDefault();
                renderPatientDetails(); 
            });

            // Back to Dashboard from Staffing Report
            document.getElementById('back-to-dashboard-btn').addEventListener('click', showDashboard);
            
            // Back to Dashboard from Patient Details
            document.getElementById('back-to-dashboard-from-patient-btn').addEventListener('click', showDashboard);

            // Back to Dashboard from Patient Admission
            document.getElementById('back-to-dashboard-from-admission-btn').addEventListener('click', showDashboard);
        });