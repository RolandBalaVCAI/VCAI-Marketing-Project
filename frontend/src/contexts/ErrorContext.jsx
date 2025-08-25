import React, { createContext, useContext, useReducer } from 'react';

const ErrorContext = createContext();

const errorReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ERROR':
      return {
        ...state,
        errors: [...state.errors, {
          id: Date.now(),
          ...action.payload,
          timestamp: new Date().toISOString()
        }]
      };
      
    case 'REMOVE_ERROR':
      return {
        ...state,
        errors: state.errors.filter(error => error.id !== action.payload.id)
      };
      
    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: []
      };
      
    case 'SET_GLOBAL_ERROR':
      return {
        ...state,
        globalError: action.payload
      };
      
    case 'CLEAR_GLOBAL_ERROR':
      return {
        ...state,
        globalError: null
      };
      
    default:
      return state;
  }
};

export const ErrorProvider = ({ children }) => {
  const [state, dispatch] = useReducer(errorReducer, {
    errors: [],
    globalError: null
  });
  
  const addError = (error) => {
    dispatch({ type: 'ADD_ERROR', payload: error });
  };
  
  const removeError = (id) => {
    dispatch({ type: 'REMOVE_ERROR', payload: { id } });
  };
  
  const clearErrors = () => {
    dispatch({ type: 'CLEAR_ERRORS' });
  };
  
  const setGlobalError = (error) => {
    dispatch({ type: 'SET_GLOBAL_ERROR', payload: error });
  };
  
  const clearGlobalError = () => {
    dispatch({ type: 'CLEAR_GLOBAL_ERROR' });
  };
  
  return (
    <ErrorContext.Provider value={{
      ...state,
      addError,
      removeError,
      clearErrors,
      setGlobalError,
      clearGlobalError
    }}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};