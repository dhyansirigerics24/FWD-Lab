document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. BMI Calculator Logic (NO CHANGE) ---
    const weightInput = document.getElementById('weight');
    const heightInput = document.getElementById('height');
    const calculateBtn = document.querySelector('.calculate-btn');
    const bmiCard = document.querySelector('.bmi-card');

    calculateBtn.addEventListener('click', () => {
        const weight = parseFloat(weightInput.value); // in kg
        const height = parseFloat(heightInput.value) / 100; // in meters (from cm)

        if (isNaN(weight) || isNaN(height) || height <= 0) {
            alert("Please enter valid weight and height.");
            return;
        }

        const bmi = weight / (height * height);

        const resultDisplay = document.createElement('p');
        resultDisplay.id = 'bmi-result';
       
        let status = '';
        if (bmi < 18.5) {
            status = 'Underweight 😞';
        } else if (bmi >= 18.5 && bmi < 24.9) {
            status = 'Normal Weight 😊';
        } else if (bmi >= 25 && bmi < 29.9) {
            status = 'Overweight 😬';
        } else {
            status = 'Obese 😨';
        }

        resultDisplay.innerHTML = `Your **BMI is ${bmi.toFixed(1)}** (${status})`;
       
        // Remove previous result if it exists
        const oldResult = document.getElementById('bmi-result');
        if (oldResult) {
            oldResult.remove();
        }

        bmiCard.appendChild(resultDisplay);
    });

    // --- 2. Daily Goals Logic (NO CHANGE) ---
    const updateGoalsBtn = document.querySelector('.update-goal-btn');

    // Goal Configuration (Max values based on HTML text)
    const GOALS = {
        steps: { inputId: 'steps', barId: 'steps-progress', countId: 'steps-count', max: 10000 },
        water: { inputId: 'water', barId: 'water-progress', countId: 'water-count', max: 8 },
        sleep: { inputId: 'sleep', barId: 'sleep-progress', countId: 'sleep-count', max: 8 }
    };

    /**
     * Calculates and updates the display count and progress bars for daily goals.
     */
    function updateGoalProgress() {
        let overallProgress = 0;
        let completedGoalCount = 0;
        const totalGoals = Object.keys(GOALS).length;

        for (const key in GOALS) {
            const goal = GOALS[key];
            const inputElement = document.getElementById(goal.inputId);
            const barElement = document.getElementById(goal.barId);
            const countElement = document.getElementById(goal.countId);

            if (inputElement && barElement && countElement) {
                const currentValue = parseFloat(inputElement.value) || 0;
                const progress = Math.min(100, (currentValue / goal.max) * 100);
                
                // Update the bar visually
                barElement.style.width = `${progress}%`;
                
                // Update the count text
                countElement.textContent = currentValue.toFixed(0); 

                // Check if goal is completed (100% progress)
                if (progress >= 100) {
                    completedGoalCount++;
                }

                overallProgress += progress;
            }
        }
        
        // Update the main activity circle (simple average of all goal progress)
        const avgProgress = totalGoals > 0 ? (overallProgress / totalGoals) : 0;
        const progressCircle = document.querySelector('.progress-circle');

        if (progressCircle) {
            // Update the conic gradient to reflect the overall average progress
            progressCircle.style.background = `conic-gradient(var(--progress-fill) ${avgProgress}%, var(--progress-unfill) ${avgProgress}%)`;
            const activityLabel = progressCircle.querySelector('.activity-label');
            if (activityLabel) {
                 activityLabel.innerHTML = `**${avgProgress.toFixed(0)}%**<br>Activity`;
            }
        }
    }

    // Event listener for the update button
    updateGoalsBtn.addEventListener('click', updateGoalProgress);

    // Initialize goals on page load
    updateGoalProgress();

    // --- 3. SOS Button Alert (NO CHANGE) ---
    const sosButton = document.querySelector('.sos-button');
    sosButton.addEventListener('click', () => {
        if (confirm("Are you sure you want to call Emergency Services?")) {
            console.log("SOS triggered! Sending signal to hospital dashboard.");
            
            // 1. Get the patient name from localStorage
            const patientName = localStorage.getItem('current_patient_name') || 'Patient Karan S.'; 
            
            // 2. Use the patient name in the alert message
            const sosMessage = `SOS from Patient ${patientName} triggered at ${new Date().toLocaleTimeString()}`;

            // --- SIMULATION START ---
            // Store the new, patient-specific message
            localStorage.setItem('critical_sos_alert', sosMessage);
            // --- SIMULATION END ---
            alert("Emergency signal sent (Simulated)");
        }
    });

    // --- NEW HELPERS FOR MULTIPLE REQUESTS ---
    function getDoctorRequests() {
        const requestsJSON = localStorage.getItem('doctor_request_queue');
        return requestsJSON ? JSON.parse(requestsJSON) : [];
    }

    // --- 4. Book Now/Doctor Connect Logic (MODIFIED for queue system) ---
    const bookNowBtn = document.querySelector('.book-now-btn');
    bookNowBtn.addEventListener('click', () => {
        // 1. Get patient name
        const patientName = localStorage.getItem('current_patient_name') || 'Patient Karan S.';

        // 2. Prompt for reason and criticality
        const reason = prompt("What is the reason for requesting a doctor connection?");
        if (!reason) {
            alert("Request cancelled.");
            return;
        }

        const criticality = prompt("How critical is your request? (e.g., Low, Medium, High)");
        if (!criticality) {
            alert("Request cancelled.");
            return;
        }
        
        // --- LOGIC FOR QUEUE STORAGE ---
        const queueKey = 'doctor_request_queue';

        // Get existing queue or start a new one
        const doctorRequestQueue = getDoctorRequests();

        // Create the new request object
        const newRequest = {
            id: Date.now(), // Use timestamp as a unique ID for removal
            name: patientName,
            reason: reason,
            criticality: criticality.toUpperCase(), // Keep criticality for sorting/reference
            timestamp: new Date().toISOString()
        };

        // Add the new request to the queue
        doctorRequestQueue.push(newRequest);

        // Store the updated queue
        localStorage.setItem(queueKey, JSON.stringify(doctorRequestQueue));
        
        // Optionally remove the old single alert key for cleanup
        localStorage.removeItem('critical_doctor_request_alert');

        const queueNumber = doctorRequestQueue.length;
        alert(`Doctor request sent for ${patientName} (Criticality: ${criticality}). A staff member will connect with you shortly. `);
        console.log("Doctor Request Sent:", newRequest);
    });

    // Set a default patient name for simulation purposes
    if (!localStorage.getItem('current_patient_name')) {
        localStorage.setItem('current_patient_name', 'Karan S.');
    }
});
