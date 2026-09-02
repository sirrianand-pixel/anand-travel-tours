// ==========================================================
// ANAND TRAVEL TOURS
// RESET PASSWORD JAVASCRIPT
// ==========================================================

const API_BASE = "/api";

const form = document.getElementById("resetPasswordForm");
const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");
const submitBtn = document.getElementById("submitBtn");
const statusMessage = document.getElementById("statusMessage");

// Extract token from URL query string
const urlParams = new URLSearchParams(window.location.search);
const resetToken = urlParams.get("token");

function showMessage(text, isError = false) {
    if (!statusMessage) return;
    statusMessage.textContent = text;
    statusMessage.style.display = "block";
    statusMessage.style.background = isError ? "rgba(220, 53, 69, 0.25)" : "rgba(40, 167, 69, 0.25)";
    statusMessage.style.border = isError ? "1px solid rgba(220, 53, 69, 0.5)" : "1px solid rgba(40, 167, 69, 0.5)";
    statusMessage.style.color = isError ? "#ff8080" : "#a3e635";
}

// Verify token presence on load
if (!resetToken) {
    showMessage("Invalid or missing password reset link. Please request a new one.", true);
    if (submitBtn) submitBtn.disabled = true;
}

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!resetToken) {
            showMessage("Invalid or missing reset token.", true);
            return;
        }

        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (!newPassword || newPassword.length < 6) {
            showMessage("Password must be at least 6 characters long.", true);
            return;
        }

        if (newPassword !== confirmPassword) {
            showMessage("Passwords do not match.", true);
            return;
        }

        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Resetting password...";
        statusMessage.style.display = "none";

        try {
            const response = await fetch(`${API_BASE}/auth/reset-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    token: resetToken,
                    new_password: newPassword
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showMessage(data.message || "Password successfully reset! Redirecting to login...");
                form.reset();
                setTimeout(() => {
                    window.location.replace("login.html");
                }, 2000);
            } else {
                showMessage(data.message || "Failed to reset password. The link may have expired.", true);
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        } catch (err) {
            console.error("Reset password error:", err);
            showMessage("Network error. Unable to reach the server.", true);
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}
