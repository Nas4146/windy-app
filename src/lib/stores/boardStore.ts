import { collection, addDoc, query, where, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { Board, Collaborator } from '../types/board';

const BOARDS_COLLECTION = 'boards';

export const boardsCollection = collection(db, BOARDS_COLLECTION);

export const createBoard = async (board: Omit<Board, 'id'>) => {
  try {
    const docRef = await addDoc(boardsCollection, board);
    console.log('Board created with ID:', docRef.id);
    return docRef;
  } catch (error) {
    console.error('Error creating board:', error);
    throw error;
  }
};

export const getBoardsQuery = (userId: string) => {
  return query(
    collection(db, BOARDS_COLLECTION),
    where('ownerId', '==', userId)
  );
};

export const shareBoard = async (boardId: string, collaborator: Omit<Collaborator, 'userId'>) => {
  try {
    const boardRef = doc(db, BOARDS_COLLECTION, boardId);
    const boardSnap = await getDoc(boardRef);
    
    if (!boardSnap.exists()) {
      throw new Error('Board not found');
    }

    const board = boardSnap.data() as Board;
    const existingCollaborator = board.collaborators?.find(c => c.email === collaborator.email);

    if (existingCollaborator) {
      throw new Error('User already has access to this board');
    }

    await updateDoc(boardRef, {
      collaborators: [...(board.collaborators || []), collaborator]
    });
  } catch (error) {
    console.error('Error sharing board:', error);
    throw error;
  }
};

export const getAllAccessibleBoardsQuery = (userId: string, userEmail: string) => {
  return query(
    collection(db, BOARDS_COLLECTION),
    where('ownerId', '==', userId),
    where('collaborators', 'array-contains', { email: userEmail })
  );
};

export const getSharedBoardsQuery = (userEmail: string) => {
  return query(
    collection(db, BOARDS_COLLECTION),
    where('collaborators', 'array-contains', userEmail)
  );
};

export const checkBoardAccess = (board: Board, userId: string, userEmail: string) => {
  if (board.ownerId === userId) return 'owner';
  
  const collaborator = board.collaborators?.find(c => c.email === userEmail);
  if (collaborator) return collaborator.accessLevel;
  
  return null;
};