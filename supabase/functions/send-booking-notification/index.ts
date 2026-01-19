import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingNotificationRequest {
  guest_name: string;
  guest_email: string;
  reference_number: string;
  booking_status: string;
  payment_status: string;
  check_in_date: string;
  check_out_date: string;
  room_name?: string;
  total_amount: number;
}

function getStatusMessage(bookingStatus: string, paymentStatus: string): { subject: string; heading: string; message: string } {
  if (bookingStatus === 'confirmed' && paymentStatus === 'confirmed') {
    return {
      subject: 'Booking Confirmed! 🎉',
      heading: 'Your Booking is Confirmed!',
      message: 'Great news! Your payment has been received and your booking is now confirmed. We look forward to welcoming you!'
    };
  }
  
  if (bookingStatus === 'confirmed') {
    return {
      subject: 'Booking Status Update',
      heading: 'Your Booking Has Been Confirmed',
      message: 'Your booking has been confirmed. Please ensure payment is completed to secure your reservation.'
    };
  }
  
  if (paymentStatus === 'confirmed') {
    return {
      subject: 'Payment Received ✓',
      heading: 'Payment Confirmed',
      message: 'We have received your payment. Thank you! Your booking is being processed.'
    };
  }
  
  if (bookingStatus === 'cancelled') {
    return {
      subject: 'Booking Cancelled',
      heading: 'Your Booking Has Been Cancelled',
      message: 'Your booking has been cancelled. If you did not request this cancellation, please contact us immediately.'
    };
  }
  
  if (bookingStatus === 'completed') {
    return {
      subject: 'Thank You for Staying With Us!',
      heading: 'Your Stay is Complete',
      message: 'We hope you enjoyed your stay! Thank you for choosing us. We hope to see you again soon.'
    };
  }
  
  return {
    subject: 'Booking Status Update',
    heading: 'Booking Update',
    message: 'There has been an update to your booking status.'
  };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0
  }).format(amount);
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      guest_name,
      guest_email,
      reference_number,
      booking_status,
      payment_status,
      check_in_date,
      check_out_date,
      room_name,
      total_amount
    }: BookingNotificationRequest = await req.json();

    const { subject, heading, message } = getStatusMessage(booking_status, payment_status);

    const emailResponse = await resend.emails.send({
      from: "Hotel Booking <onboarding@resend.dev>",
      to: [guest_email],
      subject: `${subject} - Ref: ${reference_number}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #B8860B 0%, #DAA520 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">${heading}</h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Dear ${guest_name},
              </p>
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                ${message}
              </p>
              
              <!-- Booking Details Card -->
              <div style="background-color: #FFFAF0; border: 1px solid #DAA520; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
                <h2 style="color: #B8860B; font-size: 18px; margin: 0 0 20px; border-bottom: 1px solid #DAA520; padding-bottom: 10px;">
                  Booking Details
                </h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="color: #666; padding: 8px 0; font-size: 14px;">Reference Number:</td>
                    <td style="color: #333; padding: 8px 0; font-size: 14px; font-weight: 600; text-align: right;">${reference_number}</td>
                  </tr>
                  ${room_name ? `
                  <tr>
                    <td style="color: #666; padding: 8px 0; font-size: 14px;">Room:</td>
                    <td style="color: #333; padding: 8px 0; font-size: 14px; font-weight: 600; text-align: right;">${room_name}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="color: #666; padding: 8px 0; font-size: 14px;">Check-in:</td>
                    <td style="color: #333; padding: 8px 0; font-size: 14px; font-weight: 600; text-align: right;">${formatDate(check_in_date)}</td>
                  </tr>
                  <tr>
                    <td style="color: #666; padding: 8px 0; font-size: 14px;">Check-out:</td>
                    <td style="color: #333; padding: 8px 0; font-size: 14px; font-weight: 600; text-align: right;">${formatDate(check_out_date)}</td>
                  </tr>
                  <tr>
                    <td style="color: #666; padding: 8px 0; font-size: 14px;">Total Amount:</td>
                    <td style="color: #333; padding: 8px 0; font-size: 14px; font-weight: 600; text-align: right;">${formatCurrency(total_amount)}</td>
                  </tr>
                  <tr>
                    <td style="color: #666; padding: 8px 0; font-size: 14px;">Booking Status:</td>
                    <td style="color: ${booking_status === 'confirmed' ? '#22c55e' : booking_status === 'cancelled' ? '#ef4444' : '#B8860B'}; padding: 8px 0; font-size: 14px; font-weight: 600; text-align: right; text-transform: capitalize;">${booking_status}</td>
                  </tr>
                  <tr>
                    <td style="color: #666; padding: 8px 0; font-size: 14px;">Payment Status:</td>
                    <td style="color: ${payment_status === 'confirmed' ? '#22c55e' : '#B8860B'}; padding: 8px 0; font-size: 14px; font-weight: 600; text-align: right; text-transform: capitalize;">${payment_status}</td>
                  </tr>
                </table>
              </div>
              
              <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 10px;">
                If you have any questions, please don't hesitate to contact us:
              </p>
              <p style="color: #333; font-size: 14px; margin: 0 0 5px;">
                📧 Email: <a href="mailto:abobbynwa@proton.me" style="color: #B8860B;">abobbynwa@proton.me</a>
              </p>
              <p style="color: #333; font-size: 14px; margin: 0 0 20px;">
                📱 WhatsApp: <a href="https://wa.me/234814964220" style="color: #B8860B;">+234 814 964 220</a>
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #1a1a1a; padding: 30px; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Hotel Booking. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-booking-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
