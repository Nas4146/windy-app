import { collection, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { UserProfile } from '../types/board';

const USERS_COLLECTION = 'users';

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    console.log('getUserProfile called with userId:', userId);
    
    try {
        const docRef = doc(db, USERS_COLLECTION, userId);
        console.log('Fetching document from collection:', USERS_COLLECTION);
        
        const docSnap = await getDoc(docRef);
        console.log('Document exists:', docSnap.exists());
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log('Raw document data:', data);
            
            // Check data structure
            console.log('Date fields:', {
                createdAtType: typeof data.createdAt,
                updatedAtType: typeof data.updatedAt,
                hasToDate: !!data.createdAt?.toDate
            });

            const profile = {
                ...data,
                createdAt: typeof data.createdAt === 'string' 
                    ? data.createdAt 
                    : data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                updatedAt: typeof data.updatedAt === 'string' 
                    ? data.updatedAt 
                    : data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
            } as UserProfile;

            console.log('Transformed profile:', profile);
            return profile;
        }
        
        console.log('No document found');
        return null;
    } catch (error) {
        console.error('Error in getUserProfile:', error);
        throw error;
    }
}

export async function createUserProfile(data: { user: any, displayName: string }): Promise<UserProfile> {
    console.log('Creating user profile with data:', {
        ...data,
        user: {
            ...data.user,
            sub: data.user.sub // Make sure sub exists
        }
    });

    if (!data.user.sub) {
        console.error('No user ID (sub) provided');
        throw new Error('Invalid user data');
    }

    const now = new Date().toISOString();
    const userProfile: UserProfile = {
        id: data.user.sub,
        email: data.user.email,
        displayName: data.displayName,
        createdAt: now,
        updatedAt: now
    };

    try {
        const userRef = doc(db, USERS_COLLECTION, data.user.sub);
        await setDoc(userRef, userProfile);
        
        // Verify the write
        const verification = await getDoc(userRef);
        if (!verification.exists()) {
            throw new Error('Profile write verification failed');
        }
        
        return userProfile;
    } catch (error) {
        console.error('Error creating user profile:', error);
        throw error;
    }
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    try {
        const userRef = doc(db, USERS_COLLECTION, userId);
        
        // Add updatedAt timestamp
        const updatedData = {
            ...updates,
            updatedAt: new Date().toISOString()
        };

        await updateDoc(userRef, updatedData);
        console.log('Profile updated successfully');
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
}