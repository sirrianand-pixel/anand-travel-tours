const http = require("http");
const fs = require("fs");
const path = require("path");
const app = require("./server");
const db = require("./config/db");

async function makeRequest(port, options, postData = null, token = null) {
    return new Promise((resolve) => {
        const headers = { ...(options.headers || {}) };
        if (postData && !headers["Content-Type"]) {
            headers["Content-Type"] = "application/json";
        }
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const reqOptions = {
            hostname: "127.0.0.1",
            port: port,
            path: options.path,
            method: options.method || "GET",
            headers: headers
        };

        const req = http.request(reqOptions, (res) => {
            let data = "";
            res.on("data", (chunk) => { data += chunk; });
            res.on("end", () => {
                let parsed = null;
                try { parsed = JSON.parse(data); } catch (e) { parsed = data; }
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: parsed
                });
            });
        });

        req.on("error", (err) => {
            resolve({ statusCode: 0, error: err.message });
        });

        if (postData) {
            req.write(typeof postData === "string" ? postData : JSON.stringify(postData));
        }
        req.end();
    });
}

async function runTests() {
    console.log("==================================================");
    console.log("       ANAND TRAVEL TOURS - API TEST SUITE        ");
    console.log("==================================================\n");

    const TEST_PORT = 5055;
    const serverInstance = await new Promise((resolve, reject) => {
        const s = app.listen(TEST_PORT, "127.0.0.1", () => resolve(s));
        s.on("error", reject);
    });

    const timestamp = Date.now();
    const userA_Email = `usera_${timestamp}@example.com`;
    const userB_Email = `userb_${timestamp}@example.com`;
    const admin_Email = `admin_${timestamp}@example.com`;
    const testPassword = "Password@123";
    const newPassword = "NewPassword@456";

    let userA_Token = null;
    let userA_Id = null;
    let userB_Token = null;
    let admin_Token = null;
    let createdBookingId = null;

    const tests = [
        {
            name: "1. Static Frontend Index (GET /)",
            fn: async () => {
                const res = await makeRequest(TEST_PORT, { path: "/", method: "GET" });
                return {
                    pass: res.statusCode === 200 && typeof res.body === "string" && res.body.includes("Anand Travel Tours"),
                    details: `Status ${res.statusCode}`
                };
            }
        },
        {
            name: "2. Admin HTML Page (GET /pages/admin.html)",
            fn: async () => {
                const res = await makeRequest(TEST_PORT, { path: "/pages/admin.html", method: "GET" });
                const hasNoBackticks = typeof res.body === "string" && !res.body.includes("```");
                return {
                    pass: res.statusCode === 200 && hasNoBackticks,
                    details: `Status ${res.statusCode}, Clean HTML: ${hasNoBackticks}`
                };
            }
        },
        {
            name: "3. Health Check Endpoint (GET /api/health)",
            fn: async () => {
                const res = await makeRequest(TEST_PORT, { path: "/api/health", method: "GET" });
                return {
                    pass: (res.statusCode === 200 || res.statusCode === 503) && res.body?.service === "Anand Travel Tours API",
                    details: `Status ${res.statusCode}, Service: ${res.body?.service}, DB: ${res.body?.database}`
                };
            }
        },
        {
            name: "4. Unknown API Route 404 (GET /api/unknown-endpoint)",
            fn: async () => {
                const res = await makeRequest(TEST_PORT, { path: "/api/unknown-endpoint", method: "GET" });
                return {
                    pass: res.statusCode === 404 && res.body?.success === false,
                    details: `Status ${res.statusCode}, Message: ${res.body?.message}`
                };
            }
        },
        {
            name: "5. Register Validation - Empty Body (POST /api/auth/register)",
            fn: async () => {
                const res = await makeRequest(TEST_PORT, {
                    path: "/api/auth/register",
                    method: "POST"
                }, {});
                return {
                    pass: res.statusCode === 400 && res.body?.success === false,
                    details: `Status ${res.statusCode}, Message: ${res.body?.message}`
                };
            }
        },
        {
            name: "6. Register Validation - Short Password (POST /api/auth/register)",
            fn: async () => {
                const res = await makeRequest(TEST_PORT, {
                    path: "/api/auth/register",
                    method: "POST"
                }, {
                    full_name: "Test User",
                    email: "test_short@example.com",
                    phone: "9876543210",
                    password: "123"
                });
                return {
                    pass: res.statusCode === 400 && res.body?.message?.includes("at least 6 characters"),
                    details: `Status ${res.statusCode}, Message: ${res.body?.message}`
                };
            }
        },
        {
            name: "7. User A Registration & Duplicate Email Protection",
            fn: async () => {
                const res1 = await makeRequest(TEST_PORT, { path: "/api/auth/register", method: "POST" }, {
                    full_name: "Test User A",
                    email: userA_Email,
                    phone: "9876543210",
                    password: testPassword
                });
                const res2 = await makeRequest(TEST_PORT, { path: "/api/auth/register", method: "POST" }, {
                    full_name: "Test User A Duplicate",
                    email: userA_Email,
                    phone: "9876543210",
                    password: testPassword
                });
                return {
                    pass: res1.statusCode === 201 && res2.statusCode === 409,
                    details: `Initial: ${res1.statusCode}, Duplicate: ${res2.statusCode}`
                };
            }
        },
        {
            name: "8. User A Login & JWT Generation",
            fn: async () => {
                const res = await makeRequest(TEST_PORT, { path: "/api/auth/login", method: "POST" }, {
                    email: userA_Email,
                    password: testPassword
                });
                if (res.statusCode === 200 && res.body.token) {
                    userA_Token = res.body.token;
                    userA_Id = res.body.user.id;
                }
                return {
                    pass: res.statusCode === 200 && Boolean(res.body.token),
                    details: `Status ${res.statusCode}, Role: ${res.body.user?.role}`
                };
            }
        },
        {
            name: "9. User B Registration & Login",
            fn: async () => {
                await makeRequest(TEST_PORT, { path: "/api/auth/register", method: "POST" }, {
                    full_name: "Test User B",
                    email: userB_Email,
                    phone: "9123456780",
                    password: testPassword
                });
                const res = await makeRequest(TEST_PORT, { path: "/api/auth/login", method: "POST" }, {
                    email: userB_Email,
                    password: testPassword
                });
                if (res.statusCode === 200 && res.body.token) {
                    userB_Token = res.body.token;
                }
                return {
                    pass: res.statusCode === 200 && Boolean(res.body.token),
                    details: `Status ${res.statusCode}`
                };
            }
        },
        {
            name: "10. User Profile Endpoint (GET /api/users/me)",
            fn: async () => {
                const res = await makeRequest(TEST_PORT, { path: "/api/users/me" }, null, userA_Token);
                return {
                    pass: res.statusCode === 200 && res.body.user?.email === userA_Email,
                    details: `Status ${res.statusCode}, User: ${res.body.user?.email}`
                };
            }
        },
        {
            name: "11. Packages Listing (GET /api/packages)",
            fn: async () => {
                const res = await makeRequest(TEST_PORT, { path: "/api/packages" });
                const list = res.body.packages || (Array.isArray(res.body) ? res.body : []);
                return {
                    pass: res.statusCode === 200 && list.length > 0,
                    details: `Status ${res.statusCode}, Packages Count: ${list.length}`
                };
            }
        },
        {
            name: "12. Package Details (GET /api/packages/:id)",
            fn: async () => {
                const res = await makeRequest(TEST_PORT, { path: "/api/packages/1" });
                const pkg = res.body.package || res.body;
                return {
                    pass: res.statusCode === 200 && Boolean(pkg.title),
                    details: `Status ${res.statusCode}, Title: ${pkg.title}`
                };
            }
        },
        {
            name: "13. Booking Creation for User A (POST /api/bookings)",
            fn: async () => {
                const res = await makeRequest(TEST_PORT, { path: "/api/bookings", method: "POST" }, {
                    package_id: 1,
                    full_name: "Test User A",
                    email: userA_Email,
                    phone: "9876543210",
                    travel_date: "2026-11-20",
                    persons: 2,
                    message: "E2E automated test booking"
                }, userA_Token);
                if (res.statusCode === 201 && res.body.booking_id) {
                    createdBookingId = res.body.booking_id;
                }
                return {
                    pass: res.statusCode === 201 && Boolean(res.body.booking_id),
                    details: `Status ${res.statusCode}, Booking ID: ${createdBookingId}`
                };
            }
        },
        {
            name: "14. IDOR Protection (User B cannot access User A's booking)",
            fn: async () => {
                const res = await makeRequest(TEST_PORT, { path: `/api/bookings/${createdBookingId}` }, null, userB_Token);
                return {
                    pass: res.statusCode === 403 && res.body.success === false,
                    details: `Status ${res.statusCode}, Message: ${res.body.message}`
                };
            }
        },
        {
            name: "15. Owner Access (User A can access own booking)",
            fn: async () => {
                const res = await makeRequest(TEST_PORT, { path: `/api/bookings/${createdBookingId}` }, null, userA_Token);
                return {
                    pass: res.statusCode === 200 && res.body.booking?.id === createdBookingId,
                    details: `Status ${res.statusCode}, Booking ID: ${res.body.booking?.id}`
                };
            }
        },
        {
            name: "16. Admin Authorization Check (User vs Admin)",
            fn: async () => {
                // User A trying to access admin stats -> 403
                const userRes = await makeRequest(TEST_PORT, { path: "/api/admin/stats" }, null, userA_Token);
                
                // Admin token
                const jwt = require("jsonwebtoken");
                admin_Token = jwt.sign(
                    { id: 1, email: "admin@test.com", role: "admin" },
                    process.env.JWT_SECRET || "your_super_secret_random_jwt_key_min_32_chars"
                );
                const adminRes = await makeRequest(TEST_PORT, { path: "/api/admin/stats" }, null, admin_Token);

                return {
                    pass: userRes.statusCode === 403 && adminRes.statusCode === 200,
                    details: `User Access: ${userRes.statusCode}, Admin Access: ${adminRes.statusCode}`
                };
            }
        },
        {
            name: "17. Static Forgot Password Page (GET /pages/forgot-password.html)",
            fn: async () => {
                const res = await makeRequest(TEST_PORT, { path: "/pages/forgot-password.html" });
                return {
                    pass: res.statusCode === 200 && typeof res.body === "string" && res.body.includes("Forgot Password"),
                    details: `Status ${res.statusCode}`
                };
            }
        },
        {
            name: "18. Static Reset Password Page (GET /pages/reset-password.html)",
            fn: async () => {
                const res = await makeRequest(TEST_PORT, { path: "/pages/reset-password.html" });
                return {
                    pass: res.statusCode === 200 && typeof res.body === "string" && res.body.includes("Reset Password"),
                    details: `Status ${res.statusCode}`
                };
            }
        },
        {
            name: "19. Forgot Password API (POST /api/auth/forgot-password)",
            fn: async () => {
                const res = await makeRequest(TEST_PORT, { path: "/api/auth/forgot-password", method: "POST" }, {
                    email: userA_Email
                });
                return {
                    pass: res.statusCode === 200 && res.body.success === true,
                    details: `Status ${res.statusCode}, Message: ${res.body.message}`
                };
            }
        },
        {
            name: "20. Reset Password API with Valid Token (POST /api/auth/reset-password)",
            fn: async () => {
                const jwt = require("jsonwebtoken");
                const userRow = await new Promise((resolve) => {
                    db.query("SELECT password FROM users WHERE email = ?", [userA_Email], (err, rows) => resolve(rows ? rows[0] : null));
                });
                if (!userRow) return { pass: false, details: "User not found in DB" };

                const jwtSecret = process.env.JWT_SECRET || "your_super_secret_random_jwt_key_min_32_chars";
                const resetSecret = `${jwtSecret}_${userRow.password}`;
                const resetToken = jwt.sign(
                    { id: userA_Id, email: userA_Email, purpose: "password_reset" },
                    resetSecret,
                    { expiresIn: "1h" }
                );

                const res = await makeRequest(TEST_PORT, { path: "/api/auth/reset-password", method: "POST" }, {
                    token: resetToken,
                    new_password: newPassword
                });
                return {
                    pass: res.statusCode === 200 && res.body.success === true,
                    details: `Status ${res.statusCode}, Message: ${res.body.message}`
                };
            }
        },
        {
            name: "21. Login with Reset Password Verification",
            fn: async () => {
                const res = await makeRequest(TEST_PORT, { path: "/api/auth/login", method: "POST" }, {
                    email: userA_Email,
                    password: newPassword
                });
                return {
                    pass: res.statusCode === 200 && Boolean(res.body.token),
                    details: `Status ${res.statusCode}, User: ${res.body.user?.email}`
                };
            }
        },
        {
            name: "22. Destination Images Asset Verification on Disk",
            fn: async () => {
                const rows = await new Promise((resolve) => {
                    db.query("SELECT image FROM packages WHERE image IS NOT NULL", (err, r) => resolve(r || []));
                });
                const imagesDir = path.join(__dirname, "../../images/destinations");
                const missing = [];
                for (const row of rows) {
                    if (row.image && !fs.existsSync(path.join(imagesDir, row.image))) {
                        missing.push(row.image);
                    }
                }
                return {
                    pass: missing.length === 0,
                    details: missing.length === 0 ? `All ${rows.length} package images verified` : `Missing: ${missing.join(", ")}`
                };
            }
        }
    ];

    let passedCount = 0;
    for (const test of tests) {
        try {
            const result = await test.fn();
            if (result.pass) {
                console.log(`✅ PASS: ${test.name}`);
                console.log(`   └─ Details: ${result.details}`);
                passedCount++;
            } else {
                console.log(`❌ FAIL: ${test.name}`);
                console.log(`   └─ Details: ${result.details}`);
            }
        } catch (err) {
            console.log(`❌ ERROR: ${test.name} - ${err.message}`);
        }
    }

    // Clean up test data
    await new Promise((resolve) => {
        db.query("DELETE FROM bookings WHERE email IN (?, ?)", [userA_Email, userB_Email], () => {
            db.query("DELETE FROM users WHERE email IN (?, ?)", [userA_Email, userB_Email], resolve);
        });
    });

    console.log("\n==================================================");
    console.log(`Test Summary: ${passedCount}/${tests.length} tests passed`);
    console.log("==================================================");

    serverInstance.close(() => {
        process.exit(passedCount === tests.length ? 0 : 1);
    });
}

runTests().catch((e) => {
    console.error("Test runner encountered fatal error:", e);
    process.exit(1);
});
