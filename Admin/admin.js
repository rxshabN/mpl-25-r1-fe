const modal = document.getElementById("editModal");
const deleteModal = document.getElementById("deleteModal");
const teamNameInput = document.getElementById("teamName");
const teamPointsInput = document.getElementById("teamPoints");
const teamIdInput = document.getElementById("teamId");
const leaderboardRows = document.getElementById("leaderboardRows");

const API_BASE_URL = "https://mpl-25-r1-be.onrender.com";

let teams = [];
let stompClient = null;

// --- WebSocket Connection ---
function connectWebSocket() {
  const socket = new SockJS(`${API_BASE_URL}/ws`);
  stompClient = Stomp.over(socket);
  stompClient.connect(
    {},
    (frame) => {
      console.log("✅ Admin WebSocket Connected: " + frame);
    },
    (error) => {
      console.error("❌ Admin WebSocket Connection Error:", error);
      setTimeout(connectWebSocket, 5000); // Attempt to reconnect
    }
  );
}

// Fetches team data from the backend.
async function loadTeams() {
  leaderboardRows.innerHTML = `<p style="text-align: center; padding: 2rem; font-style: italic; color: #9bbcff;">Loading teams...</p>`;

  try {
    const response = await fetch(`${API_BASE_URL}/team/getAll`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    teams = data; // Update global state with fetched data.
  } catch (error) {
    console.error("Failed to fetch team data:", error);
    leaderboardRows.innerHTML = `<p style="text-align: center; padding: 2rem; color: #ff4d4d;">Could not load from server.</p>`;
  } finally {
    sortTeams(); // Sort and render the data regardless of source.
  }
}

// Renders the leaderboard rows based on the global 'teams' array.
function renderLeaderboard() {
  leaderboardRows.innerHTML = "";
  if (teams.length === 0) {
    leaderboardRows.innerHTML = `<p style="text-align: center; padding: 2rem; font-style: italic; color: #9bbcff;">No teams to display.</p>`;
    return;
  }
  teams.forEach((team, index) => {
    const row = document.createElement("div");
    row.className = "leaderboard-row";
    if (index === 0) row.classList.add("first");
    if (index === 1) row.classList.add("second");
    if (index === 2) row.classList.add("third");

    row.innerHTML = `
      <span class="serial-col">${index + 1}</span>
      <span class="team-col">${team.teamName}</span>
      <span class="points-col">${team.points}</span>
      <span class="actions-col">
        <button class="edit-btn"
          data-id="${team.id}"
          data-name="${team.teamName}"
          data-points="${team.points}"
          onclick="openModal(this)">Edit</button>
      </span>
    `;
    leaderboardRows.appendChild(row);
  });
}

// --- MODIFIED editTeam Function ---
/**
 * Sends a PATCH request to update team data and then PUBLISHES the change
 * via WebSocket for the specific team to receive.
 */
async function editTeam() {
  const id = teamIdInput.value;
  const newName = teamNameInput.value.trim();
  const newPoints = parseInt(teamPointsInput.value) || 0;

  const payload = {
    teamName: newName,
    points: newPoints,
  };

  try {
    // Step 1: Update the data in the database via API call
    const response = await fetch(`${API_BASE_URL}/team/update/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API error! Status: ${response.status}`);
    }

    // Step 2: ✅ Publish the update via WebSocket
    if (stompClient && stompClient.connected) {
      const topic = `/topic/time/${newName.replace(/\s+/g, "")}`;
      const message = JSON.stringify({ updatedPoints: newPoints });

      stompClient.send(topic, {}, message);
      console.log(`🚀 Sent update to ${topic}:`, message);
    } else {
      console.error("Cannot send WebSocket update: Not connected.");
    }

    // Step 3: Close modal and refresh the admin's own leaderboard
    closeModal();
    await loadTeams();
  } catch (error) {
    console.error("Failed to edit team:", error);
    alert("Error: Could not update the team on the server.");
  }
}

// --- Unchanged Functions Below ---

// Opens the modal to edit a team's details.
function openModal(button) {
  const id = button.getAttribute("data-id");
  const name = button.getAttribute("data-name");
  const points = button.getAttribute("data-points");

  teamIdInput.value = id;
  teamNameInput.value = name;
  teamPointsInput.value = points;

  modal.style.display = "flex";
}

// Closes the main edit modal.
function closeModal() {
  modal.style.display = "none";
}

// Opens the delete confirmation modal.
function confirmDelete() {
  modal.style.display = "none";
  deleteModal.style.display = "flex";
}

// Closes the delete confirmation modal.
function closeDeleteModal() {
  deleteModal.style.display = "none";
}

// Deletes a team.
async function deleteTeam() {
  const id = parseInt(teamIdInput.value);
  try {
    const response = await fetch(`${API_BASE_URL}/team/remove/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`API error! Status: ${response.status}`);
    }
    closeDeleteModal();
    await loadTeams();
  } catch (error) {
    console.error("Failed to delete team:", error);
    alert("Error: Could not delete the team on the server.");
  }
}

// Sorts the global 'teams' array by points and re-renders the list.
function sortTeams() {
  teams.sort((a, b) => b.points - a.points);
  renderLeaderboard();
}

// Closes modals if the user clicks on the background overlay.
window.onclick = function (e) {
  if (e.target === modal) closeModal();
  if (e.target === deleteModal) closeDeleteModal();
};

// Kicks off the data fetch and WebSocket connection when the page is loaded.
document.addEventListener("DOMContentLoaded", () => {
  loadTeams();
  connectWebSocket();
});
