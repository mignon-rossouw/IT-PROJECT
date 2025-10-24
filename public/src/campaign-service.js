// campaign-service.js
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  increment
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase-config';

// Create a new campaign
export const createCampaign = async (studentId, campaignData, imageFiles) => {
  try {
    // Upload images to Firebase Storage
    const imageUrls = [];
    for (const file of imageFiles) {
      const storageRef = ref(storage, `campaigns/${studentId}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      imageUrls.push(url);
    }
    
    // Create campaign document
    const campaignRef = await addDoc(collection(db, 'campaigns'), {
      studentId,
      title: campaignData.title,
      description: campaignData.description,
      category: campaignData.category,
      goalAmount: parseFloat(campaignData.goalAmount),
      currentAmount: 0,
      startDate: Timestamp.now(),
      endDate: campaignData.endDate ? Timestamp.fromDate(new Date(campaignData.endDate)) : null,
      status: 'pending', // pending verification
      images: imageUrls,
      university: campaignData.university,
      course: campaignData.course,
      yearOfStudy: campaignData.yearOfStudy,
      verified: false,
      featured: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    return { success: true, campaignId: campaignRef.id };
  } catch (error) {
    console.error('Error creating campaign:', error);
    return { success: false, error: error.message };
  }
};

// Get all active campaigns
export const getActiveCampaigns = async (limitCount = 10) => {
  try {
    const q = query(
      collection(db, 'campaigns'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const campaigns = [];
    querySnapshot.forEach((doc) => {
      campaigns.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, campaigns };
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return { success: false, error: error.message };
  }
};

// Get featured campaigns
export const getFeaturedCampaigns = async () => {
  try {
    const q = query(
      collection(db, 'campaigns'),
      where('featured', '==', true),
      where('status', '==', 'active'),
      limit(6)
    );
    
    const querySnapshot = await getDocs(q);
    const campaigns = [];
    querySnapshot.forEach((doc) => {
      campaigns.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, campaigns };
  } catch (error) {
    console.error('Error fetching featured campaigns:', error);
    return { success: false, error: error.message };
  }
};

// Get single campaign by ID
export const getCampaignById = async (campaignId) => {
  try {
    const campaignDoc = await getDoc(doc(db, 'campaigns', campaignId));
    
    if (campaignDoc.exists()) {
      return { success: true, campaign: { id: campaignDoc.id, ...campaignDoc.data() } };
    }
    return { success: false, error: 'Campaign not found' };
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return { success: false, error: error.message };
  }
};

// Get campaigns by student
export const getStudentCampaigns = async (studentId) => {
  try {
    const q = query(
      collection(db, 'campaigns'),
      where('studentId', '==', studentId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const campaigns = [];
    querySnapshot.forEach((doc) => {
      campaigns.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, campaigns };
  } catch (error) {
    console.error('Error fetching student campaigns:', error);
    return { success: false, error: error.message };
  }
};

// Update campaign
export const updateCampaign = async (campaignId, updates) => {
  try {
    const campaignRef = doc(db, 'campaigns', campaignId);
    await updateDoc(campaignRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating campaign:', error);
    return { success: false, error: error.message };
  }
};

// Add donation to campaign
export const addDonation = async (campaignId, donorId, amount, message, anonymous = false) => {
  try {
    // Create donation document
    const donationRef = await addDoc(collection(db, 'donations'), {
      campaignId,
      donorId,
      amount: parseFloat(amount),
      message,
      anonymous,
      paymentStatus: 'pending',
      createdAt: Timestamp.now()
    });
    
    // Update campaign current amount
    const campaignRef = doc(db, 'campaigns', campaignId);
    await updateDoc(campaignRef, {
      currentAmount: increment(parseFloat(amount))
    });
    
    // Update donor's total donated
    const donorRef = doc(db, 'users', donorId);
    await updateDoc(donorRef, {
      totalDonated: increment(parseFloat(amount))
    });
    
    return { success: true, donationId: donationRef.id };
  } catch (error) {
    console.error('Error adding donation:', error);
    return { success: false, error: error.message };
  }
};

// Get campaign donations
export const getCampaignDonations = async (campaignId) => {
  try {
    const q = query(
      collection(db, 'donations'),
      where('campaignId', '==', campaignId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const donations = [];
    querySnapshot.forEach((doc) => {
      donations.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, donations };
  } catch (error) {
    console.error('Error fetching donations:', error);
    return { success: false, error: error.message };
  }
};