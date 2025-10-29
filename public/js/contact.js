// Contact form handler - Sends confirmation to the user
document.addEventListener('DOMContentLoaded', function() {
    console.log('Contact form script loaded - DOM ready');
    
    const contactForm = document.querySelector('.contact-form form');
    
    if (contactForm) {
        console.log('Contact form found');
        
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('📧 Contact form submission started');
            
            const name = document.getElementById('name').value;
            const userEmail = document.getElementById('email').value; // User's email
            const message = document.getElementById('message').value;
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const messageDiv = document.getElementById('contactMessage');
            
            console.log('Form data:', { name, email: userEmail, message });
            
            // Basic validation
            if (!name || !userEmail || !message) {
                messageDiv.innerHTML = '<div class="alert alert-danger">Please fill in all fields.</div>';
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userEmail)) {
                messageDiv.innerHTML = '<div class="alert alert-danger">Please enter a valid email address.</div>';
                return;
            }
            
            // Disable button and show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'SENDING...';
            messageDiv.innerHTML = '';
            
            try {
                console.log('🚀 Attempting Firestore write...');
                
                // Send confirmation email TO the user FROM your SendGrid account
                const docRef = await firebase.firestore().collection('mail').add({
                    to: userEmail, // Send to the user who filled the form
                    message: {
                        subject: `Thank you for contacting FundMyFuture!`,
                        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You - FundMyFuture</title>
</head>
<body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 0.375rem; overflow: hidden; box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #012A4A 0%, #2A6F97 100%); color: white; padding: 2rem 1rem; text-align: center;">
            <h1 style="margin: 0; font-size: 2rem; font-weight: bold;">✅ Message Received!</h1>
            <p style="margin: 0.5rem 0 0; opacity: 0.9; font-size: 1.1rem;">Thank you for contacting FundMyFuture</p>
        </div>
        
        <!-- Content Area -->
        <div style="padding: 2rem;">
            <!-- Thank you message -->
            <div style="background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 0.375rem; padding: 1rem; margin-bottom: 1.5rem;">
                <p style="margin: 0; color: #0c5460;">Hello ${name}, we've received your message and will get back to you soon!</p>
            </div>

            <!-- Message Summary -->
            <div style="background: #f8f9fa; border-left: 4px solid #2A6F97; padding: 1.5rem; border-radius: 0.375rem; margin: 1.5rem 0;">
                <h3 style="color: #012A4A; margin-top: 0;">📋 Your Message Summary</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 1rem;">
                    <div style="flex: 1; min-width: 200px;">
                        <p style="margin: 0.25rem 0;"><strong>Name:</strong> ${name}</p>
                        <p style="margin: 0.25rem 0;"><strong>Email:</strong> ${userEmail}</p>
                        <p style="margin: 0.25rem 0;"><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>
            </div>

            <!-- Message Content -->
            <div style="background: #e3f2fd; border: 1px solid #A9D6E5; border-radius: 0.375rem; padding: 1.5rem; margin: 1.5rem 0;">
                <h3 style="color: #012A4A; margin-top: 0;">💬 Your Message</h3>
                <div style="background: white; padding: 1rem; border-radius: 0.25rem; border: 1px solid #dee2e6;">
                    ${message.replace(/\n/g, '<br>')}
                </div>
            </div>

            <p style="margin-bottom: 1rem;">We typically respond within 24-48 hours. If you have urgent questions, feel free to call us directly.</p>

            <!-- Contact Info -->
            <div style="text-align: center; margin: 2rem 0; padding: 1.5rem; background: #f8f9fa; border-radius: 0.375rem;">
                <h4 style="color: #012A4A; margin-top: 0;">📞 Need Immediate Help?</h4>
                <p style="margin: 0.5rem 0;">
                    <strong>Email:</strong> <a href="mailto:fundmyfuture7@gmail.com">fundmyfuture7@gmail.com</a><br>
                    <strong>Phone:</strong> <a href="tel:+27218310700">+27 21 831 0700</a>
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #012A4A; color: white; padding: 2rem 1rem; text-align: center;">
            <p style="margin: 0.5rem 0;">
                <strong>FundMyFuture</strong><br>
                5th floor 112 Long St, Cape Town, 8000, Western Cape
            </p>
            <p style="margin: 0.5rem 0; font-size: 0.875rem;">
                © ${new Date().getFullYear()} FundMyFuture. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
                        `,
                        text: `Thank you for contacting FundMyFuture!

Hello ${name}, we've received your message and will get back to you soon!

Your Message Summary:
Name: ${name}
Email: ${userEmail}
Date: ${new Date().toLocaleDateString()}

Your Message:
${message}

We typically respond within 24-48 hours.

Contact Info:
Email: fundmyfuture7@gmail.com
Phone: +27 21 831 0700

FundMyFuture
5th floor 112 Long St, Cape Town, 8000`
                    },
                    contact_data: {
                        name: name,
                        email: userEmail,
                        message: message,
                        timestamp: new Date(),
                        source: 'website_contact'
                    },
                    type: 'contact_form_confirmation'
                });
                
                console.log('✅ Contact confirmation sent with ID:', docRef.id);
                
                // Success message
                messageDiv.innerHTML = '<div class="alert alert-success">Thank you for your message! We have sent a confirmation email to your inbox.</div>';
                contactForm.reset();
                
            } catch (error) {
                console.error('❌ Firestore error:', error);
                console.error('Error details:', error.message);
                messageDiv.innerHTML = '<div class="alert alert-danger">Sorry, there was an error sending your message. Please try again later.</div>';
            } finally {
                // Re-enable button
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Message';
            }
        });
    } else {
        console.error('❌ Contact form not found!');
    }
});