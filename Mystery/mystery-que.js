document.addEventListener("DOMContentLoaded", () => {
  let stompClient = null;

  const connectWebSocket = (teamName) => {
    const socket = new SockJS("https://mpl-25-r1-be.onrender.com/ws");
    stompClient = Stomp.over(socket);
    stompClient.connect({}, (frame) => {
      console.log("Connected: " + frame);
      stompClient.subscribe(
        `/topic/time/${teamName.replace(" ", "")}`,
        (message) => {
          const response = JSON.parse(message.body);
          console.log("Received message:", response);
          // Here you would update your UI elements with the new data
          // For example, to update the points and time:
          // document.getElementById('points').textContent = response.updatedPoints;
          // document.getElementById('time').textContent = response.updatedTime;
        }
      );
    });
  };

  const mysteryData = JSON.parse(localStorage.getItem("mysteryData"));

  const apiUrl = "https://mpl-25-r1-be.onrender.com";

  if (mysteryData) {
    const difficultyEl = document.getElementById("difficulty");

    difficultyEl.className = "";

    difficultyEl.textContent = mysteryData.difficulty;

    switch (mysteryData.difficulty) {
      case "Easy":
        difficultyEl.classList.add("type1");
        break;
      case "Medium":
        difficultyEl.classList.add("type2");
        break;
      case "Hard":
        difficultyEl.classList.add("type3");
        break;
      default:
        difficultyEl.classList.add("type1"); // fallback
    }

    // Update points
    //document.getElementById("points").textContent = mysteryData.pointsDeducted;

    // Update question text
    document.getElementById("questionText").textContent = mysteryData.question;

    // Update code phrase
    document.getElementById("codeText").textContent = mysteryData.mysteryCode;

    // Call the WebSocket connection function with the team name
    connectWebSocket(mysteryData.teamName);
  } else {
    console.error("No mystery data found in localStorage!");
  }

  // --- Element Selection ---
  const mainContainer = document.querySelector(".main-container");
  const queForm = document.getElementById("queForm");

  const modalOverlay = document.getElementById("modalOverlay");
  const exitOverlay = document.getElementById("exit-overlay");
  const codeModal = document.getElementById("codeModal");
  const successModal = document.getElementById("successModal");

  const codeSubmitForm = document.getElementById("codeSubmitForm");
  const codeInput = document.getElementById("codeInput");
  const feedbackMessage = document.getElementById("feedbackMessage"); // For showing error messages

  // Select all close buttons
  const closeButtons = document.querySelectorAll(".close-button");

  const openOverlay = (overlay) => {
    mainContainer.classList.add("blurred");
    overlay.classList.remove("hidden");
  };

  // --- Functions ---
  const openModal = (modal) => {
    mainContainer.classList.add("blurred");
    modalOverlay.classList.add("active");
    modal.classList.add("active");
  };

  const closeModal = () => {
    mainContainer.classList.remove("blurred");
    modalOverlay.classList.remove("active");
    // Close any active modal
    const activeModal = document.querySelector(".modal.active");
    if (activeModal) {
      activeModal.classList.remove("active");
    }
    // Clear feedback message when closing
    if (feedbackMessage) {
      feedbackMessage.textContent = "";
      feedbackMessage.className = "feedback-message";
    }
  };

  // --- API Simulation/Call ---
  const verifyCodeWithAPI = async (code) => {
    // This part simulates a network request.
    return new Promise((resolve) => {
      setTimeout(() => {
        // We now check for a `success` property in the response
        if (code.toLowerCase() === "secret123") {
          console.log("API Simulation: Code is correct.");
          resolve({ success: true });
        } else {
          console.log("API Simulation: Code is incorrect.");
          resolve({ success: false });
        }
      }, 1000); // Simulate 1-second network delay
    });
  };

  // --- Event Listeners ---

  // 1. Open code modal when "DONE" is clicked
  queForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    openModal(codeModal);

    try {
      const formData = {
        teamName: mysteryData.teamName,
        mysteryCompletionStatus: "DONE",
      };

      const response = await fetch(`${apiUrl}/mysteryQuestion/result`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error Sending details to backend:", error);
    }
  });

  // 2. Close modals when close buttons are clicked
  closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  // 3. Close modals when the overlay is clicked
  modalOverlay.addEventListener("click", closeModal);

  // 4. Handle code submission with updated logic
  codeSubmitForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const enteredCode = codeInput.value.trim();
    if (!enteredCode) return;

    const submitButton = codeSubmitForm.querySelector(".glow-button");
    submitButton.textContent = "VERIFYING...";
    submitButton.disabled = true;

    // Clear previous feedback
    if (feedbackMessage) {
      feedbackMessage.textContent = "";
      feedbackMessage.className = "feedback-message";
    }

    const result = await verifyCodeWithAPI(enteredCode);

    // Reset button state
    submitButton.textContent = "VERIFY";
    submitButton.disabled = false;

    // The API now returns a `success` boolean
    if (result.success === true) {
      closeModal();
      setTimeout(() => {
        openModal(successModal);
        setTimeout(() => {
          window.location.href = "login-mystery.html";
        }, 1000);
      }, 100);
    } else {
      // On failure, show feedback message, clear input, and shake modal
      if (feedbackMessage) {
        feedbackMessage.textContent = "Incorrect code. Please try again.";
        feedbackMessage.classList.add("error");
      }
      codeInput.value = "";

      codeModal.classList.add("shake");
      setTimeout(() => {
        codeModal.classList.remove("shake");
      }, 500);
    }
  });

  // document.getElementById("glow-button-quit").addEventListener("click", () => {
  //   setTimeout(() => {
  //     openOverlay(exitOverlay);
  //     setTimeout(()=>{
  //       window.location.href = "login-mystery.html";
  //     }, 1000);
  //   }, 100);
  // });
});
