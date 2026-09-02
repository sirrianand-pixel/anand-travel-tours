const form = document.getElementById("registerForm");

console.log("register.js loaded");

form.addEventListener("submit", async function (e) {

    e.preventDefault();

    const full_name =
        document.getElementById("full_name").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const phone =
        document.getElementById("phone").value.trim();

    const password =
        document.getElementById("password").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;


    // =====================================================
    // PASSWORD CHECK
    // =====================================================

    if (password !== confirmPassword) {

        alert("Passwords do not match.");

        return;
    }


    try {

        // =================================================
        // REGISTER
        // =================================================

        const response = await fetch(
            "/api/auth/register",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    full_name,
                    email,
                    phone,
                    password
                })
            }
        );


        const data = await response.json();

        console.log("Register response:", data);


        // =================================================
        // ERROR
        // =================================================

        if (!response.ok) {

            alert(
                data.message ||
                "Registration failed."
            );

            return;
        }


        // =================================================
        // SUCCESS
        // =================================================

        console.log(
            "Registration successful. Redirecting to login..."
        );

        alert("Registration successful! Please login.");
        window.location.replace("login.html");

    }


    catch (error) {

        console.error(
            "Registration error:",
            error
        );

        alert(
            "Unable to connect to the server."
        );

    }

});