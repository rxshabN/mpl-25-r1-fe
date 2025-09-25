document.addEventListener("DOMContentLoaded", () => {
  // --- Inject Data from Login ---
  const hardData = JSON.parse(localStorage.getItem("hardData"));

  if (hardData) {
    // Update question text
    document.getElementById("questionText").textContent = hardData.question;
  } else {
    console.error("No data found in localStorage!");
  }

  // --- Element Selection ---
  const mainContainer = document.querySelector(".main-container");
  const queForm = document.getElementById("queForm");
  const timeElement = document.getElementById("time");

  // Overlays
  const timeoutOverlay = document.getElementById("timeout-overlay");
  const codeOverlay = document.getElementById("code-overlay");
  const successOverlay = document.getElementById("success-overlay");

  // Code input elements
  const codeSubmitForm = document.getElementById("code-submit-form"); // Target the form now
  const codeInput = document.getElementById("code-input");
  const codeSubmitButton = document.getElementById("code-submit-button");
  const feedbackMessage = document.getElementById("feedback-message");
  const codeCard = document.querySelector("#code-overlay .code-card"); // Target the card for animation

  // Close buttons
  const closeButtons = document.querySelectorAll(".close-button");

  // --- Overlay Functions ---
  const openOverlay = (overlay) => {
    mainContainer.classList.add("blurred");
    overlay.classList.remove("hidden");
  };

  const closeAllOverlays = () => {
    mainContainer.classList.remove("blurred");
    document.querySelectorAll(".overlay").forEach((overlay) => {
      overlay.classList.add("hidden");
    });
    // Also clear any previous error messages when closing
    feedbackMessage.textContent = "";
    feedbackMessage.className = "feedback-message";
  };

  // --- API Simulation/Call ---
  const verifyCodeWithAPI = async (code) => {
    //const apiUrl = "https://api.example.com/verify-code"; // Replace with your actual API endpoint

    // --- Start of API Simulation (for demonstration) ---
    //console.log(`Simulating API call with code: ${code}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        if (code.toLowerCase() === "secret123") {
          console.log("API Simulation: Code is correct.");
          resolve({ success: true });
        } else {
          console.log("API Simulation: Code is incorrect.");
          resolve({ success: false });
        }
      }, 1000);
    });
    // --- End of API Simulation ---
  };

  // --- Event Listeners ---

  // 1. "DONE" Button Logic
  queForm.addEventListener("submit", (event) => {
    event.preventDefault();
    openOverlay(codeOverlay);
  });

  // 2. Close Button Logic
  closeButtons.forEach((button) => {
    button.addEventListener("click", closeAllOverlays);
  });

  // 3. "Submit Code" Form Logic
  codeSubmitForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission
    const codeValue = codeInput.value.trim();

    // The 'required' attribute on the input handles the empty case automatically.
    // This JS check is a fallback.
    if (!codeValue) return;

    // Clear previous feedback and set loading state
    feedbackMessage.textContent = "";
    feedbackMessage.className = "feedback-message";
    codeSubmitButton.textContent = "VERIFYING...";
    codeSubmitButton.disabled = true;

    const result = await verifyCodeWithAPI(codeValue);

    // Reset button
    codeSubmitButton.textContent = "VERIFY";
    codeSubmitButton.disabled = false;

    if (result.success === true) {
      closeAllOverlays();
      //setTimeout(() => {
      //  openOverlay(successOverlay);
      //}, 500); // Wait for close animation
      window.location.href = "victory.html";
    } else {
      feedbackMessage.textContent = "Incorrect code. Please try again.";
      feedbackMessage.classList.add("error");
      codeInput.value = ""; // Clear input on error

      // Add shake animation on error
      codeCard.classList.add("shake");
      setTimeout(() => {
        codeCard.classList.remove("shake");
      }, 500); // Duration should match the CSS animation
    }
  });

  let totalSeconds = 30 * 60; // 30 minutes in seconds initially
  let timerInterval = null;

  // Function to update the timer UI
  const updateTimer = () => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    timeElement.textContent =
      `${hours.toString().padStart(2, "0")}:` +
      `${minutes.toString().padStart(2, "0")}:` +
      `${seconds.toString().padStart(2, "0")}`;

    if (totalSeconds <= 0) {
      clearInterval(timerInterval);
      openOverlay(timeoutOverlay);
    }

    totalSeconds--;
  };

  // Function to start/restart countdown
  const startCountdown = (seconds) => {
    clearInterval(timerInterval);
    totalSeconds = seconds;
    updateTimer(); // show immediately
    timerInterval = setInterval(updateTimer, 1000);
  };

  // Function to parse ISO 8601 duration like "PT15H57M41.0621421S"
  const parseISODuration = (duration) => {
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/;
    const matches = duration.match(regex);
    if (!matches) return 0;

    const hours = parseInt(matches[1] || "0");
    const minutes = parseInt(matches[2] || "0");
    const seconds = Math.floor(parseFloat(matches[3] || "0"));

    return hours * 3600 + minutes * 60 + seconds;
  };

  startCountdown(totalSeconds);

  if (hardData && hardData.teamName) {
    const socket = new SockJS("https://mpl-25-r1-be.onrender.com/ws");
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
      console.log("Connected to WebSocket");

      const topic = `/topic/time/${hardData.teamName.replace(" ", "")}`;
      stompClient.subscribe(topic, (message) => {
        const data = JSON.parse(message.body);
        if (data.updatedTime) {
          const seconds = parseISODuration(data.updatedTime);
          startCountdown(seconds); // reset timer
        }
      });
    });
  }

  // --- Timeout Logic (unchanged) ---
  const currentTime = timeElement.textContent.trim();
  if (currentTime === "0s") {
    openOverlay(timeoutOverlay);
  }
});
