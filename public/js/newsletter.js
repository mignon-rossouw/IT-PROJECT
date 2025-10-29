// Newsletter form handler with Professional HTML Emails
document.addEventListener('DOMContentLoaded', function() {
    console.log('Newsletter script loaded - DOM ready');
    
    const newsletterForm = document.getElementById('newsletterForm');
    
    if (newsletterForm) {
        console.log('Newsletter form found');
        
        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('📧 Form submission started');
            
            const email = document.getElementById('newsletterEmail').value;
            const messageDiv = document.getElementById('newsletterMessage');
            const submitBtn = document.getElementById('subscribeBtn');
            
            console.log('Email entered:', email);
            
            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                messageDiv.innerHTML = '<div class="alert alert-danger">Please enter a valid email address.</div>';
                console.log('Invalid email format');
                return;
            }
            
            // Disable button and show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'SIGNING UP...';
            messageDiv.innerHTML = '';
            
            try {
                console.log('Attempting Firestore write...');
                
                const docRef = await firebase.firestore().collection('mail').add({
                    to: email,
                    message: {
                        subject: 'Welcome to FundMyFuture! 🎓',
                        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to FundMyFuture</title>
    <!-- Bootstrap Icons CDN -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
</head>
<body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 0.375rem; overflow: hidden; box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #012A4A 0%, #2A6F97 100%); color: white; padding: 2rem 1rem; text-align: center;">
            <h1 style="margin: 0; font-size: 2rem; font-weight: bold;">🎓 Welcome to FundMyFuture!</h1>
            <p style="margin: 0.5rem 0 0; opacity: 0.9; font-size: 1.1rem;">Empowering Education, One Student at a Time</p>
        </div>
        
        <!-- Content Area -->
        <div style="padding: 2rem;">
            <!-- Your existing content remains the same -->
            <div style="background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 0.375rem; padding: 1rem; margin-bottom: 1.5rem;">
                <p style="margin: 0; color: #0c5460;">Hello, and welcome to our community!</p>
            </div>

            <p style="margin-bottom: 1rem;">Thank you for subscribing to the FundMyFuture newsletter. We're excited to keep you updated on student campaigns, success stories, and educational opportunities.</p>

            <div style="background: #f8f9fa; border-left: 4px solid #2A6F97; padding: 1.5rem; border-radius: 0.375rem; margin: 1.5rem 0;">
                <h3 style="color: #012A4A; margin-top: 0;">📬 What to Expect:</h3>
                <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
                    <li style="margin-bottom: 0.5rem;"><strong>Student Stories:</strong> Inspiring campaigns from students needing support</li>
                    <li style="margin-bottom: 0.5rem;"><strong>Impact Updates:</strong> See how donations are changing lives</li>
                    <li style="margin-bottom: 0.5rem;"><strong>Platform News:</strong> New features and improvements</li>
                    <li style="margin-bottom: 0.5rem;"><strong>Success Celebrations:</strong> Students who reached their goals</li>
                </ul>
            </div>

            <div style="background: #e3f2fd; border: 1px solid #A9D6E5; border-radius: 0.375rem; padding: 1.5rem; margin: 1.5rem 0;">
                <h3 style="color: #012A4A; margin-top: 0;">💫 Your Subscription Details</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 1rem;">
                    <div style="flex: 1; min-width: 200px;">
                        <p style="margin: 0.25rem 0;"><strong>Email:</strong> ${email}</p>
                        <p style="margin: 0.25rem 0;"><strong>Joined:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div style="flex: 1; min-width: 200px;">
                        <span style="background: #28a745; color: white; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.875rem; font-weight: bold;">Active ✓</span>
                    </div>
                </div>
            </div>

            <p>We believe every student deserves the opportunity to pursue their dreams, and your subscription helps us spread awareness about this important mission.</p>

            <div style="text-align: center; margin: 2rem 0;">
                <a href="https://fund-my-future-47844.web.app/donate.html" style="display: inline-block; background: #2A6F97; color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 0.375rem; font-weight: bold; transition: background-color 0.15s ease-in-out;">
                    Support a Student Today
                </a>
            </div>
        </div>
        
        <!-- Footer with Bootstrap Icons -->
        <div style="background: #012A4A; color: white; padding: 2rem 1rem; text-align: center;">
            
            <!-- Bootstrap Icons Social Links -->
            <div style="margin: 1.5rem 0;">
                <a href="https://www.instagram.com/thisisrichfield/?hl=en" style="display: inline-block; margin: 0 0.75rem; text-decoration: none; color: #A9D6E5; transition: color 0.15s ease-in-out, transform 0.15s ease-in-out;" title="Instagram">
                    Instagram
                </a>
                <a href="https://www.facebook.com/thisisrichfield/" style="display: inline-block; margin: 0 0.75rem; text-decoration: none; color: #A9D6E5; transition: color 0.15s ease-in-out, transform 0.15s ease-in-out;" title="Facebook"> Facebook
                </a>
                <a href="https://www.linkedin.com/school/richfieldeducation/posts/?feedView=all" style="display: inline-block; margin: 0 0.75rem; text-decoration: none; color: #A9D6E5; transition: color 0.15s ease-in-out, transform 0.15s ease-in-out;" title="LinkedIn">
                    LinkedIn
                </a>
            </div>

            <!-- Contact info -->
            <div style="margin: 1rem 0; line-height: 1.8;">
                <p style="margin: 0.5rem 0;">
                    <strong>FundMyFuture</strong><br>
                    5th floor 112 Long St, Cape Town, 8000<br>
                    Western Cape, South Africa
                </p>
                <p style="margin: 0.5rem 0;">
                    <a href="mailto:fundmyfuture7@gmail.com" style="color: #A9D6E5; text-decoration: none;">fundmyfuture7@gmail.com</a> • 
                    <a href="tel:+27218310700" style="color: #A9D6E5; text-decoration: none;">+27 21 831 0700</a>
                </p>
            </div>

            <!-- Copyright and links -->
            <div style="border-top: 1px solid #2A6F97; padding-top: 1rem; margin-top: 1rem;">
                <p style="margin: 0.5rem 0; font-size: 0.875rem;">
                    © ${new Date().getFullYear()} FundMyFuture. All rights reserved.
                </p>
                <p style="margin: 0.5rem 0; font-size: 0.75rem; opacity: 0.8;">
                    You're receiving this email because you subscribed to our newsletter.<br>
                    <a href="[Unsubscribe URL]" style="color: #89C2D9; text-decoration: none;">Unsubscribe</a> • 
                    <a href="https://fund-my-future-47844.web.app/privacy.html" style="color: #89C2D9; text-decoration: none;">Privacy Policy</a>
                </p>
            </div>
        </div>
    </div>
</body>
</html>
                        `,
                        text: `Welcome to FundMyFuture!

Thank you for subscribing to our newsletter! We'll keep you updated on student campaigns, success stories, and platform news.

Email: ${email}
Joined: ${new Date().toLocaleDateString()}

FundMyFuture
5th floor 112 Long St, Cape Town, 8000
fundmyfuture@gmail.com
+27 21 831 0700

Unsubscribe: [Unsubscribe URL]`
                    },
                    email: email,
                    type: 'newsletter_subscription',
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    source: 'website_footer'
                });
                
                console.log('✅ Document written with ID:', docRef.id);
                
                // Success message
                messageDiv.innerHTML = '<div class="alert alert-success">Thank you for subscribing to our newsletter!</div>';
                newsletterForm.reset();
                
            } catch (error) {
                console.error('❌ Firestore error:', error);
                console.error('Error details:', error.message);
                messageDiv.innerHTML = '<div class="alert alert-danger">Sorry, there was an error. Please try again later.</div>';
            } finally {
                // Re-enable button
                submitBtn.disabled = false;
                submitBtn.textContent = 'SIGN UP';
            }
        });
    } else {
        console.error('❌ Newsletter form not found!');
    }
});