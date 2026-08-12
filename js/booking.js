// ==========================================================
// ANAND TRAVEL TOURS
// CUSTOMER BOOKING
// ==========================================================

const API_BASE = "http://localhost:5000/api";

// ==========================================================
// GET TOKEN
// ==========================================================

function getToken() {
    return localStorage.getItem("token");
}

// ==========================================================
// GET PACKAGE ID FROM URL
// ==========================================================

const urlParams = new URLSearchParams(window.location.search);

const packageId =
    urlParams.get("package_id") ||
    urlParams.get("packageId") ||
    urlParams.get("id");

// ==========================================================
// ELEMENTS
// ==========================================================

const bookingForm =
    document.getElementById("bookingForm");

const packageSummary =
    document.getElementById("packageSummary");

const fullNameInput =
    document.getElementById("full_name");

const emailInput =
    document.getElementById("email");

const phoneInput =
    document.getElementById("phone");

const travelDateInput =
    document.getElementById("travel_date");

const personsInput =
    document.getElementById("persons");

const messageInput =
    document.getElementById("message");

const bookingMessage =
    document.getElementById("bookingMessage");

// ==========================================================
// ESCAPE HTML
// ==========================================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ==========================================================
// SHOW MESSAGE
// ==========================================================

function showMessage(message, type = "error") {

    if (bookingMessage) {

        bookingMessage.textContent = message;

        bookingMessage.className =
            `booking-message ${type}`;

        bookingMessage.style.display = "block";

        return;
    }

    if (type === "error") {
        alert(message);
    }
}

// ==========================================================
// LOGIN CHECK
// ==========================================================

function requireLogin() {

    const token = getToken();

    if (!token) {

        showMessage(
            "Please login before booking this tour.",
            "error"
        );

        setTimeout(() => {

            window.location.href =
                `login.html?redirect=${encodeURIComponent(
                    window.location.pathname +
                    window.location.search
                )}`;

        }, 1000);

        return false;
    }

    return true;
}

// ==========================================================
// SET MINIMUM TRAVEL DATE
// ==========================================================

function setMinimumTravelDate() {

    if (!travelDateInput) {
        return;
    }

    const today = new Date();

    const year =
        today.getFullYear();

    const month =
        String(today.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(today.getDate())
            .padStart(2, "0");

    travelDateInput.min =
        `${year}-${month}-${day}`;
}

// ==========================================================
// SHOW PACKAGE SUMMARY
// ==========================================================

function displayPackageSummary(packageData) {

    if (!packageSummary) {
        return;
    }

    const title =
        packageData.title ||
        "Tour Package";

    const destination =
        packageData.destination ||
        "Destination not specified";

    const duration =
        packageData.duration ||
        "Duration not specified";

    const persons =
        Number(packageData.persons) || 0;

    const price =
        Number(packageData.price) || 0;

    const formattedPrice =
        `₹${price.toLocaleString("en-IN")}`;

    const image =
        packageData.image
            ? `../images/packages/${encodeURIComponent(
                packageData.image
            )}`
            : "../images/logo.jpg";

    const tag =
        packageData.tag || "";

    packageSummary.innerHTML = `
        <div class="booking-package-card">

            <div class="booking-package-image">

                <img
                    src="${image}"
                    alt="${escapeHtml(title)}"
                    onerror="this.onerror=null;this.src='../images/logo.jpg';"
                >

            </div>

            <div class="booking-package-info">

                ${
                    tag
                        ? `<span class="booking-package-tag">
                            ${escapeHtml(tag)}
                           </span>`
                        : ""
                }

                <h2>
                    ${escapeHtml(title)}
                </h2>

                <p class="booking-destination">
                    📍 ${escapeHtml(destination)}
                </p>

                <div class="booking-package-meta">

                    <span>
                        🕐 ${escapeHtml(duration)}
                    </span>

                    <span>
                        👥 ${
                            persons > 0
                                ? `${persons} Persons`
                                : "Flexible group"
                        }
                    </span>

                    <strong>
                        ${formattedPrice}
                    </strong>

                </div>

            </div>

        </div>
    `;
}

// ==========================================================
// LOAD PACKAGE
// ==========================================================

async function loadPackage() {

    if (!packageId) {

        console.warn(
            "⚠️ No package ID was found in the URL."
        );

        if (packageSummary) {

            packageSummary.innerHTML = `
                <div class="package-load-error">
                    <strong>Package information is missing.</strong>
                    <p>
                        Please return to the packages page
                        and select a tour.
                    </p>
                </div>
            `;
        }

        return;
    }

    try {

        console.log(
            "📦 Loading booking package:",
            packageId
        );

        const response =
            await fetch(
                `${API_BASE}/packages/${encodeURIComponent(
                    packageId
                )}`
            );

        let data;

        try {
            data = await response.json();
        } catch (jsonError) {

            throw new Error(
                "The server returned an invalid response."
            );
        }

        console.log(
            "📦 Package response:",
            data
        );

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load package."
            );
        }

        const packageData =
            data.package;

        if (!packageData) {

            throw new Error(
                "Package was not found."
            );
        }

        // --------------------------------------------------
        // DISPLAY PACKAGE
        // --------------------------------------------------

        displayPackageSummary(
            packageData
        );

        // --------------------------------------------------
        // STORE PACKAGE ID IF HIDDEN INPUT EXISTS
        // --------------------------------------------------

        const packageIdInput =
            document.getElementById(
                "package_id"
            );

        if (packageIdInput) {

            packageIdInput.value =
                packageData.id;
        }

        // --------------------------------------------------
        // SET DEFAULT PERSONS
        // --------------------------------------------------

        if (
            personsInput &&
            packageData.persons
        ) {

            personsInput.value =
                packageData.persons;
        }

        console.log(
            "✅ Booking package loaded successfully."
        );

    } catch (error) {

        console.error(
            "❌ Package loading error:",
            error
        );

        if (packageSummary) {

            packageSummary.innerHTML = `
                <div class="package-load-error">

                    <strong>
                        Unable to load package
                    </strong>

                    <p>
                        ${escapeHtml(
                            error.message ||
                            "Something went wrong."
                        )}
                    </p>

                    <a
                        href="../index.html#packages"
                        class="back-to-packages"
                    >
                        ← Back to Packages
                    </a>

                </div>
            `;
        }
    }
}

// ==========================================================
// BOOKING SUBMISSION
// ==========================================================

if (bookingForm) {

    bookingForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            // ------------------------------------------------
            // LOGIN
            // ------------------------------------------------

            if (!requireLogin()) {
                return;
            }

            const token =
                getToken();

            if (!token) {

                showMessage(
                    "Access token required. Please login again.",
                    "error"
                );

                return;
            }

            // ------------------------------------------------
            // PACKAGE ID
            // ------------------------------------------------

            const hiddenPackageId =
                document.getElementById(
                    "package_id"
                );

            const selectedPackageId =
                hiddenPackageId?.value ||
                packageId;

            if (!selectedPackageId) {

                showMessage(
                    "Package information is missing.",
                    "error"
                );

                return;
            }

            // ------------------------------------------------
            // FORM VALUES
            // ------------------------------------------------

            const fullName =
                fullNameInput
                    ? fullNameInput.value.trim()
                    : "";

            const email =
                emailInput
                    ? emailInput.value.trim()
                    : "";

            const phone =
                phoneInput
                    ? phoneInput.value.trim()
                    : "";

            const travelDate =
                travelDateInput
                    ? travelDateInput.value
                    : "";

            const persons =
                personsInput
                    ? Number(personsInput.value)
                    : 0;

            const message =
                messageInput
                    ? messageInput.value.trim()
                    : "";

            // ------------------------------------------------
            // VALIDATION
            // ------------------------------------------------

            if (
                !fullName ||
                !email ||
                !phone ||
                !travelDate ||
                !persons
            ) {

                showMessage(
                    "Please fill all required fields.",
                    "error"
                );

                return;
            }

            if (persons < 1) {

                showMessage(
                    "Number of persons must be at least 1.",
                    "error"
                );

                return;
            }

            // Prevent past travel dates

            if (travelDateInput?.min &&
                travelDate < travelDateInput.min) {

                showMessage(
                    "Please select a future travel date.",
                    "error"
                );

                return;
            }

            // ------------------------------------------------
            // EMAIL VALIDATION
            // ------------------------------------------------

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(email)) {

                showMessage(
                    "Please enter a valid email address.",
                    "error"
                );

                return;
            }

            // ------------------------------------------------
            // BUTTON
            // ------------------------------------------------

            const submitButton =
                bookingForm.querySelector(
                    'button[type="submit"]'
                );

            const originalButtonText =
                submitButton
                    ? submitButton.textContent
                    : "";

            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "Confirming Booking...";
            }

            // ------------------------------------------------
            // REQUEST DATA
            // ------------------------------------------------

            const bookingData = {

                package_id:
                    Number(
                        selectedPackageId
                    ),

                full_name:
                    fullName,

                email:
                    email,

                phone:
                    phone,

                travel_date:
                    travelDate,

                persons:
                    persons,

                message:
                    message || null
            };

            try {

                console.log(
                    "📤 Creating booking:",
                    bookingData
                );

                // --------------------------------------------
                // SEND TO BACKEND
                // --------------------------------------------

                const response =
                    await fetch(
                        `${API_BASE}/bookings`,
                        {
                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`
                            },

                            body:
                                JSON.stringify(
                                    bookingData
                                )
                        }
                    );

                let data;

                try {

                    data =
                        await response.json();

                } catch (jsonError) {

                    throw new Error(
                        "Invalid response from server."
                    );
                }

                console.log(
                    "📥 Booking response:",
                    data
                );

                // --------------------------------------------
                // AUTH ERROR
                // --------------------------------------------

                if (
                    response.status === 401 ||
                    response.status === 403
                ) {

                    localStorage.removeItem(
                        "token"
                    );

                    showMessage(
                        "Your login session has expired. Please login again.",
                        "error"
                    );

                    setTimeout(() => {

                        window.location.href =
                            `login.html?redirect=${encodeURIComponent(
                                window.location.pathname +
                                window.location.search
                            )}`;

                    }, 1200);

                    return;
                }

                // --------------------------------------------
                // OTHER ERROR
                // --------------------------------------------

                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        data.error ||
                        "Failed to create booking."
                    );
                }

                // --------------------------------------------
                // SUCCESS
                // --------------------------------------------

                let successMessage =
                    data.message ||
                    "Booking created successfully!";

                if (data.booking_id) {

                    successMessage =
                        `Booking successful! Your booking ID is #${data.booking_id}.`;
                }

                showMessage(
                    successMessage,
                    "success"
                );

                // --------------------------------------------
                // RESET FORM
                // --------------------------------------------

                bookingForm.reset();

                // Restore default persons

                if (personsInput) {

                    personsInput.value =
                        2;
                }

                // Preserve package ID

                if (hiddenPackageId) {

                    hiddenPackageId.value =
                        selectedPackageId;
                }

                // --------------------------------------------
                // REDIRECT
                // --------------------------------------------

                setTimeout(() => {

                    window.location.href =
                        "my-bookings.html";

                }, 1800);

            } catch (error) {

                console.error(
                    "❌ Booking error:",
                    error
                );

                showMessage(
                    `Booking failed: ${
                        error.message
                    }`,
                    "error"
                );

            } finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        originalButtonText ||
                        "Confirm Booking";
                }
            }
        }
    );
}

// ==========================================================
// START
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setMinimumTravelDate();

        if (bookingForm) {
            requireLogin();
        }

        loadPackage();
    }
);