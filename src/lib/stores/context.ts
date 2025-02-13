import { writable } from 'svelte/store';
import type { Firestore } from 'firebase/firestore';
import { db } from '../firebase';

export const firestore = writable<Firestore>(db);