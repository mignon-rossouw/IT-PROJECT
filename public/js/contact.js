// contact.js - EMAIL SENDING with Email JS Extension
document.addEventListener('DOMContentLoaded', function() {
    console.log('Contact form script loaded - DOM ready');
    
    const contactForm = document.getElementById('contactForm') || document.querySelector('form');
    
    if (contactForm) {
        console.log('Contact form found');
        
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('📧 Contact form submission started');
            
            // Get form elements - adjust selectors based on your actual HTML
            const name = document.getElementById('name')?.value || '';
            const userEmail = document.getElementById('email')?.value || '';
            const message = document.getElementById('message')?.value || '';
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const messageDiv = document.getElementById('contactMessage') || document.getElementById('formMessage') || document.createElement('div');
            
            console.log('Form data:', { name, email: userEmail, message });
            
            // Basic validation
            if (!name || !userEmail || !message) {
                showMessage('Please fill in all fields.', 'danger', messageDiv);
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userEmail)) {
                showMessage('Please enter a valid email address.', 'danger', messageDiv);
                return;
            }
            
            // Disable button and show loading state
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'SENDING...';
            clearMessage(messageDiv);
            
            try {
                console.log('🚀 SENDING ACTUAL EMAIL TO ADMIN...');
                
                // ✅ ACTUAL EMAIL TO ADMIN - This will trigger the Email JS extension
                const adminEmailData = {
                    to: 'fundmyfuture7@gmail.com',
                    message: {
                        subject: `New Contact Form Submission from ${name}`,
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <h2 style="color: #012A4A;">📬 New Contact Form Submission</h2>
                                
                                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 15px 0;">
                                    <h3 style="color: #2A6F97; margin-top: 0;">Contact Information</h3>
                                    <p><strong>👤 Name:</strong> ${name}</p>
                                    <p><strong>📧 Email:</strong> ${userEmail}</p>
                                    <p><strong>📅 Date:</strong> ${new Date().toLocaleString()}</p>
                                </div>
                                
                                <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0;">
                                    <h3 style="color: #2A6F97; margin-top: 0;">💬 Message</h3>
                                    <p style="white-space: pre-line; background: white; padding: 15px; border-radius: 5px;">${message}</p>
                                </div>
                                
                                <hr style="border: none; border-top: 2px solid #012A4A;">
                                <p style="color: #666; font-size: 12px;">
                                    This email was automatically sent from your FundMyFuture website contact form.
                                </p>
                            </div>
                        `,
                        text: `
                            NEW CONTACT FORM SUBMISSION
                            
                            Contact Information:
                            Name: ${name}
                            Email: ${userEmail}
                            Date: ${new Date().toLocaleString()}
                            
                            Message:
                            ${message}
                            
                            ---
                            Sent from FundMyFuture website
                        `
                    }
                };
                
                await firebase.firestore().collection('mail').add(adminEmailData);
                console.log('✅ ADMIN EMAIL QUEUED FOR SENDING');
                
                // ✅ CONFIRMATION EMAIL TO USER
                const userEmailData = {
                    to: userEmail,
                    message: {
                        subject: `Thank you for contacting FundMyFuture!`,
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <h2 style="color: #012A4A;">✅ Thank You, ${name}!</h2>
                                <p>We've received your message and will get back to you within 24-48 hours.</p>
                                
                                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                                    <h3 style="color: #2A6F97; margin-top: 0;">📋 Your Message Summary</h3>
                                    <p><strong>Name:</strong> ${name}</p>
                                    <p><strong>Email:</strong> ${userEmail}</p>
                                    <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                                
                                <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 15px 0;">
                                    <h3 style="color: #2A6F97; margin-top: 0;">💬 Your Message</h3>
                                    <p style="white-space: pre-line; background: white; padding: 15px; border-radius: 5px;">${message}</p>
                                </div>
                                
                                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0;">
                                    <h3 style="color: #2A6F97; margin-top: 0;">📞 Need Immediate Help?</h3>
                                    <p>
                                        <strong>Email:</strong> fundmyfuture7@gmail.com<br>
                                        <strong>Phone:</strong> +27 21 831 0700
                                    </p>
                                </div>
                                
                                <p>Best regards,<br><strong>The FundMyFuture Team</strong></p>
                            </div>
                        `,
                        text: `
                            Thank you for contacting FundMyFuture!
                            
                            Hello ${name},
                            
                            We've received your message and will get back to you within 24-48 hours.
                            
                            YOUR MESSAGE SUMMARY:
                            Name: ${name}
                            Email: ${userEmail}
                            Date: ${new Date().toLocaleDateString()}
                            
                            YOUR MESSAGE:
                            ${message}
                            
                            Need immediate help?
                            Email: fundmyfuture7@gmail.com
                            Phone: +27 21 831 0700
                            
                            Best regards,
                            The FundMyFuture Team
                        `
                    }
                };
                
                await firebase.firestore().collection('mail').add(userEmailData);
                console.log('✅ USER CONFIRMATION EMAIL QUEUED FOR SENDING');
                
                // ✅ Save to database for records
                await firebase.firestore().collection('contactSubmissions').add({
                    name: name,
                    email: userEmail,
                    message: message,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    status: 'emails_queued',
                    adminNotified: true,
                    userNotified: true
                });
                
                console.log('✅ Contact submission saved to database');
                
                // Success message
                showMessage(`
                    <h4>✅ Message Sent Successfully!</h4>
                    <p><strong>Thank you, ${name}!</strong></p>
                    <p>We've received your message and sent a confirmation email to <strong>${userEmail}</strong>.</p>
                    <p>We'll get back to you within 24-48 hours.</p>
                `, 'success', messageDiv);
                
                contactForm.reset();
                
            } catch (error) {
                console.error('❌ Email sending failed:', error);
                console.error('Error code:', error.code);
                console.error('Error message:', error.message);
                
                // Try to save contact submission even if email fails
                try {
                    await firebase.firestore().collection('contactSubmissions').add({
                        name: name,
                        email: userEmail,
                        message: message,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                        status: 'submitted_no_email',
                        adminNotified: false,
                        userNotified: false,
                        error: error.message
                    });
                    
                    showMessage(`
                        <h4>⚠️ Message Received (Email Queued)</h4>
                        <p><strong>Thank you, ${name}!</strong></p>
                        <p>We've saved your message but email delivery is temporarily delayed.</p>
                        <p>We'll still contact you at <strong>${userEmail}</strong> within 24-48 hours.</p>
                    `, 'warning', messageDiv);
                    
                    contactForm.reset();
                    
                } catch (fallbackError) {
                    console.error('❌ Complete failure:', fallbackError);
                    showMessage(`
                        <h4>❌ Sending Failed</h4>
                        <p>Please email us directly at: <a href="mailto:fundmyfuture7@gmail.com">fundmyfuture7@gmail.com</a></p>
                        <p>Or call us at: <a href="tel:+27218310700">+27 21 831 0700</a></p>
                    `, 'danger', messageDiv);
                }
                
            } finally {
                // Re-enable button
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    } else {
        console.error('❌ Contact form not found!');
    }
    
    // Helper functions
    function showMessage(message, type, container) {
        container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    }
    
    function clearMessage(container) {
        container.innerHTML = '';
    }
});