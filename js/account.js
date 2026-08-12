// ==========================================================
// ANAND TRAVEL TOURS
// ACCOUNT PAGE
// ==========================================================

const API_BASE =
    "http://localhost:5000/api";


// ==========================================================
// ELEMENTS
// ==========================================================

const loadingMessage =
    document.getElementById(
        "loadingMessage"
    );


const errorMessage =
    document.getElementById(
        "errorMessage"
    );


const accountContent =
    document.getElementById(
        "accountContent"
    );


const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


// ==========================================================
// FORMAT DATE
// ==========================================================

function formatDate(
    value
) {

    if (!value) {
        return "-";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );

}


// ==========================================================
// LOAD ACCOUNT
// ==========================================================

async function loadAccount() {

    const token =
        localStorage.getItem(
            "token"
        );


    // ------------------------------------------------------
    // LOGIN REQUIRED
    // ------------------------------------------------------

    if (!token) {

        showError(
            "Please login to view your account."
        );


        setTimeout(
            () => {

                window.location.href =
                    "login.html?redirect=account.html";

            },
            1000
        );


        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE}/users/me`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        console.log(
            "👤 Account API:",
            data
        );


        // --------------------------------------------------
        // AUTH ERROR
        // --------------------------------------------------

        if (
            response.status === 401 ||
            response.status === 403
        ) {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );


            showError(
                "Your login session has expired."
            );


            setTimeout(
                () => {

                    window.location.href =
                        "login.html?redirect=account.html";

                },
                1200
            );


            return;

        }


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load account."
            );

        }


        const user =
            data.user;


        const bookings =
            data.bookings || {};


        if (!user) {

            throw new Error(
                "Account information was not returned."
            );

        }


        // --------------------------------------------------
        // PROFILE
        // --------------------------------------------------

        document.getElementById(
            "fullName"
        ).textContent =
            user.full_name || "-";


        document.getElementById(
            "email"
        ).textContent =
            user.email || "-";


        document.getElementById(
            "phone"
        ).textContent =
            user.phone || "-";


        document.getElementById(
            "roleBadge"
        ).textContent =
            user.role || "user";


        // --------------------------------------------------
        // PERSONAL DETAILS
        // --------------------------------------------------

        document.getElementById(
            "detailFullName"
        ).textContent =
            user.full_name || "-";


        document.getElementById(
            "detailEmail"
        ).textContent =
            user.email || "-";


        document.getElementById(
            "detailPhone"
        ).textContent =
            user.phone || "-";


        document.getElementById(
            "createdAt"
        ).textContent =
            formatDate(
                user.created_at
            );


        // --------------------------------------------------
        // BOOKING STATISTICS
        // --------------------------------------------------

        document.getElementById(
            "totalBookings"
        ).textContent =
            bookings.total || 0;


        document.getElementById(
            "confirmedBookings"
        ).textContent =
            bookings.confirmed || 0;


        document.getElementById(
            "pendingBookings"
        ).textContent =
            bookings.pending || 0;


        document.getElementById(
            "cancelledBookings"
        ).textContent =
            bookings.cancelled || 0;


        // --------------------------------------------------
        // SHOW PAGE
        // --------------------------------------------------

        if (loadingMessage) {

            loadingMessage.style.display =
                "none";

        }


        if (errorMessage) {

            errorMessage.style.display =
                "none";

        }


        if (accountContent) {

            accountContent.style.display =
                "block";

        }


    } catch (error) {

        console.error(
            "❌ Account loading error:",
            error
        );


        showError(
            error.message
        );

    }

}


// ==========================================================
// ERROR
// ==========================================================

function showError(
    message
) {

    if (loadingMessage) {

        loadingMessage.style.display =
            "none";

    }


    if (accountContent) {

        accountContent.style.display =
            "none";

    }


    if (errorMessage) {

        errorMessage.textContent =
            message;

        errorMessage.style.display =
            "block";

    }

}


// ==========================================================
// LOGOUT
// ==========================================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );


            window.location.href =
                "../index.html";

        }
    );

}


// ==========================================================
// START
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadAccount();

    }
);