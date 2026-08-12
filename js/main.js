// ==========================================================
// ANAND TRAVEL TOURS
// MAIN JAVASCRIPT
// ==========================================================


// ==========================================================
// CONFIGURATION
// ==========================================================

const API_BASE = "http://localhost:5000/api";


// ==========================================================
// HTML ESCAPE
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
// FORMAT CURRENCY
// ==========================================================

function formatCurrency(value) {

    const number = Number(value || 0);

    return (
        "₹" +
        number.toLocaleString("en-IN")
    );
}


// ==========================================================
// GET LOGGED-IN USER
// ==========================================================

function getLoggedInUser() {

    const storedUser =
        localStorage.getItem("user");

    // ------------------------------------------------------
    // Try stored user
    // ------------------------------------------------------

    if (storedUser) {

        try {

            return JSON.parse(storedUser);

        } catch (error) {

            console.error(
                "❌ Invalid stored user:",
                error
            );

        }
    }


    // ------------------------------------------------------
    // Fallback to JWT
    // ------------------------------------------------------

    const token =
        localStorage.getItem("token");

    if (!token) {
        return null;
    }


    try {

        const parts =
            token.split(".");

        if (parts.length !== 3) {
            return null;
        }

        const payload =
            JSON.parse(
                atob(parts[1])
            );

        return payload;

    } catch (error) {

        console.error(
            "❌ Unable to decode token:",
            error
        );

        return null;
    }
}


// ==========================================================
// LOAD PACKAGES
// ==========================================================

async function loadPackages() {

    const container =
        document.getElementById(
            "packageContainer"
        );


    // ------------------------------------------------------
    // Make sure container exists
    // ------------------------------------------------------

    if (!container) {

        console.error(
            "❌ packageContainer not found"
        );

        return;
    }


    // ------------------------------------------------------
    // Loading state
    // ------------------------------------------------------

    container.innerHTML = `
        <div class="package-loading">
            Loading packages...
        </div>
    `;


    try {

        console.log(
            "🔄 Loading packages..."
        );


        // --------------------------------------------------
        // API REQUEST
        // --------------------------------------------------

        const response =
            await fetch(
                `${API_BASE}/packages`,
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );


        // --------------------------------------------------
        // Convert response to JSON
        // --------------------------------------------------

        const data =
            await response.json();


        console.log(
            "🧳 Packages API:",
            data
        );


        // --------------------------------------------------
        // Check HTTP status
        // --------------------------------------------------

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load packages"
            );
        }


        // --------------------------------------------------
        // Get packages
        // --------------------------------------------------

        const packages =
            Array.isArray(data.packages)
                ? data.packages
                : [];


        // --------------------------------------------------
        // Clear loading
        // --------------------------------------------------

        container.innerHTML = "";


        // --------------------------------------------------
        // No packages
        // --------------------------------------------------

        if (packages.length === 0) {

            container.innerHTML = `
                <div class="package-empty">

                    <h3>
                        No Tour Packages Available
                    </h3>

                    <p>
                        Please check again later.
                    </p>

                </div>
            `;

            return;
        }


        // --------------------------------------------------
        // Create package cards
        // --------------------------------------------------

        packages.forEach(
            packageItem => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "package-card";


                card.dataset.packageId =
                    packageItem.id;


                // ==========================================
                // IMAGE
                // ==========================================

                let imageHtml = `
                    <div class="package-image">

                        <div class="package-image-placeholder">
                            🧳
                        </div>

                    </div>
                `;


                if (packageItem.image) {

                    const imagePath =
                        `images/destinations/${encodeURIComponent(
                            packageItem.image
                        )}`;


                    imageHtml = `
                        <div class="package-image">

                            <img
                                src="${imagePath}"
                                alt="${escapeHtml(
                                    packageItem.title
                                )}"
                                class="package-img"
                            >

                            <div
                                class="package-image-placeholder image-fallback"
                                style="display:none;"
                            >
                                🧳
                            </div>

                            ${
                                packageItem.tag
                                    ? `
                                        <span class="package-tag">
                                            ${escapeHtml(
                                                packageItem.tag
                                            )}
                                        </span>
                                    `
                                    : ""
                            }

                        </div>
                    `;
                }


                // ==========================================
                // CARD
                // ==========================================

                card.innerHTML = `

                    ${imageHtml}


                    <div class="package-content">

                        <h3>
                            ${escapeHtml(
                                packageItem.title
                            )}
                        </h3>


                        <p class="location">

                            📍

                            ${escapeHtml(
                                packageItem.destination
                            )}

                        </p>


                        <p class="package-description">

                            ${escapeHtml(
                                packageItem.description
                            )}

                        </p>


                        <div class="package-info">

                            <span>

                                📅

                                ${escapeHtml(
                                    packageItem.duration
                                )}

                            </span>


                            <span>

                                👥

                                ${escapeHtml(
                                    packageItem.persons
                                )}

                                Persons

                            </span>

                        </div>


                        <div class="package-bottom">

                            <div class="package-price-box">

                                <small>
                                    Starting from
                                </small>

                                <strong>
                                    ${formatCurrency(
                                        packageItem.price
                                    )}
                                </strong>

                            </div>


                            <button
                                type="button"
                                class="view-package-btn"
                                data-package-id="${escapeHtml(
                                    packageItem.id
                                )}"
                            >
                                View Package
                            </button>

                        </div>

                    </div>
                `;


                // ==========================================
                // IMAGE FALLBACK
                // ==========================================

                const image =
                    card.querySelector(
                        ".package-img"
                    );


                if (image) {

                    image.addEventListener(
                        "error",
                        function () {

                            this.style.display =
                                "none";


                            const fallback =
                                this.parentElement.querySelector(
                                    ".image-fallback"
                                );


                            if (fallback) {

                                fallback.style.display =
                                    "flex";

                            }

                        }
                    );

                }


                // ==========================================
                // ADD CARD
                // ==========================================

                container.appendChild(
                    card
                );

            }
        );


        console.log(
            "✅ Packages loaded successfully:",
            packages.length
        );

    } catch (error) {

        console.error(
            "❌ Package loading error:",
            error
        );


        container.innerHTML = `
            <div class="package-empty">

                <h3>
                    Unable to Load Packages
                </h3>

                <p>
                    Please check whether the backend server
                    is running.
                </p>

                <button
                    type="button"
                    id="retryPackagesBtn"
                >
                    Try Again
                </button>

            </div>
        `;


        const retryButton =
            document.getElementById(
                "retryPackagesBtn"
            );


        if (retryButton) {

            retryButton.addEventListener(
                "click",
                loadPackages
            );

        }

    }
}


// ==========================================================
// VIEW PACKAGE
// ==========================================================

function viewPackage(packageId) {

    if (
        packageId === null ||
        packageId === undefined ||
        packageId === ""
    ) {

        console.error(
            "❌ Invalid package ID"
        );

        return;
    }


    const encodedId =
        encodeURIComponent(
            packageId
        );


    window.location.href =
        `pages/package-details.html?id=${encodedId}`;
}


// ==========================================================
// FILTER PACKAGES
// ==========================================================

function filterPackages(searchTerm) {

    const cards =
        document.querySelectorAll(
            ".package-card"
        );


    const term =
        String(searchTerm || "")
            .trim()
            .toLowerCase();


    let visibleCount = 0;


    cards.forEach(
        card => {

            const text =
                card.textContent
                    .toLowerCase();


            if (
                !term ||
                text.includes(term)
            ) {

                card.style.display =
                    "";

                visibleCount++;

            } else {

                card.style.display =
                    "none";
            }

        }
    );


    const container =
        document.getElementById(
            "packageContainer"
        );


    if (!container) {
        return;
    }


    let noResults =
        document.getElementById(
            "packageNoResults"
        );


    if (
        visibleCount === 0 &&
        cards.length > 0
    ) {

        if (!noResults) {

            noResults =
                document.createElement(
                    "p"
                );


            noResults.id =
                "packageNoResults";


            noResults.className =
                "package-empty";


            noResults.textContent =
                "No packages found for this destination.";


            container.appendChild(
                noResults
            );
        }


        noResults.style.display =
            "block";

    } else if (noResults) {

        noResults.style.display =
            "none";
    }
}


// ==========================================================
// SCROLL TO SECTION
// ==========================================================

function scrollToSection(sectionId) {

    const section =
        document.getElementById(
            sectionId
        );


    if (!section) {

        console.warn(
            `⚠️ Section #${sectionId} not found`
        );

        return;
    }


    section.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// ==========================================================
// HERO BUTTONS
// ==========================================================

function setupHeroButtons() {

    const exploreToursBtn =
        document.querySelector(
            ".hero .btn-primary"
        );


    const viewPackagesBtn =
        document.querySelector(
            ".hero .btn-secondary"
        );


    // Explore Tours

    if (exploreToursBtn) {

        exploreToursBtn.addEventListener(
            "click",
            event => {

                event.preventDefault();

                scrollToSection(
                    "packages"
                );

            }
        );

    }


    // View Packages

    if (viewPackagesBtn) {

        viewPackagesBtn.addEventListener(
            "click",
            event => {

                event.preventDefault();

                scrollToSection(
                    "packages"
                );

            }
        );

    }

}


// ==========================================================
// HOMEPAGE NAVIGATION
// ==========================================================

function setupNavbarNavigation() {

    const navLinks =
        document.querySelectorAll(
            "nav a"
        );


    navLinks.forEach(
        link => {

            const text =
                link.textContent
                    .trim()
                    .toLowerCase();


            link.addEventListener(
                "click",
                event => {

                    // Home

                    if (
                        text === "home"
                    ) {

                        event.preventDefault();

                        window.scrollTo({
                            top: 0,
                            behavior: "smooth"
                        });

                        return;
                    }


                    // Destinations

                    if (
                        text === "destinations"
                    ) {

                        event.preventDefault();

                        scrollToSection(
                            "destinations"
                        );

                        return;
                    }


                    // Packages

                    if (
                        text === "packages"
                    ) {

                        event.preventDefault();

                        scrollToSection(
                            "packages"
                        );

                        return;
                    }


                    // About

                    if (
                        text === "about"
                    ) {

                        event.preventDefault();

                        scrollToSection(
                            "about"
                        );

                        return;
                    }


                    // Contact

                    if (
                        text === "contact"
                    ) {

                        event.preventDefault();

                        scrollToSection(
                            "contact"
                        );

                        return;
                    }

                }
            );

        }
    );

}


// ==========================================================
// DESTINATION BUTTONS
// ==========================================================

function setupDestinationButtons() {

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".destination-btn"
                );


            if (!button) {
                return;
            }


            const destination =
                button.dataset.destination;


            if (!destination) {
                return;
            }


            scrollToSection(
                "packages"
            );


            const destinationInput =
                document.getElementById(
                    "destination"
                );


            if (destinationInput) {

                destinationInput.value =
                    destination;

            }


            setTimeout(
                () => {

                    filterPackages(
                        destination
                    );

                },
                300
            );

        }
    );

}


// ==========================================================
// PACKAGE BUTTON EVENTS
// ==========================================================

function setupPackageButtons() {

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".view-package-btn"
                );


            if (!button) {
                return;
            }


            const packageId =
                button.dataset.packageId;


            viewPackage(
                packageId
            );

        }
    );

}


// ==========================================================
// SEARCH BUTTON
// ==========================================================

function setupSearch() {

    const searchButton =
        document.getElementById(
            "searchBtn"
        );


    const destinationInput =
        document.getElementById(
            "destination"
        );


    if (searchButton) {

        searchButton.addEventListener(
            "click",
            () => {

                const destination =
                    destinationInput
                        ? destinationInput.value.trim()
                        : "";


                scrollToSection(
                    "packages"
                );


                filterPackages(
                    destination
                );

            }
        );

    }


    if (destinationInput) {

        destinationInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();


                    if (searchButton) {

                        searchButton.click();

                    }

                }

            }
        );

    }

}


// ==========================================================
// NAVBAR SCROLL EFFECT
// ==========================================================

function setupNavbarScroll() {

    window.addEventListener(
        "scroll",
        () => {

            const nav =
                document.querySelector(
                    "nav"
                );


            if (!nav) {
                return;
            }


            if (
                window.scrollY > 50
            ) {

                nav.classList.add(
                    "scrolled"
                );

            } else {

                nav.classList.remove(
                    "scrolled"
                );

            }

        }
    );

}


// ==========================================================
// UPDATE AUTH UI
// ==========================================================

function updateAuthUI() {

    const loginLink =
        document.getElementById(
            "loginLink"
        );


    const registerLink =
        document.getElementById(
            "registerLink"
        );


    const loggedInArea =
        document.getElementById(
            "loggedInArea"
        );


    const userWelcome =
        document.getElementById(
            "userWelcome"
        );


    const dashboardLink =
        document.getElementById(
            "dashboardLink"
        );


    const accountLink =
        document.getElementById(
            "accountLink"
        );


    const myBookingsLink =
        document.getElementById(
            "myBookingsLink"
        );


    // ------------------------------------------------------
    // If navbar does not contain auth elements
    // ------------------------------------------------------

    if (
        !loginLink ||
        !registerLink ||
        !loggedInArea
    ) {

        console.warn(
            "⚠️ Authentication navbar elements not found."
        );

        return;
    }


    const user =
        getLoggedInUser();


    // ======================================================
    // LOGGED OUT
    // ======================================================

    if (!user) {

        loginLink.style.display =
            "inline-block";


        registerLink.style.display =
            "inline-block";


        loggedInArea.style.display =
            "none";


        if (accountLink) {

            accountLink.style.display =
                "none";

        }


        if (myBookingsLink) {

            myBookingsLink.style.display =
                "none";

        }


        if (dashboardLink) {

            dashboardLink.style.display =
                "none";

        }


        return;
    }


    // ======================================================
    // LOGGED IN
    // ======================================================

    loginLink.style.display =
        "none";


    registerLink.style.display =
        "none";


    loggedInArea.style.display =
        "flex";


    const name =
        user.full_name ||
        user.name ||
        user.email ||
        "User";


    if (userWelcome) {

        userWelcome.textContent =
            `👤 ${name}`;

    }


    // ======================================================
    // ADMIN
    // ======================================================

    if (
        user.role === "admin"
    ) {

        // Hide customer links

        if (accountLink) {

            accountLink.style.display =
                "none";

        }


        if (myBookingsLink) {

            myBookingsLink.style.display =
                "none";

        }


        // Admin dashboard

        if (dashboardLink) {

            dashboardLink.href =
                "pages/admin.html";


            dashboardLink.textContent =
                "Admin Dashboard";


            dashboardLink.style.display =
                "inline-block";

        }

    }


    // ======================================================
    // NORMAL CUSTOMER
    // ======================================================

    else {

        if (accountLink) {

            accountLink.href =
                "pages/account.html";


            accountLink.textContent =
                "My Account";


            accountLink.style.display =
                "inline-block";

        }


        if (myBookingsLink) {

            myBookingsLink.href =
                "pages/my-bookings.html";


            myBookingsLink.style.display =
                "inline-block";

        }


        if (dashboardLink) {

            dashboardLink.style.display =
                "none";

        }

    }

}


// ==========================================================
// LOGOUT
// ==========================================================

function logoutFromNavbar(event) {

    if (event) {

        event.preventDefault();

    }


    localStorage.removeItem(
        "token"
    );


    localStorage.removeItem(
        "user"
    );


    window.location.href =
        "index.html";
}


// ==========================================================
// SETUP LOGOUT
// ==========================================================

function setupLogout() {

    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );


    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            logoutFromNavbar
        );

    }

}


// ==========================================================
// INITIALIZE HOMEPAGE
// ==========================================================

function initializeHomepage() {

    console.log(
        "🚀 Anand Travel Tours JavaScript loaded"
    );


    loadPackages();

    updateAuthUI();

    setupHeroButtons();

    setupNavbarNavigation();

    setupDestinationButtons();

    setupPackageButtons();

    setupSearch();

    setupNavbarScroll();

    setupLogout();

}


// ==========================================================
// START
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    initializeHomepage
);


// ==========================================================
// EXPOSE FUNCTIONS
// ==========================================================
//
// IMPORTANT:
// These MUST remain AFTER the function definitions above.
// Do NOT move them to the top of this file.
// ==========================================================

window.loadPackages =
    loadPackages;


window.viewPackage =
    viewPackage;


window.filterPackages =
    filterPackages;


window.updateAuthUI =
    updateAuthUI;


window.logoutFromNavbar =
    logoutFromNavbar;