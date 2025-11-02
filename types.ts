
export enum UserRole {
  STUDENT = 'Student',
  FACULTY = 'Faculty',
}

export enum Status {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  DENIED = 'Denied',
}

export enum RedemptionType {
  ALTERNATIVE_ASSESSMENT = 'Alternative Assessment',
  FLEXIBLE_TUTORIAL = 'Flexible Tutorial',
}

export interface Project {
  id: string;
  studentId: string;
  title: string;
  description: string;
  githubLink: string;
  screenshotFile?: File;
  screenshotUrl?: string;
  status: Status;
  creditsAwarded: number;
  submittedAt: Date;
  facultyComments?: string;
}

export interface RedemptionRequest {
  id: string;
  studentId: string;
  type: RedemptionType;
  creditsCost: number;
  status: Status;
  requestedAt: Date;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  credits: number;
}