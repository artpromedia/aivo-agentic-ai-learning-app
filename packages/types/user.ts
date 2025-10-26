// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'teacher' | 'parent' | 'learner';
  createdAt: Date;
  updatedAt: Date;
}

export interface Parent extends User {
  role: 'parent';
  children: string[]; // learner IDs
}

export interface Teacher extends User {
  role: 'teacher';
  students: string[]; // learner IDs
  district?: string;
}
