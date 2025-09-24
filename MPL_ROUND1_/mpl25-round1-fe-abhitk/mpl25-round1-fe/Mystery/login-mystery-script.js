document.addEventListener("DOMContentLoaded", () => {
  const teamForm = document.getElementById("teamForm");

  teamForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Get form values and structure data
    const formData = {
      teamName: document.getElementById("teamName").value,
      difficulty: document.getElementById("difficultyLevel").value,
      pointsDeducted: document.getElementById("pointsDeducted").value
    };

    // IMPORTANT: Replace this placeholder with your actual REST API URL
    const apiUrl = "http://10.28.63.196:8000";

    console.log("Sending data to API...", formData);

    try {
      const response = await fetch(`${apiUrl}/mysteryQuestion/get`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      console.log("Success:", result);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${result.message}`);
      }

      // Save both backend response + formData in localStorage
      localStorage.setItem("mysteryData", JSON.stringify({
        ...result,
        //New!!
        teamName: formData.teamName,
        pointsDeducted: formData.pointsDeducted
      }));

      //const result = await response.json();
      //console.log("Success:", result);
      window.location.href = "mystery-que.html";
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  });
});
