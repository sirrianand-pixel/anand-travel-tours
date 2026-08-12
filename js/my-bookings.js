// ==========================================================
// ANAND TRAVEL TOURS
// MY BOOKINGS
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


const emptyMessage =
    document.getElementById(
        "emptyMessage"
    );


const bookingsContainer =
    document.getElementById(
        "bookingsContainer"
    );


const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


// ==========================================================
// GET TOKEN
// ==========================================================

function getToken() {

    return localStorage.getItem(
        "token"
    );

}


// ==========================================================
// HTML ESCAPE
// ==========================================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


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
            month: "short",
            year: "numeric"
        }
    );

}


// ==========================================================
// FORMAT CURRENCY
// ==========================================================

function formatCurrency(
    value
) {

    return (
        "₹" +
        Number(
            value || 0
        ).toLocaleString(
            "en-IN"
        )
    );

}


// ==========================================================
// STATUS CLASS
// ==========================================================

function getStatusClass(
    status
) {

    const normalized =
        String(
            status || ""
        ).toLowerCase();


    if (
        normalized === "confirmed"
    ) {

        return "status-confirmed";

    }


    if (
        normalized === "cancelled"
    ) {

        return "status-cancelled";

    }


    return "status-pending";

}


// ==========================================================
// SHOW ERROR
// ==========================================================

function showError(
    message
) {

    if (loadingMessage) {

        loadingMessage.style.display =
            "none";

    }


    if (emptyMessage) {

        emptyMessage.style.display =
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
// LOAD MY BOOKINGS
// ==========================================================

async function loadMyBookings() {

    const token =
        getToken();


    // ------------------------------------------
    // LOGIN REQUIRED
    // ------------------------------------------

    if (!token) {

        showError(
            "Please login to view your bookings."
        );


        setTimeout(
            () => {

                window.location.href =
                    "login.html?redirect=my-bookings.html";

            },
            1000
        );


        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE}/bookings/my`,
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
            "📋 My Bookings API:",
            data
        );


        // ------------------------------------------
        // AUTH ERROR
        // ------------------------------------------

        if (
            response.status === 401 ||
            response.status === 403
        ) {

            localStorage.removeItem(
                "token"
            );


            showError(
                "Your login session has expired. Please login again."
            );


            setTimeout(
                () => {

                    window.location.href =
                        "login.html?redirect=my-bookings.html";

                },
                1200
            );


            return;

        }


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load your bookings."
            );

        }


        const bookings =
            Array.isArray(
                data.bookings
            )
                ? data.bookings
                : [];


        // ------------------------------------------
        // HIDE LOADING
        // ------------------------------------------

        if (loadingMessage) {

            loadingMessage.style.display =
                "none";

        }


        // ------------------------------------------
        // EMPTY
        // ------------------------------------------

        if (
            bookings.length === 0
        ) {

            if (emptyMessage) {

                emptyMessage.style.display =
                    "block";

            }


            return;

        }


        // ------------------------------------------
        // RENDER BOOKINGS
        // ------------------------------------------

        bookingsContainer.innerHTML =
            "";


        bookings.forEach(
            booking => {

                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "booking-card";


                const statusClass =
                    getStatusClass(
                        booking.status
                    );


                let imageHtml = `
                    <div class="booking-image-placeholder">
                        🧳
                    </div>
                `;


                if (
                    booking.package_image
                ) {

                    imageHtml = `

                        <img
                            class="booking-image"
                            src="../images/packages/${encodeURIComponent(
                                booking.package_image
                            )}"
                            alt="${escapeHtml(
                                booking.package_title
                            )}"
                            onerror="
                                this.style.display='none';
                                this.nextElementSibling.style.display='flex';
                            "
                        >

                        <div
                            class="booking-image-placeholder"
                            style="display:none;"
                        >
                            🧳
                        </div>

                    `;

                }


                card.innerHTML = `

                    <div class="booking-card-image">

                        ${imageHtml}

                    </div>


                    <div class="booking-card-content">


                        <div class="booking-card-top">


                            <div>

                                <span class="booking-id">

                                    Booking #${escapeHtml(
                                        booking.id
                                    )}

                                </span>


                                <h2>

                                    ${escapeHtml(
                                        booking.package_title
                                    )}

                                </h2>


                                <p class="destination">

                                    📍
                                    ${escapeHtml(
                                        booking.destination
                                    )}

                                </p>

                            </div>


                            <span
                                class="status-badge ${statusClass}"
                            >

                                ${escapeHtml(
                                    booking.status ||
                                    "Pending"
                                )}

                            </span>

                        </div>



                        <div
                            class="booking-info-grid"
                        >


                            <div class="info-item">

                                <span>
                                    Travel Date
                                </span>

                                <strong>
                                    ${formatDate(
                                        booking.travel_date
                                    )}
                                </strong>

                            </div>


                            <div class="info-item">

                                <span>
                                    Travelers
                                </span>

                                <strong>

                                    ${escapeHtml(
                                        booking.persons
                                    )}

                                    ${
                                        Number(
                                            booking.persons
                                        ) === 1
                                            ? " Person"
                                            : " Persons"
                                    }

                                </strong>

                            </div>


                            <div class="info-item">

                                <span>
                                    Duration
                                </span>

                                <strong>

                                    ${escapeHtml(
                                        booking.duration ||
                                        "-"
                                    )}

                                </strong>

                            </div>


                            <div class="info-item">

                                <span>
                                    Package Price
                                </span>

                                <strong>

                                    ${formatCurrency(
                                        booking.price
                                    )}

                                </strong>

                            </div>


                            <div class="info-item">

                                <span>
                                    Booked On
                                </span>

                                <strong>

                                    ${formatDate(
                                        booking.created_at
                                    )}

                                </strong>

                            </div>


                        </div>



                        ${
                            booking.message
                                ? `

                                    <div
                                        class="customer-message"
                                    >

                                        <strong>
                                            Your Message
                                        </strong>

                                        <p>
                                            ${escapeHtml(
                                                booking.message
                                            )}
                                        </p>

                                    </div>

                                `
                                : ""
                        }



                        <div
                            class="booking-card-footer"
                        >

                            <span>

                                ${
                                    booking.status ===
                                    "Confirmed"

                                        ? "✅ Your booking is confirmed."

                                        : booking.status ===
                                          "Cancelled"

                                            ? "❌ This booking has been cancelled."

                                            : "⏳ Your booking is awaiting confirmation."

                                }

                            </span>


                            <a
                                href="../index.html#packages"
                                class="browse-more-btn"
                            >
                                Browse Packages
                            </a>

                        </div>


                    </div>

                `;


                bookingsContainer.appendChild(
                    card
                );

            }
        );


    } catch (error) {

        console.error(
            "❌ My bookings error:",
            error
        );


        showError(
            error.message
        );

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


            window.location.href =
                "login.html";

        }
    );

}


// ==========================================================
// START
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadMyBookings();

    }
);