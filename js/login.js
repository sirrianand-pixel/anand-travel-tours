// ==========================================================
// ANAND TRAVEL TOURS
// LOGIN JAVASCRIPT
// ==========================================================

const API_BASE =
    "http://localhost:5000/api";


// ==========================================================
// LOGIN FORM
// ==========================================================

const loginForm =
    document.getElementById("loginForm");


// ==========================================================
// LOGIN
// ==========================================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            // ------------------------------------------
            // INPUTS
            // ------------------------------------------

            const emailInput =
                document.getElementById("email");

            const passwordInput =
                document.getElementById("password");


            const email =
                emailInput
                    ? emailInput.value.trim()
                    : "";

            const password =
                passwordInput
                    ? passwordInput.value
                    : "";


            // ------------------------------------------
            // MESSAGE
            // ------------------------------------------

            const message =
                document.getElementById(
                    "loginMessage"
                ) ||
                document.getElementById(
                    "message"
                );


            // ------------------------------------------
            // VALIDATION
            // ------------------------------------------

            if (!email || !password) {

                if (message) {

                    message.textContent =
                        "Please enter email and password.";

                } else {

                    alert(
                        "Please enter email and password."
                    );

                }

                return;
            }


            // ------------------------------------------
            // BUTTON
            // ------------------------------------------

            const submitButton =
                loginForm.querySelector(
                    'button[type="submit"]'
                );


            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "Logging in...";

            }


            try {

                // --------------------------------------
                // LOGIN REQUEST
                // --------------------------------------

                const response =
                    await fetch(
                        `${API_BASE}/auth/login`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    email,
                                    password
                                })
                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "🔐 Login response:",
                    data
                );


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Login failed."
                    );

                }


                // --------------------------------------
                // SAVE TOKEN
                // --------------------------------------

                if (!data.token) {

                    throw new Error(
                        "Login succeeded but no token was returned."
                    );

                }


                localStorage.setItem(
                    "token",
                    data.token
                );


                // --------------------------------------
                // GET USER ROLE
                // --------------------------------------

                let role =
                    data.user?.role ||
                    null;


                let user =
                    data.user ||
                    null;


                // --------------------------------------
                // DECODE JWT IF USER OBJECT WAS NOT
                // RETURNED BY THE BACKEND
                // --------------------------------------

                if (!role) {

                    try {

                        const parts =
                            data.token.split(".");


                        if (
                            parts.length === 3
                        ) {

                            const payload =
                                JSON.parse(
                                    atob(
                                        parts[1]
                                    )
                                );


                            role =
                                payload.role;

                            user =
                                payload;

                        }

                    } catch (error) {

                        console.error(
                            "JWT decode error:",
                            error
                        );

                    }

                }


                console.log(
                    "👤 Logged in user:",
                    user
                );

                console.log(
                    "🔑 Role:",
                    role
                );


                // --------------------------------------
                // SAVE USER
                // --------------------------------------

                if (user) {

                    localStorage.setItem(
                        "user",
                        JSON.stringify(user)
                    );

                }


                // --------------------------------------
                // SUCCESS MESSAGE
                // --------------------------------------

                if (message) {

                    message.textContent =
                        "Login successful!";

                }


                // --------------------------------------
                // GET REQUESTED REDIRECT
                // --------------------------------------

                const params =
                    new URLSearchParams(
                        window.location.search
                    );


                const redirect =
                    params.get("redirect");


                // ==================================================
                // ADMIN
                // ==================================================

                if (
                    role === "admin"
                ) {

                    console.log(
                        "➡️ Redirecting admin to dashboard"
                    );


                    window.location.href =
                        "admin.html";


                    return;

                }


                // ==================================================
                // CUSTOMER
                // ==================================================

                if (
                    redirect &&
                    !redirect.startsWith("http://") &&
                    !redirect.startsWith("https://") &&
                    !redirect.startsWith("//")
                ) {

                    console.log(
                        "➡️ Redirecting customer to:",
                        redirect
                    );


                    window.location.href =
                        redirect;


                    return;

                }


                // --------------------------------------
                // DEFAULT CUSTOMER REDIRECT
                // --------------------------------------

                console.log(
                    "➡️ Redirecting customer to homepage"
                );


                window.location.href =
                    "../index.html";


            } catch (error) {

                console.error(
                    "❌ Login error:",
                    error
                );


                if (message) {

                    message.textContent =
                        error.message;

                } else {

                    alert(
                        error.message
                    );

                }


            } finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Login";

                }

            }

        }
    );

}