// ==========================================================
// ANAND TRAVEL TOURS
// PACKAGE DETAILS
// ==========================================================

const API_BASE = "http://localhost:5000/api";

// ==========================================================
// GET PACKAGE ID FROM URL
// Example:
// package-details.html?id=7
// ==========================================================

const urlParams = new URLSearchParams(window.location.search);
const packageId = urlParams.get("id");

// ==========================================================
// ELEMENTS
// ==========================================================

const packageDetails = document.getElementById("packageDetails");
const packageLoading = document.getElementById("packageLoading");
const packageContent = document.getElementById("packageContent");
const packageError = document.getElementById("packageError");

const packageTitle = document.getElementById("packageTitle");
const packageDestination = document.getElementById("packageDestination");
const packageDescription = document.getElementById("packageDescription");

const packageDuration = document.getElementById("packageDuration");
const packagePersons = document.getElementById("packagePersons");
const packagePrice = document.getElementById("packagePrice");

const packageImage = document.getElementById("packageImage");
const packageTag = document.getElementById("packageTag");

const bookNowBtn = document.getElementById("bookNowBtn");

// ==========================================================
// ESCAPE HTML
// ==========================================================

function escapeHtml(value) {
    if (value === null || value === undefined) {
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
// SHOW ERROR
// ==========================================================

function showError(message) {
    if (packageLoading) {
        packageLoading.style.display = "none";
    }

    if (packageContent) {
        packageContent.style.display = "none";
    }

    if (packageError) {
        packageError.innerHTML = `
            <div>
                <h2>Unable to load package</h2>

                <p>
                    ${escapeHtml(message)}
                </p>

                <a
                    href="../index.html#packages"
                    class="back-btn"
                >
                    ← Back to Packages
                </a>
            </div>
        `;

        packageError.style.display = "block";
    }
}

// ==========================================================
// FORMAT PRICE
// ==========================================================

function formatPrice(price) {
    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice)) {
        return "₹0";
    }

    return `₹${numericPrice.toLocaleString("en-IN")}`;
}

// ==========================================================
// SET PACKAGE IMAGE
// ==========================================================

function setPackageImage(packageData) {
    if (!packageImage) {
        return;
    }

    // If database contains an image
    if (packageData.image) {
        packageImage.src =
            `../images/packages/${encodeURIComponent(packageData.image)}`;

        packageImage.alt =
            packageData.title || "Tour package";

        packageImage.onerror = function () {
            console.warn(
                "⚠️ Package image not found:",
                packageData.image
            );

            packageImage.onerror = null;
            packageImage.src = "../images/logo.jpg";
        };

        return;
    }

    // No image in database
    packageImage.src = "../images/logo.jpg";
    packageImage.alt = packageData.title || "Anand Travel Tours";
}

// ==========================================================
// SET PACKAGE TAG
// ==========================================================

function setPackageTag(tag) {
    if (!packageTag) {
        return;
    }

    if (tag && String(tag).trim() !== "") {
        packageTag.textContent = String(tag).trim();
        packageTag.style.display = "inline-flex";
    } else {
        packageTag.textContent = "";
        packageTag.style.display = "none";
    }
}

// ==========================================================
// LOAD PACKAGE DETAILS
// ==========================================================

async function loadPackageDetails() {

    // ------------------------------------------------------
    // CHECK PACKAGE ID
    // ------------------------------------------------------

    if (!packageId) {
        console.error("❌ No package ID found in URL.");

        showError(
            "Package information is missing. Please return to the packages page."
        );

        return;
    }

    console.log("📦 Loading package:", packageId);

    // ------------------------------------------------------
    // SHOW LOADING
    // ------------------------------------------------------

    if (packageLoading) {
        packageLoading.style.display = "flex";
    }

    if (packageContent) {
        packageContent.style.display = "none";
    }

    if (packageError) {
        packageError.style.display = "none";
    }

    try {

        // --------------------------------------------------
        // API REQUEST
        // --------------------------------------------------

        const response = await fetch(
            `${API_BASE}/packages/${encodeURIComponent(packageId)}`
        );

        let data;

        try {
            data = await response.json();
        } catch (jsonError) {
            throw new Error(
                "The server returned an invalid response."
            );
        }

        console.log("📦 Package API:", data);

        // --------------------------------------------------
        // CHECK RESPONSE
        // --------------------------------------------------

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to load package."
            );
        }

        // --------------------------------------------------
        // GET PACKAGE
        // --------------------------------------------------

        const packageData = data.package;

        if (!packageData) {
            throw new Error(
                "Package was not found."
            );
        }

        console.log(
            "✅ Package received:",
            packageData
        );

        // --------------------------------------------------
        // TITLE
        // --------------------------------------------------

        if (packageTitle) {
            packageTitle.textContent =
                packageData.title || "Tour Package";
        }

        document.title =
            `${packageData.title || "Tour Package"} - Anand Travel Tours`;

        // --------------------------------------------------
        // DESTINATION
        // --------------------------------------------------

        if (packageDestination) {
            packageDestination.textContent =
                packageData.destination || "Destination not specified";
        }

        // --------------------------------------------------
        // DESCRIPTION
        // --------------------------------------------------

        if (packageDescription) {
            packageDescription.textContent =
                packageData.description ||
                "Discover an unforgettable travel experience with Anand Travel Tours.";
        }

        // --------------------------------------------------
        // DURATION
        // --------------------------------------------------

        if (packageDuration) {
            packageDuration.textContent =
                packageData.duration || "-";
        }

        // --------------------------------------------------
        // PERSONS
        // --------------------------------------------------

        if (packagePersons) {

            const persons = Number(packageData.persons);

            if (persons > 0) {
                packagePersons.textContent =
                    `${persons} ${persons === 1 ? "Person" : "Persons"}`;
            } else {
                packagePersons.textContent = "-";
            }
        }

        // --------------------------------------------------
        // PRICE
        // --------------------------------------------------

        if (packagePrice) {
            packagePrice.textContent =
                formatPrice(packageData.price);
        }

        // --------------------------------------------------
        // IMAGE
        // --------------------------------------------------

        setPackageImage(packageData);

        // --------------------------------------------------
        // TAG
        // --------------------------------------------------

        setPackageTag(packageData.tag);

        // --------------------------------------------------
        // BOOK NOW
        // --------------------------------------------------

        if (bookNowBtn) {

            bookNowBtn.onclick = function () {

                if (!packageData.id) {
                    console.error(
                        "❌ Package ID is missing."
                    );

                    return;
                }

                const targetUrl =
                    `booking.html?package_id=${encodeURIComponent(
                        packageData.id
                    )}`;

                console.log(
                    "➡️ Opening booking:",
                    targetUrl
                );

                window.location.href = targetUrl;
            };
        }

        // --------------------------------------------------
        // SHOW PACKAGE
        // --------------------------------------------------

        if (packageLoading) {
            packageLoading.style.display = "none";
        }

        if (packageContent) {
            packageContent.style.display = "grid";
        }

        if (packageError) {
            packageError.style.display = "none";
        }

        console.log(
            "✅ Package details loaded successfully."
        );

    } catch (error) {

        console.error(
            "❌ Package details error:",
            error
        );

        showError(
            error.message ||
            "Something went wrong while loading the package."
        );
    }
}

// ==========================================================
// START
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {
        loadPackageDetails();
    }
);