document.addEventListener("DOMContentLoaded", () => {
  // --- Inject Data from Login ---
  const mysteryData = JSON.parse(localStorage.getItem("mysteryData"));

  const apiUrl = "http://10.28.63.196:8000";

  if (mysteryData) {
    const difficultyEl = document.getElementById("difficulty");

    // Reset classes
    difficultyEl.className = "";

    // Set text
    difficultyEl.textContent = mysteryData.difficulty;

    // Apply class based on difficulty
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
  queForm.addEventListener("submit", async(e) => {
    e.preventDefault();
    openModal(codeModal);

    try {
      const formData = {
        teamName: mysteryData.teamName,
        mysteryCompletionStatus: "DONE"
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
