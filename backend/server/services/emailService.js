const nodemailer = require("nodemailer");
require("dotenv").config();

// ==========================================================
// EMAIL TRANSPORTER CONFIGURATION
// ==========================================================

let transporter = null;
const senderEmail = process.env.MAIL_FROM || process.env.EMAIL_USER || process.env.SMTP_USER || "anandtraveltours@gmail.com";

if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    try {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === "true" || Number(process.env.SMTP_PORT) === 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
    } catch (e) {
        console.warn("⚠️ Failed to initialize SMTP transporter:", e.message);
    }
} else if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    try {
        transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    } catch (e) {
        console.warn("⚠️ Failed to initialize Gmail transporter:", e.message);
    }
}

// ==========================================================
// VERIFY EMAIL CONFIGURATION
// ==========================================================

const verifyEmailTransporter = async () => {
    if (!transporter) {
        console.log("ℹ️ Email service is not configured (optional). Transactional emails will be skipped.");
        return;
    }

    try {
        await transporter.verify();
        console.log("✅ Email service is ready");
    } catch (error) {
        console.warn("⚠️ Email service configuration warning:", error.message);
    }
};

// ==========================================================
// SEND BOOKING CREATED EMAIL
// ==========================================================

const sendBookingCreatedEmail = async (booking) => {
    if (!transporter) {
        return { success: false, message: "Email service not configured" };
    }

    try {
        const mailOptions = {
            from: `"Anand Travel Tours" <${senderEmail}>`,
            to: booking.email,
            subject: `Booking Received - #${booking.id}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; padding: 20px; color: #222;">
                    <h2 style="color:#071d35;">Anand Travel Tours</h2>
                    <h3>Booking Received</h3>
                    <p>Hello <strong>${booking.full_name}</strong>,</p>
                    <p>We have successfully received your tour booking.</p>
                    <hr>
                    <p><strong>Booking ID:</strong> #${booking.id}</p>
                    <p><strong>Package:</strong> ${booking.package_title || "Tour Package"}</p>
                    <p><strong>Destination:</strong> ${booking.destination || "As selected"}</p>
                    <p><strong>Travel Date:</strong> ${booking.travel_date}</p>
                    <p><strong>Travelers:</strong> ${booking.persons}</p>
                    <p><strong>Status:</strong> Pending</p>
                    <hr>
                    <p>Our team will review your booking and confirm it shortly.</p>
                    <p>Thank you for choosing <strong>Anand Travel Tours</strong>.</p>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.warn("Failed to send booking created email:", error.message);
        return { success: false, error: error.message };
    }
};

// ==========================================================
// SEND BOOKING STATUS EMAIL
// ==========================================================

const sendBookingStatusEmail = async (booking) => {
    if (!transporter) {
        return { success: false, message: "Email service not configured" };
    }

    try {
        let subject = `Booking Update - #${booking.id}`;
        let heading = "Booking Status Updated";
        let message = "Your booking status has been updated.";

        if (booking.status === "Confirmed") {
            subject = `Booking Confirmed - #${booking.id}`;
            heading = "Your Booking is Confirmed";
            message = "Great news! Your tour booking has been confirmed.";
        }

        if (booking.status === "Cancelled") {
            subject = `Booking Cancelled - #${booking.id}`;
            heading = "Your Booking has been Cancelled";
            message = "Your tour booking has been cancelled.";
        }

        const mailOptions = {
            from: `"Anand Travel Tours" <${senderEmail}>`,
            to: booking.email,
            subject: subject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; padding: 20px; color: #222;">
                    <h2 style="color:#071d35;">Anand Travel Tours</h2>
                    <h3>${heading}</h3>
                    <p>Hello <strong>${booking.full_name}</strong>,</p>
                    <p>${message}</p>
                    <hr>
                    <p><strong>Booking ID:</strong> #${booking.id}</p>
                    <p><strong>Package:</strong> ${booking.package_title || "Tour Package"}</p>
                    <p><strong>Destination:</strong> ${booking.destination || "As selected"}</p>
                    <p><strong>Travel Date:</strong> ${booking.travel_date}</p>
                    <p><strong>Status:</strong> ${booking.status}</p>
                    <hr>
                    <p>Thank you for choosing <strong>Anand Travel Tours</strong>.</p>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.warn("Failed to send booking status email:", error.message);
        return { success: false, error: error.message };
    }
};

// ==========================================================
// SEND PASSWORD RESET EMAIL
// ==========================================================

const sendPasswordResetEmail = async ({ email, full_name, reset_link }) => {
    if (!transporter) {
        return { success: false, message: "Email service not configured" };
    }

    try {
        const mailOptions = {
            from: `"Anand Travel Tours" <${senderEmail}>`,
            to: email,
            subject: "Password Reset Request - Anand Travel Tours",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; padding: 25px; color: #222; border: 1px solid #eee; border-radius: 8px;">
                    <h2 style="color:#071d35; margin-top: 0;">Anand Travel Tours</h2>
                    <h3 style="color:#333;">Password Reset Request</h3>
                    <p>Hello <strong>${full_name || "Traveler"}</strong>,</p>
                    <p>We received a request to reset your password for your Anand Travel Tours account.</p>
                    <p style="margin: 25px 0;">
                        <a href="${reset_link}" style="background-color: #0b5277; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset My Password</a>
                    </p>
                    <p style="color: #666; font-size: 14px;">This link is valid for <strong>1 hour</strong>. If you did not request this password reset, please ignore this email; your password will remain unchanged.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px;">If the button above does not work, copy and paste this URL into your browser:<br><a href="${reset_link}" style="color: #0b5277;">${reset_link}</a></p>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.warn("Failed to send password reset email:", error.message);
        return { success: false, error: error.message };
    }
};

// ==========================================================
// EXPORT
// ==========================================================

module.exports = {
    verifyEmailTransporter,
    sendBookingCreatedEmail,
    sendBookingStatusEmail,
    sendPasswordResetEmail
};