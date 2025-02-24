import { collection, addDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import type { Task } from '../types/board';

const TASKS_COLLECTION = 'tasks';

export const createTask = async (boardId: string, task: Omit<Task, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, TASKS_COLLECTION), {
      ...task,
      boardId,
      createdAt: new Date()
    });
    return docRef;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const getTasksQuery = (boardId: string) => {
  return query(
    collection(db, TASKS_COLLECTION),
    where('boardId', '==', boardId),
    orderBy('createdAt', 'asc')
  );
};