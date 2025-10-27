// auth-service.js - Updated for Student/Funder/Admin registration
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from './firebase-config';

// Upload profile picture helper function
const uploadProfilePicture = async (file, userId) => {
  if (!file) return null;
  
  try {
    const photoRef = ref(storage, `profiles/${userId}/profile.jpg`);
    await uploadBytes(photoRef, file);
    return await getDownloadURL(photoRef);
  } catch (error) {
    console.error('Profile picture upload error:', error);
    throw new Error('Failed to upload profile picture');
  }
};

// Register Student
export const registerStudent = async (formData, profilePhotoFile) => {
  try {
    // Create authentication account
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      formData.email, // Changed from formData.studentEmail
      formData.password
    );
    const user = userCredential.user;
    
    // Upload profile photo if provided
    let profilePhotoURL = null;
    if (profilePhotoFile) {
      profilePhotoURL = await uploadProfilePicture(profilePhotoFile, user.uid);
    }
    
    // Create user document in Firestore - matching your HTML form fields
    const userData = {
      userType: 'student',
      email: formData.email,
      firstName: formData.firstName,
      surname: formData.surname,
      idOrPassportNumber: formData.idNumber, // Changed from idOrPassportNumber
      dateOfBirth: new Date(formData.dob), // Changed from dateOfBirth
      countryOfCitizenship: formData.coCitizenship,
      countryOfBirth: formData.coBirth,
      countryOfResidence: formData.coResidence,
      contactNumber: formData.contactNumber,
      profilePhoto: profilePhotoURL,
      profileComplete: true,
      createdAt: serverTimestamp()
    };
    
    await setDoc(doc(db, 'users', user.uid), userData);
    
    // Update auth profile
    if (profilePhotoURL) {
      await updateProfile(user, { 
        displayName: `${formData.firstName} ${formData.surname}`,
        photoURL: profilePhotoURL
      });
    } else {
      await updateProfile(user, { 
        displayName: `${formData.firstName} ${formData.surname}`
      });
    }

    return { 
      success: true, 
      user, 
      userType: 'student',
      userData: userData
    };
  } catch (error) {
    console.error('Student registration error:', error);
    
    // User-friendly error messages
    let errorMessage = 'Registration failed';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'This email is already registered';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    }
    
    return { success: false, error: errorMessage };
  }
};

// Register Funder
export const registerFunder = async (formData, profilePhotoFile) => {
  try {
    // Create authentication account
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      formData.email, 
      formData.password
    );
    const user = userCredential.user;
    
    // Upload profile photo if provided
    let profilePhotoURL = null;
    if (profilePhotoFile) {
      profilePhotoURL = await uploadProfilePicture(profilePhotoFile, user.uid);
    }
    
    // Create user document in Firestore - matching your HTML form fields
    const userData = {
      userType: 'funder',
      email: formData.email,
      firstName: formData.firstName,
      surname: formData.surname,
      idOrPassportNumber: formData.idNumber, // Changed from formData.idNumber
      dateOfBirth: new Date(formData.dob), // Changed from formData.dob
      contactNumber: formData.contactNumber,
      profilePhoto: profilePhotoURL,
      totalDonated: 0,
      profileComplete: true,
      createdAt: serverTimestamp()
    };
    
    await setDoc(doc(db, 'users', user.uid), userData);
    
    // Update auth profile
    if (profilePhotoURL) {
      await updateProfile(user, { 
        displayName: `${formData.firstName} ${formData.surname}`,
        photoURL: profilePhotoURL
      });
    } else {
      await updateProfile(user, { 
        displayName: `${formData.firstName} ${formData.surname}`
      });
    }

    return { 
      success: true, 
      user, 
      userType: 'funder',
      userData: userData
    };
  } catch (error) {
    console.error('Funder registration error:', error);
    
    // User-friendly error messages
    let errorMessage = 'Registration failed';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'This email is already registered';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    }
    
    return { success: false, error: errorMessage };
  }
};

// Generic user registration (alternative approach)
export const registerUser = async (userType, firstName, surname, email, password, country, postalCode, profilePic) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Upload profile photo if provided
    let profilePhotoURL = null;
    if (profilePic) {
      profilePhotoURL = await uploadProfilePicture(profilePic, user.uid);
    }
    
    // Base user data
    const userData = {
      userType: userType,
      email: email,
      firstName: firstName,
      surname: surname,
      country: country,
      postalCode: postalCode,
      profilePhoto: profilePhotoURL,
      profileComplete: true,
      createdAt: serverTimestamp()
    };
    
    // Add user type specific fields
    if (userType === 'student') {
      userData.totalCampaigns = 0;
      userData.fundsRaised = 0;
    } else if (userType === 'funder') {
      userData.totalDonated = 0;
      userData.campaignsSupported = 0;
    }
    
    await setDoc(doc(db, 'users', user.uid), userData);
    
    // Update auth profile
    const updateData = { displayName: `${firstName} ${surname}` };
    if (profilePhotoURL) {
      updateData.photoURL = profilePhotoURL;
    }
    await updateProfile(user, updateData);

    return { 
      success: true, 
      user, 
      userType: userType,
      userData: userData
    };
  } catch (error) {
    console.error('User registration error:', error);
    
    let errorMessage = 'Registration failed';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'This email is already registered';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    }
    
    return { success: false, error: errorMessage };
  }
};

// Sign in (works for all user types)
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get user data from Firestore to determine user type
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      return { success: false, error: 'User profile not found' };
    }
    
    const userData = userDoc.data();

    return { 
      success: true, 
      user, 
      userType: userData.userType,
      userData: userData
    };
  } catch (error) {
    console.error('Sign in error:', error);
    let errorMessage = 'Failed to sign in';
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later';
    }
    
    return { success: false, error: errorMessage };
  }
};

// Sign out
export const logOut = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: error.message };
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    
    let errorMessage = 'Failed to send password reset email';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    }
    
    return { success: false, error: errorMessage };
  }
};

// Listen to auth state changes
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Get full user data including type
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          callback({ ...user, userData: userDoc.data() });
        } else {
          callback(user);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        callback(user);
      }
    } else {
      callback(null);
    }
  });
};

// Get current user data
export const getCurrentUserData = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    }
    return { success: false, error: 'User not found' };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return { success: false, error: error.message };
  }
};

// Check if user is admin
export const isAdmin = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.userType === 'admin';
    }
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Update user profile
export const updateUserProfile = async (uid, updates, profilePhotoFile = null) => {
  try {
    let profilePhotoURL = updates.profilePhoto; // Keep existing if no new file
    
    if (profilePhotoFile) {
      profilePhotoURL = await uploadProfilePicture(profilePhotoFile, uid);
      updates.profilePhoto = profilePhotoURL;
      
      // Update auth profile photo
      await updateProfile(auth.currentUser, { photoURL: profilePhotoURL });
    }
    
    await setDoc(doc(db, 'users', uid), updates, { merge: true });
    
    return { success: true, profilePhotoURL };
  } catch (error) {
    console.error('Profile update error:', error);
    return { success: false, error: error.message };
  }
};