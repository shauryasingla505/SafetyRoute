// admin.js - The Brain of your Dashboard
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const auth = getAuth();
const ADMIN_WHITELIST = ["your-email@gmail.com", "partner@gmail.com"];

// 1. SECURITY CHECK: Is the user an admin?
onAuthStateChanged(auth, (user) => {
    if (user && ADMIN_WHITELIST.includes(user.email)) {
        console.log("Admin Verified");
        loadReports();
    } else {
        // Redirect to login if not authorized
        window.location.href = "login.html";
    }
});

// 2. FETCH ALL REPORTS
async function loadReports() {
    const reportsList = document.getElementById("adminReportsList");
    reportsList.innerHTML = "Loading database...";

    const querySnapshot = await getDocs(collection(window.db, "reports"));
    reportsList.innerHTML = ""; // Clear loader

    querySnapshot.forEach((reportDoc) => {
        const data = reportDoc.data();
        const row = document.createElement("div");
        row.className = "admin-row";
        row.innerHTML = `
            <div class="info">
                <strong>${data.caseId}</strong> - ${data.title}
                <p>Status: <span class="status-tag">${data.status}</span></p>
            </div>
            <div class="actions">
                <button onclick="updateStatus('${reportDoc.id}', 'Under Investigation')">Investigate</button>
                <button onclick="updateStatus('${reportDoc.id}', 'Resolved')" class="resolve-btn">Resolve</button>
            </div>
        `;
        reportsList.appendChild(row);
    });
}

// 3. UPDATE STATUS IN REAL-TIME
window.updateStatus = async (docId, newStatus) => {
    const reportRef = doc(window.db, "reports", docId);
    try {
        await updateDoc(reportRef, { status: newStatus });
        alert("Status updated to " + newStatus);
        loadReports(); // Refresh the list
    } catch (err) {
        alert("Error: " + err.message);
    }
};