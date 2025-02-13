import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { Board, Column, Task } from '../types/board';

const BOARDS_COLLECTION = 'boards';
const TASKS_COLLECTION = 'tasks';

export const boardsCollection = collection(db, BOARDS_COLLECTION);
export const tasksCollection = collection(db, TASKS_COLLECTION);

export const createBoard = async (board: Omit<Board, 'id'>) => {
  return await addDoc(boardsCollection, board);
};

export const updateTask = async (taskId: string, updates: Partial<Task>) => {
  const taskRef = doc(tasksCollection, taskId);
  return await updateDoc(taskRef, updates);
};