// ==========================================================
// ANAND TRAVEL TOURS
// ADMIN DASHBOARD
// ==========================================================


const API_BASE =
    "http://localhost:5000/api";


const token =
    localStorage.getItem("token");


// ==========================================================
// DASHBOARD ELEMENTS
// ==========================================================

const totalUsers =
    document.getElementById("totalUsers");

const totalPackages =
    document.getElementById("totalPackages");

const totalBookings =
    document.getElementById("totalBookings");

const revenue =
    document.getElementById("revenue");

const pendingBookings =
    document.getElementById("pendingBookings");

const confirmedBookings =
    document.getElementById("confirmedBookings");

const cancelledBookings =
    document.getElementById("cancelledBookings");

const adminMessage =
    document.getElementById("adminMessage");


// ==========================================================
// HELPERS
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


function formatDate(value) {

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


function formatCurrency(value) {

    return (
        "₹" +
        Number(
            value || 0
        ).toLocaleString("en-IN")
    );

}


// ==========================================================
// ADMIN REQUEST
// ==========================================================

async function adminRequest(
    url,
    options = {}
) {

    const adminToken =
        localStorage.getItem("token");


    if (!adminToken) {

        throw new Error(
            "Admin token not found. Please login again."
        );

    }


    const headers = {

        ...(options.headers || {}),

        "Authorization":
            `Bearer ${adminToken}`

    };


    const response =
        await fetch(
            url,
            {
                ...options,
                headers
            }
        );


    let data = {};


    try {

        data =
            await response.json();

    } catch (error) {

        data = {};

    }


    if (!response.ok) {

        throw new Error(

            data.message ||
            data.error ||
            `Request failed with status ${response.status}`

        );

    }


    return data;

}


// ==========================================================
// DASHBOARD
// ==========================================================

async function loadDashboard() {

    try {

        const data =
            await adminRequest(
                `${API_BASE}/admin/stats`
            );


        const stats =
            data.stats || {};


        if (totalUsers) {

            totalUsers.textContent =
                stats.totalUsers ?? 0;

        }


        if (totalPackages) {

            totalPackages.textContent =
                stats.totalPackages ?? 0;

        }


        if (totalBookings) {

            totalBookings.textContent =
                stats.totalBookings ?? 0;

        }


        if (pendingBookings) {

            pendingBookings.textContent =
                stats.pendingBookings ?? 0;

        }


        if (confirmedBookings) {

            confirmedBookings.textContent =
                stats.confirmedBookings ?? 0;

        }


        if (cancelledBookings) {

            cancelledBookings.textContent =
                stats.cancelledBookings ?? 0;

        }


        if (revenue) {

            revenue.textContent =
                formatCurrency(
                    stats.revenue ?? 0
                );

        }


        if (adminMessage) {

            adminMessage.textContent =
                "";

        }

    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );


        if (adminMessage) {

            adminMessage.textContent =
                error.message;

        }

    }

}


// ==========================================================
// BOOKINGS
// ==========================================================

function renderBookingTable(
    table,
    bookings
) {

    if (!table) {
        return;
    }


    table.innerHTML =
        "";


    if (
        !Array.isArray(bookings) ||
        bookings.length === 0
    ) {

        table.innerHTML = `
            <tr>
                <td colspan="7">
                    No bookings found.
                </td>
            </tr>
        `;

        return;

    }


    bookings.forEach(
        booking => {

            const row =
                document.createElement(
                    "tr"
                );


            const status =
                booking.status ||
                "Pending";


            let statusClass =
                "status-pending";


            if (
                status === "Confirmed"
            ) {

                statusClass =
                    "status-confirmed";

            }


            if (
                status === "Cancelled"
            ) {

                statusClass =
                    "status-cancelled";

            }


            row.innerHTML = `

                <td>
                    #${escapeHtml(
                        booking.id
                    )}
                </td>


                <td>

                    <strong>
                        ${escapeHtml(
                            booking.full_name
                        )}
                    </strong>

                    <br>

                    <small>
                        ${escapeHtml(
                            booking.email
                        )}
                    </small>

                    <br>

                    <small>
                        ${escapeHtml(
                            booking.phone
                        )}
                    </small>

                </td>


                <td>

                    <strong>
                        ${escapeHtml(
                            booking.package_title
                        )}
                    </strong>

                    <br>

                    <small>
                        📍
                        ${escapeHtml(
                            booking.destination
                        )}
                    </small>

                </td>


                <td>
                    ${formatDate(
                        booking.travel_date
                    )}
                </td>


                <td>
                    ${escapeHtml(
                        booking.persons
                    )}
                </td>


                <td>

                    <span
                        class="status-badge ${statusClass}"
                    >
                        ${escapeHtml(
                            status
                        )}
                    </span>

                </td>


                <td>

                    <div
                        class="action-buttons"
                    >

                        <button
                            type="button"
                            class="view-btn"
                            onclick="viewBooking(${Number(
                                booking.id
                            )})"
                        >
                            View
                        </button>


                        <button
                            type="button"
                            class="confirm-btn"
                            onclick="updateBooking(${Number(
                                booking.id
                            )}, 'Confirmed')"
                            ${
                                status ===
                                "Confirmed"
                                    ? "disabled"
                                    : ""
                            }
                        >
                            Confirm
                        </button>


                        <button
                            type="button"
                            class="cancel-btn"
                            onclick="updateBooking(${Number(
                                booking.id
                            )}, 'Cancelled')"
                            ${
                                status ===
                                "Cancelled"
                                    ? "disabled"
                                    : ""
                            }
                        >
                            Cancel
                        </button>

                    </div>

                </td>

            `;


            table.appendChild(
                row
            );

        }
    );

}


async function loadBookings() {

    const table =
        document.getElementById(
            "bookingsTable"
        );


    const dashboardTable =
        document.getElementById(
            "dashboardBookingsTable"
        );


    if (table) {

        table.innerHTML = `
            <tr>
                <td colspan="7">
                    Loading bookings...
                </td>
            </tr>
        `;

    }


    if (dashboardTable) {

        dashboardTable.innerHTML = `
            <tr>
                <td colspan="7">
                    Loading bookings...
                </td>
            </tr>
        `;

    }


    try {

        const data =
            await adminRequest(
                `${API_BASE}/bookings`
            );


        const bookings =
            Array.isArray(
                data.bookings
            )
                ? data.bookings
                : [];


        renderBookingTable(
            table,
            bookings
        );


        renderBookingTable(
            dashboardTable,
            bookings.slice(
                0,
                5
            )
        );


    } catch (error) {

        console.error(
            "Load bookings error:",
            error
        );


        if (table) {

            table.innerHTML = `
                <tr>
                    <td colspan="7">
                        Unable to load bookings:
                        ${escapeHtml(
                            error.message
                        )}
                    </td>
                </tr>
            `;

        }


        if (dashboardTable) {

            dashboardTable.innerHTML = `
                <tr>
                    <td colspan="7">
                        Unable to load bookings.
                    </td>
                </tr>
            `;

        }

    }

}


// ==========================================================
// BOOKING DETAILS
// ==========================================================

async function viewBooking(
    id
) {

    const modal =
        document.getElementById(
            "bookingModal"
        );


    const details =
        document.getElementById(
            "bookingDetails"
        );


    if (
        !modal ||
        !details
    ) {

        return;

    }


    modal.classList.add(
        "show"
    );


    document.body.classList.add(
        "modal-open"
    );


    details.innerHTML =
        "Loading details...";


    try {

        const data =
            await adminRequest(
                `${API_BASE}/bookings/${id}`
            );


        const booking =
            data.booking;


        if (!booking) {

            throw new Error(
                "Booking details were not returned."
            );

        }


        let messageHTML =
            "";


        if (
            booking.message
        ) {

            messageHTML = `

                <div class="booking-message">

                    <strong>
                        Customer Message
                    </strong>

                    <p>
                        ${escapeHtml(
                            booking.message
                        )}
                    </p>

                </div>

            `;

        }


        details.innerHTML = `

            <div class="booking-detail">
                <strong>Booking ID</strong>
                <span>
                    #${escapeHtml(
                        booking.id
                    )}
                </span>
            </div>


            <div class="booking-detail">
                <strong>Customer</strong>
                <span>
                    ${escapeHtml(
                        booking.full_name
                    )}
                </span>
            </div>


            <div class="booking-detail">
                <strong>Email</strong>
                <span>
                    ${escapeHtml(
                        booking.email
                    )}
                </span>
            </div>


            <div class="booking-detail">
                <strong>Phone</strong>
                <span>
                    ${escapeHtml(
                        booking.phone
                    )}
                </span>
            </div>


            <div class="booking-detail">
                <strong>Package</strong>
                <span>
                    ${escapeHtml(
                        booking.package_title
                    )}
                </span>
            </div>


            <div class="booking-detail">
                <strong>Destination</strong>
                <span>
                    ${escapeHtml(
                        booking.destination
                    )}
                </span>
            </div>


            <div class="booking-detail">
                <strong>Duration</strong>
                <span>
                    ${escapeHtml(
                        booking.duration
                    )}
                </span>
            </div>


            <div class="booking-detail">
                <strong>Package Price</strong>
                <span>
                    ${formatCurrency(
                        booking.price
                    )}
                </span>
            </div>


            <div class="booking-detail">
                <strong>Travel Date</strong>
                <span>
                    ${formatDate(
                        booking.travel_date
                    )}
                </span>
            </div>


            <div class="booking-detail">
                <strong>Travelers</strong>
                <span>
                    ${escapeHtml(
                        booking.persons
                    )}
                </span>
            </div>


            <div class="booking-detail">
                <strong>Status</strong>
                <span>
                    ${escapeHtml(
                        booking.status
                    )}
                </span>
            </div>


            <div class="booking-detail">
                <strong>Booked On</strong>
                <span>
                    ${formatDate(
                        booking.created_at
                    )}
                </span>
            </div>


            ${messageHTML}

        `;

    } catch (error) {

        console.error(
            "Booking details error:",
            error
        );


        details.innerHTML = `
            <p>
                Unable to load booking details:
                ${escapeHtml(
                    error.message
                )}
            </p>
        `;

    }

}


function closeBookingDetailsModal() {

    const modal =
        document.getElementById(
            "bookingModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }


    document.body.classList.remove(
        "modal-open"
    );

}


// ==========================================================
// UPDATE BOOKING STATUS
// ==========================================================

async function updateBooking(
    id,
    status
) {

    if (
        !window.confirm(
            `Are you sure you want to mark booking #${id} as ${status}?`
        )
    ) {

        return;

    }


    try {

        const data =
            await adminRequest(
                `${API_BASE}/bookings/${id}/status`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            status
                        })
                }
            );


        alert(
            data.message ||
            `Booking ${status.toLowerCase()} successfully`
        );


        await loadDashboard();

        await loadBookings();


    } catch (error) {

        console.error(
            "Update booking error:",
            error
        );


        alert(
            error.message
        );

    }

}


// ==========================================================
// USER MANAGEMENT
// ==========================================================

const usersTable =
    document.getElementById(
        "usersTable"
    );


async function loadUsers() {

    if (!usersTable) {

        console.error(
            "usersTable not found."
        );

        return;

    }


    usersTable.innerHTML = `
        <tr>
            <td colspan="6">
                Loading users...
            </td>
        </tr>
    `;


    try {

        const data =
            await adminRequest(
                `${API_BASE}/admin/users`
            );


        const users =
            Array.isArray(
                data.users
            )
                ? data.users
                : [];


        usersTable.innerHTML =
            "";


        if (
            users.length ===
            0
        ) {

            usersTable.innerHTML = `
                <tr>
                    <td colspan="6">
                        No users found.
                    </td>
                </tr>
            `;

            return;

        }


        users.forEach(
            user => {

                const row =
                    document.createElement(
                        "tr"
                    );


                const isAdmin =
                    user.role ===
                    "admin";


                row.innerHTML = `

                    <td>
                        #${escapeHtml(
                            user.id
                        )}
                    </td>


                    <td>
                        <strong>
                            ${escapeHtml(
                                user.full_name
                            )}
                        </strong>
                    </td>


                    <td>

                        ${escapeHtml(
                            user.email
                        )}

                        <br>

                        <small>
                            ${escapeHtml(
                                user.phone ||
                                "-"
                            )}
                        </small>

                    </td>


                    <td>

                        <select
                            class="user-role-select"
                            data-user-role="${escapeHtml(
                                user.id
                            )}"
                        >

                            <option
                                value="user"
                                ${
                                    user.role ===
                                    "user"
                                        ? "selected"
                                        : ""
                                }
                            >
                                User
                            </option>


                            <option
                                value="admin"
                                ${
                                    user.role ===
                                    "admin"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Admin
                            </option>

                        </select>

                    </td>


                    <td>
                        ${formatDate(
                            user.created_at
                        )}
                    </td>


                    <td>

                        <button
                            type="button"
                            class="user-delete-btn"
                            data-user-delete="${escapeHtml(
                                user.id
                            )}"
                            ${
                                isAdmin
                                    ? "disabled"
                                    : ""
                            }
                        >
                            ${
                                isAdmin
                                    ? "Admin"
                                    : "Delete"
                            }
                        </button>

                    </td>

                `;


                usersTable.appendChild(
                    row
                );

            }
        );


    } catch (error) {

        console.error(
            "Load users error:",
            error
        );


        usersTable.innerHTML = `
            <tr>
                <td colspan="6">
                    Unable to load users:
                    ${escapeHtml(
                        error.message
                    )}
                </td>
            </tr>
        `;

    }

}


// ==========================================================
// UPDATE USER ROLE
// ==========================================================

async function updateUserRole(
    id,
    role
) {

    try {

        const data =
            await adminRequest(
                `${API_BASE}/admin/users/${id}/role`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            role
                        })
                }
            );


        alert(
            data.message ||
            "User role updated successfully."
        );


        await loadUsers();

        await loadDashboard();


    } catch (error) {

        console.error(
            "Update user role error:",
            error
        );


        alert(
            error.message
        );


        await loadUsers();

    }

}


// ==========================================================
// DELETE USER
// ==========================================================

async function deleteUser(
    id
) {

    try {

        const userData =
            await adminRequest(
                `${API_BASE}/admin/users/${id}`
            );


        const user =
            userData.user;


        if (!user) {

            throw new Error(
                "User was not found."
            );

        }


        if (
            user.role ===
            "admin"
        ) {

            alert(
                "Administrator accounts cannot be deleted."
            );

            return;

        }


        if (
            !window.confirm(
                `Delete user "${user.full_name}"? This cannot be undone.`
            )
        ) {

            return;

        }


        const data =
            await adminRequest(
                `${API_BASE}/admin/users/${id}`,
                {
                    method: "DELETE"
                }
            );


        alert(
            data.message ||
            "User deleted successfully."
        );


        await loadUsers();

        await loadDashboard();


    } catch (error) {

        console.error(
            "Delete user error:",
            error
        );


        alert(
            error.message
        );

    }

}


// ==========================================================
// USER TABLE EVENTS
// ==========================================================

if (usersTable) {

    usersTable.addEventListener(
        "change",
        event => {

            const select =
                event.target.closest(
                    "[data-user-role]"
                );


            if (!select) {
                return;
            }


            const id =
                select.dataset.userRole;


            const role =
                select.value;


            if (
                !window.confirm(
                    `Change this user's role to ${role}?`
                )
            ) {

                loadUsers();

                return;

            }


            updateUserRole(
                id,
                role
            );

        }
    );


    usersTable.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-user-delete]"
                );


            if (
                !button ||
                button.disabled
            ) {

                return;

            }


            deleteUser(
                button.dataset.userDelete
            );

        }
    );

}


// ==========================================================
// PACKAGE MANAGEMENT
// ==========================================================

const packagesGrid =
    document.getElementById(
        "packagesGrid"
    );

const addPackageBtn =
    document.getElementById(
        "addPackageBtn"
    );

const packageModal =
    document.getElementById(
        "packageModal"
    );

const closePackageModal =
    document.getElementById(
        "closePackageModal"
    );

const cancelPackageBtn =
    document.getElementById(
        "cancelPackageBtn"
    );

const packageModalTitle =
    document.getElementById(
        "packageModalTitle"
    );

const packageForm =
    document.getElementById(
        "packageForm"
    );

const packageId =
    document.getElementById(
        "packageId"
    );

const packageTitle =
    document.getElementById(
        "packageTitle"
    );

const packageDestination =
    document.getElementById(
        "packageDestination"
    );

const packageDescription =
    document.getElementById(
        "packageDescription"
    );

const packageDuration =
    document.getElementById(
        "packageDuration"
    );

const packagePersons =
    document.getElementById(
        "packagePersons"
    );

const packagePrice =
    document.getElementById(
        "packagePrice"
    );

const packageTag =
    document.getElementById(
        "packageTag"
    );

const packageImage =
    document.getElementById(
        "packageImage"
    );

const packageFormMessage =
    document.getElementById(
        "packageFormMessage"
    );

const savePackageBtn =
    document.getElementById(
        "savePackageBtn"
    );


async function loadPackages() {

    if (!packagesGrid) {
        return;
    }


    packagesGrid.innerHTML = `
        <div class="package-loading">
            Loading packages...
        </div>
    `;


    try {

        const response =
            await fetch(
                `${API_BASE}/packages`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load packages"
            );

        }


        packagesGrid.innerHTML =
            "";


        if (
            !Array.isArray(
                data.packages
            ) ||
            data.packages.length ===
            0
        ) {

            packagesGrid.innerHTML = `
                <div class="package-empty">
                    No packages found.
                </div>
            `;

            return;

        }


        data.packages.forEach(
            packageItem => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "package-card";


                let imageHTML = `
                    <div class="package-image-placeholder">
                        🧳
                    </div>
                `;


                if (
                    packageItem.image
                ) {

                    imageHTML = `

                        <img
                            class="package-card-image"
                            src="../images/destinations/${encodeURIComponent(
                                packageItem.image
                            )}"
                            alt="${escapeHtml(
                                packageItem.title
                            )}"
                            onerror="
                                this.style.display='none';
                                this.nextElementSibling.style.display='flex';
                            "
                        >

                        <div
                            class="package-image-placeholder"
                            style="display:none;"
                        >
                            🧳
                        </div>

                    `;

                }


                card.innerHTML = `

                    ${imageHTML}


                    <div class="package-card-body">

                        <div
                            class="package-card-title-row"
                        >

                            <h3>
                                ${escapeHtml(
                                    packageItem.title
                                )}
                            </h3>


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


                        <div
                            class="package-destination"
                        >

                            📍
                            ${escapeHtml(
                                packageItem.destination
                            )}

                        </div>


                        <div
                            class="package-description"
                        >

                            ${escapeHtml(
                                packageItem.description
                            )}

                        </div>


                        <div
                            class="package-meta"
                        >

                            <span>
                                🕐
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


                        <div
                            class="package-price"
                        >

                            ${formatCurrency(
                                packageItem.price
                            )}

                            <small>
                                / package
                            </small>

                        </div>


                        <div
                            class="package-actions"
                        >

                            <button
                                type="button"
                                class="package-edit-btn"
                                data-package-edit="${escapeHtml(
                                    packageItem.id
                                )}"
                            >
                                ✏️ Edit
                            </button>


                            <button
                                type="button"
                                class="package-delete-btn"
                                data-package-delete="${escapeHtml(
                                    packageItem.id
                                )}"
                            >
                                🗑️ Delete
                            </button>

                        </div>

                    </div>

                `;


                packagesGrid.appendChild(
                    card
                );

            }
        );


    } catch (error) {

        console.error(
            "Load packages error:",
            error
        );


        packagesGrid.innerHTML = `
            <div class="package-empty">
                Unable to load packages:
                ${escapeHtml(
                    error.message
                )}
            </div>
        `;

    }

}


async function editPackage(
    id
) {

    try {

        const data =
            await adminRequest(
                `${API_BASE}/packages/${id}`
            );


        const item =
            data.package;


        if (!item) {

            throw new Error(
                "Package data was not returned."
            );

        }


        packageId.value =
            item.id ?? "";

        packageTitle.value =
            item.title ?? "";

        packageDestination.value =
            item.destination ?? "";

        packageDescription.value =
            item.description ?? "";

        packageDuration.value =
            item.duration ?? "";

        packagePersons.value =
            item.persons ?? 2;

        packagePrice.value =
            item.price ?? "";

        packageTag.value =
            item.tag ?? "";

        packageImage.value =
            item.image ?? "";


        packageModalTitle.textContent =
            "Edit Package";

        packageFormMessage.textContent =
            "";

        packageFormMessage.className =
            "package-form-message";

        savePackageBtn.textContent =
            "Update Package";


        packageModal.classList.add(
            "show"
        );

        document.body.classList.add(
            "modal-open"
        );


    } catch (error) {

        console.error(
            "Edit package error:",
            error
        );


        alert(
            error.message
        );

    }

}


function openAddPackageModal() {

    if (!packageModal) {
        return;
    }


    packageForm.reset();

    packageId.value = "";

    packagePersons.value =
        2;

    packageModalTitle.textContent =
        "Add New Package";

    packageFormMessage.textContent =
        "";

    packageFormMessage.className =
        "package-form-message";

    savePackageBtn.textContent =
        "Save Package";


    packageModal.classList.add(
        "show"
    );

    document.body.classList.add(
        "modal-open"
    );

}


function closePackageForm() {

    if (packageModal) {

        packageModal.classList.remove(
            "show"
        );

    }


    document.body.classList.remove(
        "modal-open"
    );

}


async function deletePackage(
    id
) {

    try {

        const packageResponse =
            await fetch(
                `${API_BASE}/packages/${id}`
            );


        const packageData =
            await packageResponse.json();


        if (!packageResponse.ok) {

            throw new Error(
                packageData.message ||
                "Unable to find package"
            );

        }


        const title =
            packageData.package?.title ||
            `Package #${id}`;


        if (
            !window.confirm(
                `Are you sure you want to delete "${title}"?`
            )
        ) {

            return;

        }


        const data =
            await adminRequest(
                `${API_BASE}/packages/${id}`,
                {
                    method: "DELETE"
                }
            );


        alert(
            data.message ||
            "Package deleted successfully"
        );


        await loadPackages();

        await loadDashboard();


    } catch (error) {

        console.error(
            "Delete package error:",
            error
        );


        alert(
            error.message
        );

    }

}


if (packagesGrid) {

    packagesGrid.addEventListener(
        "click",
        event => {

            const editButton =
                event.target.closest(
                    "[data-package-edit]"
                );


            const deleteButton =
                event.target.closest(
                    "[data-package-delete]"
                );


            if (editButton) {

                editPackage(
                    editButton.dataset.packageEdit
                );

                return;

            }


            if (deleteButton) {

                deletePackage(
                    deleteButton.dataset.packageDelete
                );

            }

        }
    );

}


if (addPackageBtn) {

    addPackageBtn.addEventListener(
        "click",
        openAddPackageModal
    );

}


if (closePackageModal) {

    closePackageModal.addEventListener(
        "click",
        closePackageForm
    );

}


if (cancelPackageBtn) {

    cancelPackageBtn.addEventListener(
        "click",
        closePackageForm
    );

}


if (packageModal) {

    packageModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                packageModal
            ) {

                closePackageForm();

            }

        }
    );

}


if (packageForm) {

    packageForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const id =
                packageId.value.trim();


            const packageData = {

                title:
                    packageTitle.value.trim(),

                destination:
                    packageDestination.value.trim(),

                description:
                    packageDescription.value.trim(),

                duration:
                    packageDuration.value.trim(),

                persons:
                    Number(
                        packagePersons.value
                    ),

                price:
                    Number(
                        packagePrice.value
                    ),

                image:
                    packageImage.value.trim(),

                tag:
                    packageTag.value.trim()

            };


            if (
                !packageData.title ||
                !packageData.destination ||
                !packageData.description ||
                !packageData.duration ||
                !packageData.persons ||
                !packageData.price
            ) {

                packageFormMessage.textContent =
                    "Please fill all required fields.";

                packageFormMessage.className =
                    "package-form-message error";

                return;

            }


            savePackageBtn.disabled =
                true;


            packageFormMessage.textContent =
                "Saving package...";

            packageFormMessage.className =
                "package-form-message";


            try {

                const data =
                    await adminRequest(
                        id
                            ? `${API_BASE}/packages/${id}`
                            : `${API_BASE}/packages`,
                        {
                            method:
                                id
                                    ? "PUT"
                                    : "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    packageData
                                )
                        }
                    );


                packageFormMessage.textContent =
                    data.message ||
                    "Package saved successfully.";

                packageFormMessage.className =
                    "package-form-message success";


                await loadPackages();

                await loadDashboard();


                setTimeout(
                    closePackageForm,
                    600
                );


            } catch (error) {

                console.error(
                    "Save package error:",
                    error
                );


                packageFormMessage.textContent =
                    error.message;

                packageFormMessage.className =
                    "package-form-message error";

            } finally {

                savePackageBtn.disabled =
                    false;

            }

        }
    );

}


// ==========================================================
// BOOKING MODAL EVENTS
// ==========================================================

const bookingModal =
    document.getElementById(
        "bookingModal"
    );


const closeBookingModal =
    document.getElementById(
        "closeBookingModal"
    );


if (closeBookingModal) {

    closeBookingModal.addEventListener(
        "click",
        closeBookingDetailsModal
    );

}


if (bookingModal) {

    bookingModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                bookingModal
            ) {

                closeBookingDetailsModal();

            }

        }
    );

}


// ==========================================================
// SIDEBAR / SECTION NAVIGATION
// ==========================================================

document.querySelectorAll(
    ".admin-nav a[data-section]"
).forEach(
    link => {

        link.addEventListener(
            "click",
            () => {

                const section =
                    link.dataset.section;


                if (
                    section ===
                    "users"
                ) {

                    loadUsers();

                }


                if (
                    section ===
                    "packages"
                ) {

                    loadPackages();

                }


                if (
                    section ===
                    "bookings"
                ) {

                    loadBookings();

                }


                if (
                    section ===
                    "dashboard"
                ) {

                    loadDashboard();

                    loadBookings();

                }

            }
        );

    }
);


// ==========================================================
// LOGOUT
// ==========================================================

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


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
// ESCAPE KEY
// ==========================================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !==
            "Escape"
        ) {

            return;

        }


        closeBookingDetailsModal();

        closePackageForm();

    }
);


// ==========================================================
// EXPOSE FUNCTIONS
// ==========================================================

window.loadDashboard =
    loadDashboard;

window.loadBookings =
    loadBookings;

window.loadPackages =
    loadPackages;

window.loadUsers =
    loadUsers;

window.viewBooking =
    viewBooking;

window.updateBooking =
    updateBooking;

window.openAddPackageModal =
    openAddPackageModal;

window.editPackage =
    editPackage;

window.deletePackage =
    deletePackage;

window.closePackageForm =
    closePackageForm;

window.updateUserRole =
    updateUserRole;

window.deleteUser =
    deleteUser;


// ==========================================================
// STARTUP
// ==========================================================

console.log(
    "🚀 Anand Travel Tours Admin JS loaded"
);


loadDashboard();

loadBookings();

loadPackages();