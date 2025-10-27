// campaign-service.js - Updated for donate page display
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

// Get all campaigns for donate page (Top Campaigns)
export const getTopCampaigns = async (limitCount = 3) => {
  try {
    const q = query(
      collection(db, 'campaigns'),
      where('status', '==', 'active'),
      where('verified', '==', true),
      where('featured', '==', true),
      orderBy('currentAmount', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const campaigns = [];
    
    for (const docSnap of querySnapshot.docs) {
      const campaignData = docSnap.data();
      
      // Get student info
      const studentDoc = await getDoc(doc(db, 'users', campaignData.studentId));
      const studentData = studentDoc.data();
      
      campaigns.push({
        id: docSnap.id,
        ...campaignData,
        studentName: `${studentData.firstName} ${studentData.surname}`,
        percentage: Math.round((campaignData.currentAmount / campaignData.goalAmount) * 100)
      });
    }
    
    return { success: true, campaigns };
  } catch (error) {
    console.error('Error fetching top campaigns:', error);
    return { success: false, error: error.message };
  }
};

// Get new campaigns (recently created)
export const getNewCampaigns = async (limitCount = 3) => {
  try {
    const q = query(
      collection(db, 'campaigns'),
      where('status', '==', 'active'),
      where('verified', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const campaigns = [];
    
    for (const docSnap of querySnapshot.docs) {
      const campaignData = docSnap.data();
      
      // Get student info
      const studentDoc = await getDoc(doc(db, 'users', campaignData.studentId));
      const studentData = studentDoc.data();
      
      campaigns.push({
        id: docSnap.id,
        ...campaignData,
        studentName: `${studentData.firstName} ${studentData.surname}`,
        percentage: Math.round((campaignData.currentAmount / campaignData.goalAmount) * 100)
      });
    }
    
    return { success: true, campaigns };
  } catch (error) {
    console.error('Error fetching new campaigns:', error);
    return { success: false, error: error.message };
  }
};

// Get all active campaigns with filtering
export const getActiveCampaigns = async (filters = {}) => {
  try {
    let q = query(
      collection(db, 'campaigns'),
      where('status', '==', 'active'),
      where('verified', '==', true)
    );
    
    // Apply category filter
    if (filters.category && filters.category !== 'All') {
      q = query(q, where('category', '==', filters.category));
    }
    
    // Apply institution filter
    if (filters.institution && filters.institution !== 'All') {
      q = query(q, where('institution', '==', filters.institution));
    }
    
    // Add ordering
    q = query(q, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const campaigns = [];
    
    for (const docSnap of querySnapshot.docs) {
      const campaignData = docSnap.data();
      
      // Get student info
      const studentDoc = await getDoc(doc(db, 'users', campaignData.studentId));
      const studentData = studentDoc.data();
      
      campaigns.push({
        id: docSnap.id,
        ...campaignData,
        studentName: `${studentData.firstName} ${studentData.surname}`,
        percentage: Math.round((campaignData.currentAmount / campaignData.goalAmount) * 100)
      });
    }
    
    return { success: true, campaigns };
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return { success: false, error: error.message };
  }
};

// Create a new campaign (called by students)
export const createCampaign = async (studentId, campaignData, imageFiles) => {
  try {
    // Get student data
    const studentDoc = await getDoc(doc(db, 'users', studentId));
    if (!studentDoc.exists()) {
      return { success: false, error: 'Student profile not found' };
    }
    const studentData = studentDoc.data();
    
    // Upload images to Firebase Storage
    const imageUrls = [];
    if (imageFiles && imageFiles.length > 0) {
      for (const file of imageFiles) {
        const storageRef = ref(storage, `campaigns/${studentId}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        imageUrls.push(url);
      }
    }
    
    // Create campaign document
    const campaignRef = await addDoc(collection(db, 'campaigns'), {
      studentId,
      studentName: `${studentData.firstName} ${studentData.surname}`,
      title: campaignData.title,
      description: campaignData.description,
      category: campaignData.category,
      institution: campaignData.institution,
      course: campaignData.course,
      goalAmount: parseFloat(campaignData.goalAmount),
      currentAmount: 0,
      status: 'pending', // Awaiting admin approval
      verified: false,
      featured: false,
      images: imageUrls,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    return { success: true, campaignId: campaignRef.id };
  } catch (error) {
    console.error('Error creating campaign:', error);
    return { success: false, error: error.message };
  }
};

// Get single campaign by ID
export const getCampaignById = async (campaignId) => {
  try {
    const campaignDoc = await getDoc(doc(db, 'campaigns', campaignId));
    
    if (!campaignDoc.exists()) {
      return { success: false, error: 'Campaign not found' };
    }
    
    const campaignData = campaignDoc.data();
    
    // Get student info
    const studentDoc = await getDoc(doc(db, 'users', campaignData.studentId));
    const studentData = studentDoc.data();
    
    return { 
      success: true, 
      campaign: {
        id: campaignDoc.id,
        ...campaignData,
        studentName: `${studentData.firstName} ${studentData.surname}`,
        studentPhoto: studentData.profilePhoto,
        percentage: Math.round((campaignData.currentAmount / campaignData.goalAmount) * 100)
      }
    };
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return { success: false, error: error.message };
  }
};

// Get campaigns by student (for student dashboard)
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
      const data = doc.data();
      campaigns.push({
        id: doc.id,
        ...data,
        percentage: Math.round((data.currentAmount / data.goalAmount) * 100)
      });
    });
    
    return { success: true, campaigns };
  } catch (error) {
    console.error('Error fetching student campaigns:', error);
    return { success: false, error: error.message };
  }
};

// Process donation
export const processDonation = async (campaignId, funderId, amount, message = '', anonymous = false) => {
  try {
    // Get funder name if not anonymous
    let funderName = 'Anonymous';
    if (!anonymous && funderId) {
      const funderDoc = await getDoc(doc(db, 'users', funderId));
      if (funderDoc.exists()) {
        const funderData = funderDoc.data();
        funderName = `${funderData.firstName} ${funderData.surname}`;
      }
    }
    
    // Create donation record
    const donationRef = await addDoc(collection(db, 'donations'), {
      campaignId,
      funderId: anonymous ? null : funderId,
      funderName,
      amount: parseFloat(amount),
      message,
      anonymous,
      paymentStatus: 'completed', // Update this when payment gateway is integrated
      transactionId: `TXN_${Date.now()}`,
      createdAt: Timestamp.now()
    });
    
    // Update campaign current amount
    const campaignRef = doc(db, 'campaigns', campaignId);
    await updateDoc(campaignRef, {
      currentAmount: increment(parseFloat(amount))
    });
    
    // Update funder's total donated (if not anonymous)
    if (!anonymous && funderId) {
      const funderRef = doc(db, 'users', funderId);
      await updateDoc(funderRef, {
        totalDonated: increment(parseFloat(amount))
      });
    }
    
    // Check if goal is reached
    const campaignDoc = await getDoc(campaignRef);
    const campaignData = campaignDoc.data();
    if (campaignData.currentAmount >= campaignData.goalAmount) {
      await updateDoc(campaignRef, {
        status: 'completed'
      });
    }
    
    return { success: true, donationId: donationRef.id };
  } catch (error) {
    console.error('Error processing donation:', error);
    return { success: false, error: error.message };
  }
};

// Get campaign donations (for displaying donor list)
export const getCampaignDonations = async (campaignId, limitCount = 10) => {
  try {
    const q = query(
      collection(db, 'donations'),
      where('campaignId', '==', campaignId),
      where('paymentStatus', '==', 'completed'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const donations = [];
    
    querySnapshot.forEach((doc) => {
      donations.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, donations };
  } catch (error) {
    console.error('Error fetching donations:', error);
    return { success: false, error: error.message };
  }
};