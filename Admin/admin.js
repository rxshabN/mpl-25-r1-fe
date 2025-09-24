const modal = document.getElementById("editModal");
const deleteModal = document.getElementById("deleteModal");
const teamNameInput = document.getElementById("teamName");
const teamPointsInput = document.getElementById("teamPoints");
const teamIdInput = document.getElementById("teamId");
const leaderboardRows = document.getElementById("leaderboardRows");

// URL TO GET TEAMS
const API_BASE_URL = "http://10.28.63.196:8000";// Using a placeholder URL

// Global state for teams, populated by the fetch call.
let teams = [];

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
    leaderboardRows.innerHTML = `<p style="text-align: center; padding: 2rem; color: #ff4d4d;">Could not load from server. Using fallback data.</p>`;
    // Fallback to dummy data if the API fails, so the page is still usable for demonstration.
    // teams = [
    //   { id: 1, teamName: "Viper Vanguards", points: 98 },
    //   { id: 4, teamName: "Gridiron Ghosts", points: 92 },
    //   { id: 2, nateamNamee: "Apex Accelerators", points: 85 },
    //   { id: 3, teamName: "Nitro Knights", points: 77 },
    //   { id: 5, teamName: "Circuit Sentinels", points: 68 },
    // ];
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

/**
 * Sends a PUT request to the API to update a team's data,
 * then reloads all teams from the server.
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
    const response = await fetch(`${API_BASE_URL}/team/update/${id}`, {
      method: 'PATCH', // Or 'PATCH'
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API error! Status: ${response.status}`);
    }
    
    // On success, close the modal and reload all data from the server.
    closeModal();
    await loadTeams(); 
    
  } catch (error) {
    console.error("Failed to edit team:", error);
    alert("Error: Could not update the team on the server.");
  }
}

/**
 * Sends a DELETE request to the API to remove a team,
 * then reloads all teams from the server.
 */
async function deleteTeam() {
  const id = parseInt(teamIdInput.value);

  try {
    const response = await fetch(`${API_BASE_URL}/remove/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`API error! Status: ${response.status}`);
    }

    // On success, close the modal and reload all data from the server.
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
window.onclick = function(e) {
  if (e.target === modal) closeModal();
  if (e.target === deleteModal) closeDeleteModal();
};

// Kicks off the data fetch from the server when the page is loaded.
document.addEventListener("DOMContentLoaded", loadTeams);