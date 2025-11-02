// newsletter.js - WITH ACTUAL WELCOME EMAIL
document.addEventListener('DOMContentLoaded', function() {
    console.log('Newsletter script loaded - DOM ready');
    
    const newsletterForm = document.getElementById('newsletterForm');
    
    if (newsletterForm) {
        console.log('Newsletter form found');
        
        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('📧 Newsletter form submission started');
            
            const emailInput = document.getElementById('newsletterEmail');
            const messageDiv = document.getElementById('newsletterMessage');
            const submitBtn = document.getElementById('subscribeBtn');
            
            const email = emailInput.value.trim();
            console.log('Email entered:', email);
            
            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                messageDiv.innerHTML = '<div class="alert alert-danger">Please enter a valid email address.</div>';
                return;
            }
            
            // Disable button and show loading state
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'SIGNING UP...';
            messageDiv.innerHTML = '';
            
            try {
                console.log('🚀 SENDING WELCOME EMAIL...');
                
                // ✅ SEND ACTUAL WELCOME EMAIL
                await firebase.firestore().collection('mail').add({
                    to: email, // Send to the subscriber
                    message: {
                        subject: '🎉 Welcome to FundMyFuture Newsletter!',
                        html: `
                            <h2>Welcome to FundMyFuture!</h2>
                            <p>Thank you for subscribing to our newsletter. You'll now receive:</p>
                            <ul>
                                <li>📚 Updates on student campaigns</li>
                                <li>🎓 Success stories</li>
                                <li>💡 Education funding tips</li>
                                <li>📅 Event announcements</li>
                            </ul>
                            <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
                                <p><strong>What's next?</strong></p>
                                <p>Keep an eye on your inbox for our next newsletter featuring inspiring student stories and new campaigns.</p>
                            </div>
                            <p>We're excited to have you as part of our community!</p>
                            <hr>
                            <p style="color: #666; font-size: 12px;">
                                FundMyFuture - Connecting students with educational opportunities<br>
                                Email: fundmyfuture7@gmail.com | Phone: +27 21 831 0700
                            </p>
                        `,
                        text: `
                            WELCOME TO FUNDMYFUTURE NEWSLETTER!
                            
                            Thank you for subscribing to our newsletter!
                            
                            You'll now receive:
                            - Updates on student campaigns
                            - Success stories  
                            - Education funding tips
                            - Event announcements
                            
                            What's next?
                            Keep an eye on your inbox for our next newsletter featuring inspiring student stories and new campaigns.
                            
                            We're excited to have you as part of our community!
                            
                            ---
                            FundMyFuture - Connecting students with educational opportunities
                            Email: fundmyfuture7@gmail.com | Phone: +27 21 831 0700
                        `
                    }
                });
                
                console.log('✅ WELCOME EMAIL QUEUED FOR SENDING');
                
                // ✅ Save to newsletter database
                await firebase.firestore().collection('newsletterSubscriptions').add({
                    email: email,
                    subscribedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    source: 'website_footer',
                    welcomeEmailSent: true,
                    status: 'active'
                });
                
                console.log('✅ Newsletter subscription saved to database');
                
                // Success message
                messageDiv.innerHTML = `
                    <div class="alert alert-success">
                        <h5>✅ Successfully Subscribed!</h5>
                        <p>Thank you for joining our newsletter! We've sent a welcome email to <strong>${email}</strong>.</p>
                        <p class="small">Check your inbox (and spam folder) for our welcome message.</p>
                    </div>
                `;
                newsletterForm.reset();
                
                // Track in localStorage
                localStorage.setItem('newsletterSubscribed', 'true');
                
            } catch (error) {
                console.error('❌ Newsletter subscription failed:', error);
                
                let errorMessage = 'Sorry, there was an error. Please try again later.';
                
                if (error.code === 'permission-denied') {
                    errorMessage = 'Newsletter subscription is temporarily unavailable.';
                }
                
                messageDiv.innerHTML = `<div class="alert alert-danger">${errorMessage}</div>`;
                
            } finally {
                // Re-enable button
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    } else {
        console.error('❌ Newsletter form not found!');
    }
});