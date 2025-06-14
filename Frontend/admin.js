const API = "http://localhost:5000/api/admin";
const token = localStorage.getItem("token");

async function loadFAQs() {
  const res = await fetch(`${API}/all`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  const tbody = document.querySelector("#faq-table tbody");
  tbody.innerHTML = "";

  data.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.question}</td>
      <td>${item.answer}</td>
      <td>${item.feedback}</td>
      <td>
        ${item.flagged ? "🚩" : `<button onclick="flagFaq('${item._id}')">Flag</button>`}
      </td>
    `;
    tbody.appendChild(row);
  });
}

async function flagFaq(id) {
  alert('tets');
await fetch(`${API}/flag/${id}`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ flagged: true }) // or false, depending on your logic
});
  loadFAQs();
}

async function downloadCSV() {
  try {
    const response = await fetch(`${API}/export`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
        // Add auth headers here if needed
      },
      body: JSON.stringify({ /* optional: filters or payload */ })
    });

    if (!response.ok) {
      throw new Error("Failed to export CSV");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "export.csv"; // Or dynamic filename
    document.body.appendChild(a);
    a.click();
    a.remove();

    // Cleanup
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("CSV Download Error:", error);
  }
}





function getToken() {
  return localStorage.getItem("adminToken");
}

// Utility to set token
function setToken(token) {
  localStorage.setItem("adminToken", token);
}

// Admin login
async function adminLogin(username, password) {
  try {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      setToken(data.token);
      alert("Login successful!");
      loadAdminDashboard();
    } else {
      alert(data.message || "Login failed");
    }
  } catch (err) {
    console.error("Login error:", err);
  }
}

// Load dashboard data (questions, feedback, etc.)
async function loadAdminDashboard() {
  try {
    const token = getToken();
    const res = await fetch("/api/admin/dashboard", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    if (res.ok) {
      renderDashboard(data); // You’ll need to define this
    } else {
      alert("Failed to load dashboard");
    }
  } catch (err) {
    console.error("Dashboard load error:", err);
  }
}

// Flag an answer as bad
async function flagAnswer(faqId) {
  try {
    debugger;
    const token = getToken();
    const res = await fetch(`/api/admin/flag/${faqId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      alert("Answer flagged");
      loadAdminDashboard(); // Reload dashboard data
    } else {
      alert("Failed to flag answer");
    }
  } catch (err) {
    console.error("Flag error:", err);
  }
}

// Logout admin
function logout() {
  localStorage.removeItem("token");
  alert("Logged out");
  window.location.href = "admin-login.html"; // redirect to login
}


window.onload = loadFAQs;
