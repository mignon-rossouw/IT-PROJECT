// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true }); // Add CORS middleware

admin.initializeApp();

const db = admin.firestore();

// Initialize Stripe with your secret key
const stripe = require('stripe')('sk_test_51SPVY8JiL5xkeb8dzBwlM6XzwDsafQB3gcii34l0ODC1FYvYvULbe0RMyL6EdO9KNS19n6i8hGgaVtKuYZ4V6SOL00NVpYSFai');

// Trigger when a new campaign is created
exports.onCampaignCreated = functions.firestore
  .document('campaigns/{campaignId}')
  .onCreate(async (snap, context) => {
    const campaign = snap.data();
    const campaignId = context.params.campaignId;
    
    // Send notification to admins for verification
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


// Stripe Checkout Session for donations 
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated', 
      'User must be logged in to make donations'
    );
  }

  const { campaignId, amount, currency = 'zar' } = data;
  
  try {
    // Validate donation amount (minimum R10)
    if (amount < 10) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Minimum donation amount is R10'
      );
    }

    // Get campaign details from Firestore
    const campaignDoc = await admin.firestore()
      .collection('campaigns')
      .doc(campaignId)
      .get();
      
    if (!campaignDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Campaign not found'
      );
    }

    const campaign = campaignDoc.data();
    
    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: `Donation to ${campaign.title}`,
              description: `Supporting ${campaign.title}'s education fund`,
            },
            unit_amount: amount * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `https://fund-my-future-47844.web.app/donation.html?payment=success&campaignId=${campaignId}`,
      cancel_url: `https://fund-my-future-47844.web.app/view-campaign.html?id=${campaignId}`,
      client_reference_id: context.auth.uid,
      metadata: {
        campaignId: campaignId,
        userId: context.auth.uid,
      },
    });

    // Return session ID to client for redirect
    return { sessionId: session.id };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Unable to create payment session: ' + error.message
    );
  }
});

// Stripe webhook to handle successful payments
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature to ensure request is from Stripe
    event = stripe.webhooks.constructEvent(
      req.rawBody, 
      sig, 
      'whsec_lRg1KMZHaZIYp2Hn3cykQY5Y76KnVQqW'
    );
  } catch (err) {
    console.log(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful payment completion
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Process the successful payment
    await handleSuccessfulPayment(session);
  }

  res.json({ received: true });
});

// Process successful Stripe payment and update database
async function handleSuccessfulPayment(session) {
  const { campaignId, userId } = session.metadata;
  const amount = session.amount_total / 100; // Convert back from cents to dollars/rand
  
  const db = admin.firestore();
  const batch = db.batch();
  
  try {
    // Update campaign with new donation amount
    const campaignRef = db.collection('campaigns').doc(campaignId);
    batch.update(campaignRef, {
      currentAmount: admin.firestore.FieldValue.increment(amount),
      donorCount: admin.firestore.FieldValue.increment(1),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Create donation record in donations collection
    const donationRef = db.collection('donations').doc();
    batch.set(donationRef, {
      userId: userId,
      campaignId: campaignId,
      amount: amount,
      stripeSessionId: session.id,
      paymentStatus: 'completed',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'completed'
    });
    
    // Add to user's donation history
    const userDonationsRef = db.collection('users').doc(userId)
      .collection('donations').doc();
    batch.set(userDonationsRef, {
      campaignId: campaignId,
      amount: amount,
      date: admin.firestore.FieldValue.serverTimestamp(),
      sessionId: session.id,
      status: 'completed'
    });
    
    // Commit all database updates
    await batch.commit();
    console.log(`Successfully processed donation of ${amount} for campaign ${campaignId}`);
    
  } catch (error) {
    console.error('Error processing successful payment:', error);
    throw error;
  }
}

// Process payment (legacy function - can be removed if using Stripe)
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
    // Legacy payment processing - kept for reference
    // This can be removed if you're fully migrating to Stripe
    
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

// Webhook to handle payment confirmation (legacy - can be removed)
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
async function sendEmail(to, subject, body) {
  // Implement email sending logic using SendGrid, Mailgun, or Firebase Extensions
  console.log(`Email sent to ${to}: ${subject}`);
}