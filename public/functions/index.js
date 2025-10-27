// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

// Trigger when a new campaign is created
exports.onCampaignCreated = functions.firestore
  .document('campaigns/{campaignId}')
  .onCreate(async (snap, context) => {
    const campaign = snap.data();
    const campaignId = context.params.campaignId;
    
    // Send notification to admins for verification
    // You can implement email notification here
    console.log(`New campaign created: ${campaignId}`);
    
    // Send email to student confirming submission
    // await sendEmail(student.email, 'Campaign Submitted', '...');
    
    return null;
  });

// Trigger when a donation is made
exports.onDonationCreated = functions.firestore
  .document('donations/{donationId}')
  .onCreate(async (snap, context) => {
    const donation = snap.data();
    
    try {
      // Get campaign and student info
      const campaignRef = db.collection('campaigns').doc(donation.campaignId);
      const campaignSnap = await campaignRef.get();
      const campaign = campaignSnap.data();
      
      // Get student info
      const studentRef = db.collection('users').doc(campaign.studentId);
      const studentSnap = await studentRef.get();
      const student = studentSnap.data();
      
      // Send thank you email to donor
      // await sendEmail(donorEmail, 'Thank you for your donation', '...');
      
      // Notify student of new donation
      // await sendEmail(student.email, 'New donation received', '...');
      
      // Check if campaign goal is reached
      if (campaign.currentAmount >= campaign.goalAmount) {
        await campaignRef.update({ status: 'completed' });
        // Send success email to student
        // await sendEmail(student.email, 'Campaign Goal Reached!', '...');
      }
      
      console.log(`Donation processed: ${context.params.donationId}`);
      return null;
    } catch (error) {
      console.error('Error processing donation:', error);
      return null;
    }
  });

// Cloud Function to verify campaign (called by admin)
exports.verifyCampaign = functions.https.onCall(async (data, context) => {
  // Check if user is admin
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can verify campaigns'
    );
  }
  
  const { campaignId, approved } = data;
  
  try {
    const campaignRef = db.collection('campaigns').doc(campaignId);
    await campaignRef.update({
      verified: approved,
      status: approved ? 'active' : 'rejected',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Process payment (integrate with payment gateway)
exports.processPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }
  
  const { campaignId, amount, paymentMethod } = data;
  const donorId = context.auth.uid;
  
  try {
    // Here you would integrate with a payment provider
    // For South Africa, popular options are:
    // - PayFast
    // - Peach Payments
    // - Yoco
    // - Paystack
    
    // Example payment flow:
    // 1. Create payment with provider
    // 2. Get payment URL/token
    // 3. Return to client
    // 4. Handle webhook for payment confirmation
    
    // Placeholder for payment processing
    const paymentResult = {
      success: true,
      transactionId: `TXN_${Date.now()}`,
      paymentUrl: 'https://payment-gateway.com/pay'
    };
    
    if (paymentResult.success) {
      // Create pending donation record
      await db.collection('donations').add({
        campaignId,
        donorId,
        amount: parseFloat(amount),
        paymentMethod,
        paymentStatus: 'pending',
        transactionId: paymentResult.transactionId,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    return paymentResult;
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Webhook to handle payment confirmation
exports.paymentWebhook = functions.https.onRequest(async (req, res) => {
  // Verify webhook signature
  // This depends on your payment provider
  
  const { transactionId, status } = req.body;
  
  try {
    // Find donation by transaction ID
    const donationsRef = db.collection('donations');
    const query = donationsRef.where('transactionId', '==', transactionId);
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      return res.status(404).send('Donation not found');
    }
    
    // Update donation status
    const donationDoc = snapshot.docs[0];
    await donationDoc.ref.update({
      paymentStatus: status === 'success' ? 'completed' : 'failed'
    });
    
    res.status(200).send('Webhook processed');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Error processing webhook');
  }
});

// Scheduled function to check and update expired campaigns
exports.checkExpiredCampaigns = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    
    const campaignsRef = db.collection('campaigns');
    const query = campaignsRef
      .where('status', '==', 'active')
      .where('endDate', '<=', now);
    
    const snapshot = await query.get();
    
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { status: 'completed' });
    });
    
    await batch.commit();
    console.log(`Updated ${snapshot.size} expired campaigns`);
    return null;
  });

// Send email notification helper function
// You can use SendGrid, Mailgun, or Firebase Extensions
async function sendEmail(to, subject, body) {
  // Implement email sending logic
  console.log(`Email sent to ${to}: ${subject}`);
}