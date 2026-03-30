/**
 * SafeCity | Stable Firebase Logic
 */

// --- 1. SUBMISSION LOGIC ---
const reportForm = document.getElementById("reportForm");
if (reportForm) {
    reportForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        // Wait for Firebase to be ready
        if (!window.db) {
            const btn = this.querySelector(".main-btn");
            btn.innerHTML = "Connecting...";
            setTimeout(() => this.dispatchEvent(new Event('submit')), 500);
            return;
        }

        const btn = this.querySelector(".main-btn");
        btn.innerHTML = "Transmitting...";
        btn.disabled = true;

        const caseId = "SC-" + Math.floor(100000 + Math.random() * 900000);

        try {
            await window.addDoc(window.collection(window.db, "reports"), {
                caseId: caseId,
                title: document.getElementById("title").value,
                description: document.getElementById("description").value,
                location: document.getElementById("location").value,
                status: "In Review",
                timestamp: new Date().toISOString()
            });

            document.querySelector(".card").innerHTML = `
                <div style="text-align: center; animation: fadeIn 0.8s ease;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">📡</div>
                    <h2>Securely Logged</h2>
                    <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.2); margin: 20px 0;">
                        <span style="font-size: 0.7rem; color: #6366f1; font-weight: 800;">TOKEN</span>
                        <div style="font-size: 1.8rem; font-weight: 800; font-family: monospace;">${caseId}</div>
                    </div>
                    <button onclick="location.reload()" class="main-btn">New Report</button>
                </div>`;
        } catch (err) {
            alert("Upload Error: " + err.message);
            btn.disabled = false;
        }
    });
}

// --- 2. TRACKING LOGIC ---
window.trackReport = async function() {
    const resultDiv = document.getElementById("result");
    const caseIdInput = document.getElementById("caseId").value.trim().toUpperCase();

    if (!window.db || !window.firebaseTools) {
        resultDiv.innerHTML = "Connecting to Cloud...";
        setTimeout(trackReport, 500);
        return;
    }

    resultDiv.innerHTML = "Querying...";

    try {
        const { query, where, getDocs, collection } = window.firebaseTools;
        const q = query(collection(window.db, "reports"), where("caseId", "==", caseIdInput));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                resultDiv.innerHTML = `
                    <div style="margin-top: 20px; background: rgba(99, 102, 241, 0.15); padding: 20px; border-radius: 15px; border-left: 4px solid #6366f1;">
                        <h3 style="margin: 0;">Status: ${data.status}</h3>
                        <p style="margin: 5px 0; color: rgba(255,255,255,0.6);">${data.title}</p>
                    </div>`;
            });
        } else {
            resultDiv.innerHTML = "<p style='color: #ef4444; margin-top: 20px;'>No report found.</p>";
        }
    } catch (err) {
        resultDiv.innerHTML = "Error: " + err.message;
    }
};