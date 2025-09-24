document.addEventListener("DOMContentLoaded", () => {
  const teamForm = document.getElementById("teamForm");

  teamForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Get form values and structure data
    const formData = {
      teamName: document.getElementById("teamName").value,
      questionId: document.getElementById("teamCode").value,
    };

    // IMPORTANT: Replace this placeholder with your actual REST API URL
    const apiUrl = "http://10.28.63.196:8000";

    console.log("Sending data to API...", formData);

    try {
      const response = await fetch(`${apiUrl}/question/get`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Success:", result);

      // Save both backend response + formData in localStorage
      localStorage.setItem("hardData", JSON.stringify({
        ...result
      }));

      //const result = await response.json();
      console.log("Success:", result);
      window.location.href = "hard-que.html";
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  });
});
