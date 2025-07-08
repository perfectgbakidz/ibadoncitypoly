
export interface DashboardStats {
  totalBooks: number;
  borrowedBooks: number;
  overdueBooks: number;
  totalStudents: number;
  returnedBooks: number;
  pendingLoans: number; // Re-added for sidebar badge and admin card
}

export interface User {
  id: number;
  name: string;
  email: string;
  matric_no: string;
  department: string;
  role: 'admin' | 'student';
  profilePictureUrl?: string | null;
}

// For the new User Detail Page (Admin only)
export interface UserDetails extends User {
    loans: LoanWithDetails[];
    login_history: { timestamp: string; ip_address: string; }[];
}


export interface UserRegistration {
    name: string;
    matric_no: string;
    department: string;
    password: string;
    role: 'admin' | 'student';
    admin_code?: string;
}

export interface ChangePasswordData {
    current_password: string;
    new_password: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  quantity: number;
  availableQuantity: number; // New field for real-time availability
  description?: string; // For detail page
  category?: string; // For detail page & filtering
  coverImageUrl?: string; // For detail page
}

// API returns snake_case, we map to this camelCase object in the service
export interface Loan {
  id: number;
  userId: number;
  bookId: number;
  requestDate: string; // "YYYY-MM-DD"
  approvalDate: string | null;
  dueDate: string | null;
  returnDate: string | null; // "YYYY-MM-DD" or null
  status: 'pending' | 'approved' | 'rejected' | 'returned' | 'on-hold';
}

// For UI display purposes where user/book names are needed
export interface LoanWithDetails extends Loan {
    bookTitle: string;
    userName?: string;
    userMatric?: string;
}


export type ToastMessage = {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
};

export interface AuthContextType {
    user: User | null;
    login: (matric_no: string, password: string) => Promise<void>;
    register: (userData: UserRegistration) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    isLoading: boolean;
    pendingLoanCount: number; // New: for admin sidebar badge
    fetchPendingLoanCount: () => Promise<void>; // New
}