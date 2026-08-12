const nodemailer = require("nodemailer");


// ==========================================================
// EMAIL TRANSPORTER
// ==========================================================

const transporter = nodemailer.createTransport({

    service: "gmail",

    auth: {

        user:
            process.env.EMAIL_USER,

        pass:
            process.env.EMAIL_PASSWORD

    }

});


// ==========================================================
// VERIFY EMAIL CONFIGURATION
// ==========================================================

const verifyEmailTransporter = async () => {

    try {

        await transporter.verify();

        console.log(
            "✅ Email service is ready"
        );

    } catch (error) {

        console.error(
            "❌ Email service configuration error:",
            error.message
        );

    }

};


// ==========================================================
// SEND BOOKING CREATED EMAIL
// ==========================================================

const sendBookingCreatedEmail = async (
    booking
) => {

    const mailOptions = {

        from:
            `"Anand Travel Tours" <${process.env.EMAIL_USER}>`,

        to:
            booking.email,

        subject:
            `Booking Received - #${booking.id}`,

        html: `

            <div style="
                font-family: Arial, sans-serif;
                max-width: 650px;
                margin: auto;
                padding: 20px;
                color: #222;
            ">

                <h2 style="color:#071d35;">
                    Anand Travel Tours
                </h2>


                <h3>
                    Booking Received
                </h3>


                <p>
                    Hello
                    <strong>
                        ${booking.full_name}
                    </strong>,
                </p>


                <p>
                    We have successfully received
                    your tour booking.
                </p>


                <hr>


                <p>
                    <strong>Booking ID:</strong>
                    #${booking.id}
                </p>


                <p>
                    <strong>Package:</strong>
                    ${booking.package_title}
                </p>


                <p>
                    <strong>Destination:</strong>
                    ${booking.destination}
                </p>


                <p>
                    <strong>Travel Date:</strong>
                    ${booking.travel_date}
                </p>


                <p>
                    <strong>Travelers:</strong>
                    ${booking.persons}
                </p>


                <p>
                    <strong>Status:</strong>
                    Pending
                </p>


                <hr>


                <p>
                    Our team will review your booking
                    and confirm it shortly.
                </p>


                <p>
                    Thank you for choosing
                    <strong>
                        Anand Travel Tours
                    </strong>.
                </p>

            </div>

        `

    };


    return transporter.sendMail(
        mailOptions
    );

};


// ==========================================================
// SEND BOOKING STATUS EMAIL
// ==========================================================

const sendBookingStatusEmail = async (
    booking
) => {

    let subject =
        `Booking Update - #${booking.id}`;

    let heading =
        "Booking Status Updated";

    let message =
        "Your booking status has been updated.";


    if (
        booking.status ===
        "Confirmed"
    ) {

        subject =
            `Booking Confirmed - #${booking.id}`;

        heading =
            "Your Booking is Confirmed";

        message =
            "Great news! Your tour booking has been confirmed.";

    }


    if (
        booking.status ===
        "Cancelled"
    ) {

        subject =
            `Booking Cancelled - #${booking.id}`;

        heading =
            "Your Booking has been Cancelled";

        message =
            "Your tour booking has been cancelled.";

    }


    const mailOptions = {

        from:
            `"Anand Travel Tours" <${process.env.EMAIL_USER}>`,

        to:
            booking.email,

        subject:
            subject,

        html: `

            <div style="
                font-family: Arial, sans-serif;
                max-width: 650px;
                margin: auto;
                padding: 20px;
                color: #222;
            ">

                <h2 style="color:#071d35;">
                    Anand Travel Tours
                </h2>


                <h3>
                    ${heading}
                </h3>


                <p>
                    Hello
                    <strong>
                        ${booking.full_name}
                    </strong>,
                </p>


                <p>
                    ${message}
                </p>


                <hr>


                <p>
                    <strong>Booking ID:</strong>
                    #${booking.id}
                </p>


                <p>
                    <strong>Package:</strong>
                    ${booking.package_title}
                </p>


                <p>
                    <strong>Destination:</strong>
                    ${booking.destination}
                </p>


                <p>
                    <strong>Travel Date:</strong>
                    ${booking.travel_date}
                </p>


                <p>
                    <strong>Status:</strong>
                    ${booking.status}
                </p>


                <hr>


                <p>
                    Thank you for choosing
                    <strong>
                        Anand Travel Tours
                    </strong>.
                </p>

            </div>

        `

    };


    return transporter.sendMail(
        mailOptions
    );

};


// ==========================================================
// EXPORT
// ==========================================================

module.exports = {

    verifyEmailTransporter,

    sendBookingCreatedEmail,

    sendBookingStatusEmail

};