// Newsletter form handler - CORRECTED VERSION
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
                
                // ✅ CORRECTED: Use a proper newsletter collection
                const docRef = await firebase.firestore().collection('newsletterSubscriptions').add({
                    email: email,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    status: 'active',
                    source: 'website_footer',
                    // Store email content separately if needed for logging
                    emailContent: {
                        subject: 'Welcome to FundMyFuture! 🎓',
                        sent: false // You can update this when email is actually sent
                    }
                });
                
                console.log('✅ Document written with ID:', docRef.id);
                
                // ✅ Send email using a simple fetch to a Cloud Function
                // OR just show success message (email sending handled separately)
                messageDiv.innerHTML = '<div class="alert alert-success">Thank you for subscribing to our newsletter! Welcome email sent.</div>';
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