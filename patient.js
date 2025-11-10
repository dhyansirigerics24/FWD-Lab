document.addEventListener('DOMContentLoaded', () => {

    // --- GOAL TRACKER CONFIGURATION ---
    const GOAL_TARGETS = {
        steps: 10000,
        water: 8, // Liters
        sleep: 8  // Hours
    };

    const DEFAULT_GOALS = {
        steps: 7500,
        water: 6,
        sleep: 7
    };

    // --- PROGRESS TRACKING FUNCTIONS ---

    function loadGoals() {
        try {
            const storedGoals = localStorage.getItem('patient_goals');
            if (storedGoals) {
                return JSON.parse(storedGoals);
            }
        } catch (e) {
            console.error("Error loading goals from localStorage, using defaults.", e);
        }
        return DEFAULT_GOALS;
    }

    function saveGoals(goals) {
        localStorage.setItem('patient_goals', JSON.stringify(goals));
    }

    function calculateProgress(current, target) {
        return Math.min(100, (current / target) * 100);
    }

    function calculateOverallProgress(goals) {
        const stepPct = calculateProgress(goals.steps, GOAL_TARGETS.steps);
        const waterPct = calculateProgress(goals.water, GOAL_TARGETS.water);
        const sleepPct = calculateProgress(goals.sleep, GOAL_TARGETS.sleep);

        // Simple average of the three goals
        const overallPct = (stepPct + waterPct + sleepPct) / 3;

        return {
            overall: Math.round(overallPct),
            steps: Math.round(stepPct * 10) / 10,
            water: Math.round(waterPct * 10) / 10,
            sleep: Math.round(sleepPct * 10) / 10,
        };
    }

    function renderProgress(goals) {
        const progressData = calculateOverallProgress(goals);
        
        // 1. Overall Progress Circle
        const overallProgressValue = document.getElementById('overall-progress-value');
        if (overallProgressValue) {
            overallProgressValue.textContent = `${progressData.overall}%`;
            
            // Dynamic CSS background for the circle to reflect the progress
            const progressCircle = document.querySelector('.progress-circle');
            if (progressCircle) {
                 progressCircle.style.background = `conic-gradient(
                    var(--patient-teal) 0%,
                    var(--patient-teal) ${progressData.overall}%,
                    var(--progress-unfill) ${progressData.overall}%,
                    var(--progress-unfill) 100%
                )`; 
            }
        }


        // 2. Individual Goal Progress Bars
        
        // Steps
        document.getElementById('steps-count').textContent = `${goals.steps.toLocaleString()}`;
        document.getElementById('steps-progress').style.width = `${progressData.steps}%`;

        // Water
        document.getElementById('water-count').textContent = `${goals.water} L`;
        document.getElementById('water-progress').style.width = `${progressData.water}%`;

        // Sleep
        document.getElementById('sleep-count').textContent = `${goals.sleep} h`;
        document.getElementById('sleep-progress').style.width = `${progressData.sleep}%`;

        // 3. Update Input Fields with current values
        document.getElementById('steps').value = goals.steps;
        document.getElementById('water').value = goals.water;
        document.getElementById('sleep').value = goals.sleep;
    }

    function initProgressTracker() {
        const currentGoals = loadGoals();
        renderProgress(currentGoals);

        // Event Listener for the Update Goals Button
        const updateGoalBtn = document.querySelector('.update-goal-btn');
        if (updateGoalBtn) {
            updateGoalBtn.addEventListener('click', () => {
                const newSteps = parseInt(document.getElementById('steps').value);
                const newWater = parseFloat(document.getElementById('water').value);
                const newSleep = parseFloat(document.getElementById('sleep').value);

                if (isNaN(newSteps) || isNaN(newWater) || isNaN(newSleep) || newSteps < 0 || newWater < 0 || newSleep < 0) {
                    alert('Please enter valid, non-negative numbers for all goals.');
                    return;
                }
                
                // Cap the values at the targets (can be adjusted if exceeding target is allowed)
                const updatedGoals = {
                    steps: Math.min(newSteps, GOAL_TARGETS.steps),
                    water: Math.min(newWater, GOAL_TARGETS.water),
                    sleep: Math.min(newSleep, GOAL_TARGETS.sleep)
                };

                saveGoals(updatedGoals);
                renderProgress(updatedGoals);
               
            });
        }
    }
    
    // Initialize the Progress Tracker
    initProgressTracker();
    
    
   // --- 1. BMI Calculator Logic ---
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

   


    // --- 3. Health Tip Rotation Logic (UPDATED BLOCK) ---
    const healthTips = [
        "💧 Stay **hydrated**! Drinking enough water can boost your energy levels and improve your mood.",
        "🍎 Eat the **rainbow**. A diet rich in colorful fruits and vegetables provides essential vitamins and antioxidants.",
        "🚶 Take a **break**. Stand up and move around for 5 minutes every hour to counter the effects of prolonged sitting.",
        "😴 **Prioritize sleep**. Aim for 7-9 hours of quality sleep each night for better focus and physical health.",
        "🧘 Practice **mindfulness**. Even a few minutes of deep breathing can significantly reduce stress.",
        "☀️ Get some **sun**. A short walk outside can help you get Vitamin D, which is vital for bone health.",
        "🏃 Incorporate **strength training** twice a week to maintain muscle mass and bone density.",
        "🚫 Limit processed foods and focus on **whole foods** to improve gut health and energy levels.",
        "🧠 Challenge your brain with new hobbies or puzzles to help maintain **cognitive function**.",
        "😃 **Laugh more**. It's a great way to relieve stress and boost your immune system.",
        "👂 Listen to your body. Pay attention to signs of fatigue or discomfort and **don't push too hard**.",
        "📈 Track your metrics regularly. Knowing your numbers (BP, HR, etc.) is the first step to **better health management**."
    ];

    const TIPS_PER_VIEW = 3;
    let currentTipIndex = 0; // The index of the first tip to display
    const tipDisplayElement = document.getElementById('health-tip-list');
    // 10 minutes = 10 * 60 * 1000 milliseconds = 600000ms
    const TEN_MINUTES_MS = 10 * 60 * 1000; 
    const refreshButton = document.getElementById('refresh-tip-btn');

    function updateHealthTip() {
        if (!tipDisplayElement) return;

        // Clear previous tips
        tipDisplayElement.innerHTML = '';
        
        // Loop to display 3 tips
        for (let i = 0; i < TIPS_PER_VIEW; i++) {
            // Calculate the actual index, ensuring it wraps around the array length
            const index = (currentTipIndex + i) % healthTips.length;
            
            const tipText = healthTips[index];
            const listItem = document.createElement('li');
            listItem.innerHTML = tipText; // Use innerHTML to allow for bold markdown
            tipDisplayElement.appendChild(listItem);
        }

        // Advance the starting index for the next rotation
        currentTipIndex = (currentTipIndex + TIPS_PER_VIEW) % healthTips.length;
    }

    // Event listener for manual refresh button
    if (refreshButton) {
        refreshButton.addEventListener('click', updateHealthTip);
    }

    // Initial call to set the first batch of tips immediately
    updateHealthTip();

    // Set the interval to change the tip every 10 minutes
    setInterval(updateHealthTip, TEN_MINUTES_MS);


    // --- 4. SOS Button Alert ---
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

    // --- 5. Book Now/Doctor Connect Logic ---
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
