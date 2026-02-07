import { createContext, useContext, useReducer, useCallback } from 'react';
import { toast } from 'react-toastify';

// Initial State
const initialState = {
  documents: [],
  notifications: [],
  userPreferences: {
    theme: 'light',
    notifications: true,
    emailAlerts: true,
    language: 'en',
    autoSave: true,
  },
  filters: {
    status: '',
    documentType: '',
    dateRange: null,
    searchQuery: '',
    department: '',
  },
  loading: {
    documents: false,
    notifications: false,
    user: false,
  },
  errors: {
    documents: null,
    notifications: null,
    user: null,
  },
  selectedDocument: null,
  selectedTab: 0,
};

// Action Types
const ActionTypes = {
  SET_DOCUMENTS: 'SET_DOCUMENTS',
  ADD_DOCUMENT: 'ADD_DOCUMENT',
  UPDATE_DOCUMENT: 'UPDATE_DOCUMENT',
  DELETE_DOCUMENT: 'DELETE_DOCUMENT',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  MARK_NOTIFICATION_READ: 'MARK_NOTIFICATION_READ',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS',
  SET_USER_PREFERENCES: 'SET_USER_PREFERENCES',
  SET_FILTERS: 'SET_FILTERS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_SELECTED_DOCUMENT: 'SET_SELECTED_DOCUMENT',
  CLEAR_SELECTED_DOCUMENT: 'CLEAR_SELECTED_DOCUMENT',
  SET_SELECTED_TAB: 'SET_SELECTED_TAB',
  RESET_STATE: 'RESET_STATE',
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_DOCUMENTS:
      return {
        ...state,
        documents: action.payload,
        loading: { ...state.loading, documents: false },
        errors: { ...state.errors, documents: null },
      };

    case ActionTypes.ADD_DOCUMENT:
      return {
        ...state,
        documents: [action.payload, ...state.documents],
      };

    case ActionTypes.UPDATE_DOCUMENT:
      return {
        ...state,
        documents: state.documents.map(doc =>
          doc._id === action.payload._id ? { ...doc, ...action.payload } : doc
        ),
        selectedDocument: 
          state.selectedDocument && state.selectedDocument._id === action.payload._id
            ? { ...state.selectedDocument, ...action.payload }
            : state.selectedDocument,
      };

    case ActionTypes.DELETE_DOCUMENT:
      return {
        ...state,
        documents: state.documents.filter(doc => doc._id !== action.payload),
        selectedDocument: 
          state.selectedDocument && state.selectedDocument._id === action.payload
            ? null
            : state.selectedDocument,
      };

    case ActionTypes.SET_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload,
        loading: { ...state.loading, notifications: false },
        errors: { ...state.errors, notifications: null },
      };

    case ActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications.slice(0, 49)], // Keep max 50 notifications
      };

    case ActionTypes.MARK_NOTIFICATION_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, read: true, readAt: new Date() }
            : notification
        ),
      };

    case ActionTypes.CLEAR_NOTIFICATIONS:
      return {
        ...state,
        notifications: [],
      };

    case ActionTypes.SET_USER_PREFERENCES:
      return {
        ...state,
        userPreferences: {
          ...state.userPreferences,
          ...action.payload,
        },
      };

    case ActionTypes.SET_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      };

    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          ...action.payload,
        },
      };

    case ActionTypes.SET_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          ...action.payload,
        },
        loading: {
          documents: false,
          notifications: false,
          user: false,
        },
      };

    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload]: null,
        },
      };

    case ActionTypes.SET_SELECTED_DOCUMENT:
      return {
        ...state,
        selectedDocument: action.payload,
      };

    case ActionTypes.CLEAR_SELECTED_DOCUMENT:
      return {
        ...state,
        selectedDocument: null,
      };

    case ActionTypes.SET_SELECTED_TAB:
      return {
        ...state,
        selectedTab: action.payload,
      };

    case ActionTypes.RESET_STATE:
      return initialState;

    default:
      return state;
  }
};

// Create Context
const AppContext = createContext();

// Provider Component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Actions
  const setDocuments = useCallback((documents) => {
    dispatch({ type: ActionTypes.SET_DOCUMENTS, payload: documents });
  }, []);

  const addDocument = useCallback((document) => {
    dispatch({ type: ActionTypes.ADD_DOCUMENT, payload: document });
    toast.success('Document added successfully');
  }, []);

  const updateDocument = useCallback((document) => {
    dispatch({ type: ActionTypes.UPDATE_DOCUMENT, payload: document });
    toast.success('Document updated successfully');
  }, []);

  const deleteDocument = useCallback((documentId) => {
    dispatch({ type: ActionTypes.DELETE_DOCUMENT, payload: documentId });
    toast.success('Document deleted successfully');
  }, []);

  const setNotifications = useCallback((notifications) => {
    dispatch({ type: ActionTypes.SET_NOTIFICATIONS, payload: notifications });
  }, []);

  const addNotification = useCallback((notification) => {
    const notificationWithId = {
      ...notification,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    dispatch({ type: ActionTypes.ADD_NOTIFICATION, payload: notificationWithId });
  }, []);

  const markNotificationRead = useCallback((notificationId) => {
    dispatch({ type: ActionTypes.MARK_NOTIFICATION_READ, payload: notificationId });
  }, []);

  const clearNotifications = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_NOTIFICATIONS });
    toast.info('All notifications cleared');
  }, []);

  const setUserPreferences = useCallback((preferences) => {
    dispatch({ type: ActionTypes.SET_USER_PREFERENCES, payload: preferences });
    toast.success('Preferences updated');
  }, []);

  const setFilters = useCallback((filters) => {
    dispatch({ type: ActionTypes.SET_FILTERS, payload: filters });
  }, []);

  const setLoading = useCallback((loading) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: loading });
  }, []);

  const setError = useCallback((error) => {
    const errorPayload = {};
    if (typeof error === 'string') {
      errorPayload.general = { message: error };
    } else if (error.type && error.message) {
      errorPayload[error.type] = error;
    } else {
      errorPayload.general = error;
    }
    dispatch({ type: ActionTypes.SET_ERROR, payload: errorPayload });
    
    // Show toast for general errors
    if (errorPayload.general?.message) {
      toast.error(errorPayload.general.message);
    }
  }, []);

  const clearError = useCallback((errorType) => {
    dispatch({ type: ActionTypes.CLEAR_ERROR, payload: errorType });
  }, []);

  const setSelectedDocument = useCallback((document) => {
    dispatch({ type: ActionTypes.SET_SELECTED_DOCUMENT, payload: document });
  }, []);

  const clearSelectedDocument = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_SELECTED_DOCUMENT });
  }, []);

  const setSelectedTab = useCallback((tabIndex) => {
    dispatch({ type: ActionTypes.SET_SELECTED_TAB, payload: tabIndex });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: ActionTypes.RESET_STATE });
  }, []);

  // Computed values
  const getFilteredDocuments = useCallback(() => {
    const { documents, filters } = state;
    
    return documents.filter(doc => {
      // Search filter
      if (filters.searchQuery) {
        const searchLower = filters.searchQuery.toLowerCase();
        const matchesSearch = 
          doc.title?.toLowerCase().includes(searchLower) ||
          doc.description?.toLowerCase().includes(searchLower) ||
          doc.documentType?.toLowerCase().includes(searchLower) ||
          doc.studentId?.username?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }
      
      // Status filter
      if (filters.status && doc.status !== filters.status) {
        return false;
      }
      
      // Document type filter
      if (filters.documentType && doc.documentType !== filters.documentType) {
        return false;
      }
      
      // Department filter
      if (filters.department && doc.currentDepartment !== filters.department) {
        return false;
      }
      
      // Date range filter
      if (filters.dateRange && filters.dateRange.start && filters.dateRange.end) {
        const docDate = new Date(doc.submissionDate);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        endDate.setHours(23, 59, 59, 999); // End of day
        
        if (docDate < startDate || docDate > endDate) {
          return false;
        }
      }
      
      return true;
    });
  }, [state.documents, state.filters]);

  const getUnreadNotificationsCount = useCallback(() => {
    return state.notifications.filter(n => !n.read).length;
  }, [state.notifications]);

  const getDocumentStats = useCallback(() => {
    const { documents } = state;
    
    return {
      total: documents.length,
      pending: documents.filter(d => d.status === 'pending').length,
      inReview: documents.filter(d => d.status === 'in-review').length,
      approved: documents.filter(d => d.status === 'approved').length,
      rejected: documents.filter(d => d.status === 'rejected').length,
      returned: documents.filter(d => d.status === 'returned').length,
    };
  }, [state.documents]);

  const value = {
    state,
    actions: {
      setDocuments,
      addDocument,
      updateDocument,
      deleteDocument,
      setNotifications,
      addNotification,
      markNotificationRead,
      clearNotifications,
      setUserPreferences,
      setFilters,
      setLoading,
      setError,
      clearError,
      setSelectedDocument,
      clearSelectedDocument,
      setSelectedTab,
      resetState,
    },
    computed: {
      filteredDocuments: getFilteredDocuments(),
      unreadNotificationsCount: getUnreadNotificationsCount(),
      documentStats: getDocumentStats(),
    },
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Initializer for App component
export const initAppState = (user) => {
  return {
    ...initialState,
    userPreferences: {
      ...initialState.userPreferences,
      theme: localStorage.getItem('theme') || 'light',
      language: localStorage.getItem('language') || 'en',
    },
    filters: {
      ...initialState.filters,
      department: user?.department || '',
    },
  };
};