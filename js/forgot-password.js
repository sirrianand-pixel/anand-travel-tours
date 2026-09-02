// ==========================================================
// ANAND TRAVEL TOURS
// FORGOT PASSWORD JAVASCRIPT
// ==========================================================

const API_BASE = "/api";

const form = document.getElementById("forgotPasswordForm");
const emailInput = document.getElementById("email");
const submitBtn = document.getElementById("submitBtn");
const statusMessage = document.getElementById("statusMessage");

function showMessage(text, isError = false) {
    if (!statusMessage) return;
    statusMessage.textContent = text;
    statusMessage.style.display = "block";
    statusMessage.style.background = isError ? "rgba(220, 53, 69, 0.25)" : "rgba(40, 167, 69, 0.25)";
    statusMessage.style.border = isError ? "1px solid rgba(220, 53, 69, 0.5)" : "1px solid rgba(40, 167, 69, 0.5)";
    statusMessage.style.color = isError ? "#ff8080" : "#a3e635";
}

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        if (!email) {
            showMessage("Please enter your email address.", true);
            return;
        }

        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Sending link...";
        statusMessage.style.display = "none";

        try {
            const response = await fetch(`${API_BASE}/auth/forgot-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showMessage(data.message || "Password reset instructions have been sent to your email.");
                form.reset();
            } else {
                showMessage(data.message || "Failed to process request. Please try again.", true);
            }
        } catch (err) {
            console.error("Forgot password error:", err);
            showMessage("Network error. Unable to reach the server.", true);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}
