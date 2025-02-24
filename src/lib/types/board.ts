export interface Task {
  id: string;
  title: string;
  description: string;
  columnId: string;
  order: number;
  createdAt: Date;
  createdBy?: string; // Will be used later with user management
  assignedTo?: string; // Will be used later with user management
}

export interface Column {
  id: string;
  title: string;
  order: number;
}

export interface Collaborator {
  userId: string;
  email: string;
  accessLevel: 'read-only' | 'can-edit';
}

export interface Board {
  id: string;
  title: string;
  columns: Column[];
  ownerId: string; 
  collaborators: Collaborator[];
}

export interface UserProfile {
  id: string;           // Auth0 sub
  email: string;        // Auth0 email
  displayName: string;  // Custom display name
  avatarUrl?: string;   // Profile picture URL
  createdAt: string;    // ISO string date
  updatedAt: string;    // ISO string date
}