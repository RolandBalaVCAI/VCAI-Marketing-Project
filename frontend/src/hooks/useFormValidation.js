import { useState, useCallback, useMemo } from 'react';

export const useFormValidation = (initialValues = {}, validationRules = {}, options = {}) => {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    touchOnChange = true
  } = options;
  
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Validate single field
  const validateField = useCallback((name, value) => {
    const rule = validationRules[name];
    if (!rule) return null;
    
    // Required validation
    if (rule.required && (!value || value.toString().trim() === '')) {
      return rule.requiredMessage || `${name} is required`;
    }
    
    // Min length validation
    if (rule.minLength && value && value.length < rule.minLength) {
      return rule.minLengthMessage || `${name} must be at least ${rule.minLength} characters`;
    }
    
    // Max length validation
    if (rule.maxLength && value && value.length > rule.maxLength) {
      return rule.maxLengthMessage || `${name} must be no more than ${rule.maxLength} characters`;
    }
    
    // Min value validation
    if (rule.minValue !== undefined && value !== undefined && Number(value) < rule.minValue) {
      return rule.minValueMessage || `${name} must be at least ${rule.minValue}`;
    }
    
    // Max value validation
    if (rule.maxValue !== undefined && value !== undefined && Number(value) > rule.maxValue) {
      return rule.maxValueMessage || `${name} must be no more than ${rule.maxValue}`;
    }
    
    // Pattern validation
    if (rule.pattern && value && !rule.pattern.test(value)) {
      return rule.patternMessage || `${name} has invalid format`;
    }
    
    // Email validation
    if (rule.email && value) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        return rule.emailMessage || `${name} must be a valid email address`;
      }
    }
    
    // Custom validation function
    if (rule.validate && typeof rule.validate === 'function') {
      const customError = rule.validate(value, values);
      if (customError) return customError;
    }
    
    return null;
  }, [validationRules, values]);
  
  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;
    
    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  }, [validationRules, values, validateField]);
  
  // Handle field change
  const handleChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (touchOnChange) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }
    
    if (validateOnChange) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [validateField, validateOnChange, touchOnChange]);
  
  // Handle field blur
  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    if (validateOnBlur) {
      const error = validateField(name, values[name]);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [validateField, validateOnBlur, values]);
  
  // Handle form submission
  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true);
    
    // Mark all fields as touched
    const allTouched = Object.keys(validationRules).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);
    
    // Validate form
    const isValid = validateForm();
    
    if (isValid && onSubmit) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }
    
    setIsSubmitting(false);
    return isValid;
  }, [values, validationRules, validateForm]);
  
  // Reset form
  const reset = useCallback((newInitialValues = initialValues) => {
    setValues(newInitialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);
  
  // Set field value programmatically
  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);
  
  // Set field error programmatically
  const setError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);
  
  // Set multiple errors (useful for server-side validation)
  const setFormErrors = useCallback((newErrors) => {
    setErrors(prev => ({ ...prev, ...newErrors }));
  }, []);
  
  // Computed values
  const isValid = useMemo(() => {
    return Object.keys(errors).every(key => !errors[key]);
  }, [errors]);
  
  const isDirty = useMemo(() => {
    return Object.keys(values).some(key => values[key] !== initialValues[key]);
  }, [values, initialValues]);
  
  const hasErrors = useMemo(() => {
    return Object.keys(errors).some(key => errors[key]);
  }, [errors]);
  
  const touchedWithErrors = useMemo(() => {
    return Object.keys(errors).reduce((acc, key) => {
      if (touched[key] && errors[key]) {
        acc[key] = errors[key];
      }
      return acc;
    }, {});
  }, [errors, touched]);
  
  // Helper to get field props for input components
  const getFieldProps = useCallback((name) => ({
    value: values[name] || '',
    error: touched[name] ? errors[name] : null,
    onChange: (e) => {
      const value = e.target ? e.target.value : e;
      handleChange(name, value);
    },
    onBlur: () => handleBlur(name)
  }), [values, errors, touched, handleChange, handleBlur]);
  
  return {
    // Values and state
    values,
    errors,
    touched,
    isSubmitting,
    
    // Computed values
    isValid,
    isDirty,
    hasErrors,
    touchedWithErrors,
    
    // Actions
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValue,
    setError,
    setFormErrors,
    validateField,
    validateForm,
    getFieldProps
  };
};

// Predefined validation rules
export const validationRules = {
  required: (message) => ({
    required: true,
    requiredMessage: message
  }),
  
  email: (message) => ({
    email: true,
    emailMessage: message
  }),
  
  minLength: (length, message) => ({
    minLength: length,
    minLengthMessage: message
  }),
  
  maxLength: (length, message) => ({
    maxLength: length,
    maxLengthMessage: message
  }),
  
  minValue: (value, message) => ({
    minValue: value,
    minValueMessage: message
  }),
  
  maxValue: (value, message) => ({
    maxValue: value,
    maxValueMessage: message
  }),
  
  pattern: (regex, message) => ({
    pattern: regex,
    patternMessage: message
  }),
  
  custom: (validateFn, message) => ({
    validate: validateFn,
    customMessage: message
  })
};