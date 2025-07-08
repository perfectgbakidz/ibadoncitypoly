


import { Book, User, Loan, DashboardStats, UserRegistration, ChangePasswordData, UserDetails } from '../types';

const BASE_URL = 'https://fastapilibrary.onrender.com'; 

interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  body?: any;
}

const constructFullUrl = (path: string | null | undefined): string | null | undefined => {
    if (!path) {
        return path;
    }
    // If path is already a full URL, return it as is.
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    // Otherwise, prepend the base URL. Assumes path starts with '/'
    return `${BASE_URL}${path}`;
};


const apiFetch = async (endpoint: string, options: ApiFetchOptions = {}) => {
  const { method = 'GET', body } = options;

  const headers: HeadersInit = { ...options.headers };
  
  const token = localStorage.getItem('token');
  if (token) {
      headers['Authorization'] = `Bearer ${token}`;
  }
  
  let processedBody: BodyInit | undefined;
  
  if (body) {
    if (body instanceof URLSearchParams || body instanceof FormData) {
        // Let the browser set the Content-Type for these types
        processedBody = body;
    } else {
        // Default to JSON for plain objects
        headers['Content-Type'] = 'application/json';
        processedBody = JSON.stringify(body);
    }
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: processedBody,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'An unknown API error occurred' }));
      throw new Error(errorData.detail || `API request failed with status ${response.status}`);
    }
    
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return { success: true };
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    }

    return { success: true };

  } catch (error) {
    console.error('API Fetch Error:', error);
    throw error;
  }
};

// --- Auth ---
export const loginUser = async (matric_no: string, password: string): Promise<{access_token: string}> => {
    const body = new URLSearchParams();
    body.append('username', matric_no); // The backend endpoint expects 'username' key for matric_no
    body.append('password', password);
    
    return apiFetch('/auth/login', {
        method: 'POST',
        body: body,
    });
};

export const registerUser = async (userData: UserRegistration): Promise<{access_token: string}> => {
    return apiFetch('/auth/register', {
        method: 'POST',
        body: userData
    });
};

export const getMe = async (): Promise<User> => {
    const user = await apiFetch('/users/me');
    // Map profile_picture_url to camelCase and construct full URL
    return {
        ...user,
        profilePictureUrl: constructFullUrl(user.profile_picture_url),
    };
};


// --- Dashboard ---
export const getDashboardStats = async (): Promise<DashboardStats> => {
    const data = await apiFetch('/dashboard/summary');
    return {
        totalBooks: data.total_books || 0,
        borrowedBooks: data.borrowed_books || 0,
        overdueBooks: data.overdue_books || 0,
        totalStudents: data.total_students || 0,
        returnedBooks: data.returned_books || 0,
        pendingLoans: data.pending_loans || 0, // Added back
    };
};

// --- Books ---
export const getBooks = async (): Promise<Book[]> => {
    const booksFromApi = await apiFetch('/books/');
    if (!Array.isArray(booksFromApi)) return [];
    return booksFromApi.map(book => ({
        id: book.id,
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        quantity: book.quantity,
        availableQuantity: book.available_quantity,
        description: book.description,
        category: book.category,
        coverImageUrl: book.cover_image_url,
    }));
}

export const getBookById = async (id: number): Promise<Book> => {
    const book = await apiFetch(`/books/${id}`);
    return {
        ...book,
        availableQuantity: book.available_quantity,
        coverImageUrl: book.cover_image_url,
    };
};

export const createBook = async (bookData: Omit<Book, 'id'>, coverImageFile?: File | null): Promise<Book> => {
    const formData = new FormData();
    // The backend manages available_quantity on creation.
    const { availableQuantity, coverImageUrl, ...payload } = bookData as Book;

    Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            formData.append(key, String(value));
        }
    });

    if (coverImageFile) {
        formData.append('cover_image', coverImageFile);
    }

    return apiFetch('/books/', { method: 'POST', body: formData });
};

export const updateBook = async (bookData: Book, coverImageFile?: File | null): Promise<Book> => {
    const formData = new FormData();
    const { id, availableQuantity, coverImageUrl, ...payload } = bookData;

    Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            formData.append(key, String(value));
        }
    });
    
    if (coverImageFile) {
        formData.append('cover_image', coverImageFile);
    }
    
    return apiFetch(`/books/${id}`, { method: 'PUT', body: formData });
};

export const deleteBook = async (id: number) => {
    return apiFetch(`/books/${id}`, { method: 'DELETE' });
};

export const placeHold = async (bookId: number): Promise<{ detail: string }> => {
    return apiFetch(`/books/${bookId}/hold`, { method: 'POST' });
};

// --- Users ---
export const getUsers = async (): Promise<User[]> => apiFetch('/users/');

export const getUserDetails = async (id: number): Promise<UserDetails> => {
    const userDetails = await apiFetch(`/users/${id}/details`);
    // Map nested loan data for consistency
    const mappedLoans = userDetails.loans.map((loan: any) => ({
        id: loan.id,
        userId: userDetails.id,
        bookId: loan.book_id,
        bookTitle: loan.book_title,
        requestDate: loan.request_date || loan.borrowed_on,
        approvalDate: loan.approval_date || loan.borrowed_on,
        dueDate: loan.due_date,
        returnDate: loan.return_date || loan.returned_on,
        status: loan.status,
    }));
    return { 
        ...userDetails, 
        loans: mappedLoans, 
        profilePictureUrl: constructFullUrl(userDetails.profile_picture_url) 
    };
};

export const deleteUser = async (id: number) => {
    return apiFetch(`/users/${id}`, { method: 'DELETE' });
};

export const updateProfile = async (userData: Partial<Pick<User, 'name' | 'department'>>): Promise<User> => {
    return apiFetch('/users/me', { method: 'PUT', body: userData });
};

export const changePassword = async (passwordData: ChangePasswordData): Promise<{ detail: string }> => {
    return apiFetch('/users/me/password', { method: 'POST', body: passwordData });
};

export const uploadProfilePicture = async (formData: FormData): Promise<User> => {
    return apiFetch('/users/me/picture', { method: 'POST', body: formData });
};

export const forgotPassword = async (email: string): Promise<{ detail: string }> => {
    return apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: { email },
    });
};

export const resetPassword = async (token: string, new_password: string): Promise<{ detail:string }> => {
    return apiFetch('/auth/reset-password', {
        method: 'POST',
        body: { token, new_password },
    });
};

// --- Loans ---
export const getLoans = async (): Promise<Loan[]> => {
    const loansFromApi = await apiFetch('/loans/');
    if (!Array.isArray(loansFromApi)) return [];
    // Map snake_case from API to camelCase for frontend
    return loansFromApi.map((loan: any) => {
        let status = loan.status;
        if (loan.returned === true && status !== 'returned') {
            status = 'returned';
        }
        return {
            id: loan.id,
            userId: loan.user_id,
            bookId: loan.book_id,
            requestDate: loan.request_date || loan.borrowed_on,
            approvalDate: loan.approval_date || loan.borrowed_on,
            dueDate: loan.due_date,
            returnDate: loan.return_date,
            status: status,
        }
    });
};

export const requestBookLoan = async (bookId: number): Promise<{ detail: string }> => {
    return apiFetch('/loans/request', { method: 'POST', body: { book_id: bookId } });
};

export const returnBook = async (bookId: number): Promise<{ detail: string; fine?: number; }> => {
    return apiFetch(`/loans/return`, { method: 'POST', body: { book_id: bookId } });
};

export const approveLoan = async (loanId: number): Promise<{ detail: string }> => {
    return apiFetch(`/loans/${loanId}/approve`, { method: 'POST' });
};

export const rejectLoan = async (loanId: number): Promise<{ detail: string }> => {
    return apiFetch(`/loans/${loanId}/reject`, { method: 'POST' });
};