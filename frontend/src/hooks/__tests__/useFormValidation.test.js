import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useFormValidation, validationRules } from '../useFormValidation';

describe('useFormValidation', () => {
  const initialValues = {
    name: '',
    email: '',
    age: ''
  };

  const rules = {
    name: {
      required: true,
      minLength: 2,
      maxLength: 50
    },
    email: {
      required: true,
      email: true
    },
    age: {
      required: true,
      minValue: 18,
      maxValue: 100
    }
  };

  it('should initialize with default values', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, rules)
    );

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.isValid).toBe(true);
    expect(result.current.isDirty).toBe(false);
    expect(result.current.hasErrors).toBe(false);
  });

  it('should handle field changes', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, rules)
    );

    act(() => {
      result.current.handleChange('name', 'John Doe');
    });

    expect(result.current.values.name).toBe('John Doe');
    expect(result.current.isDirty).toBe(true);
    expect(result.current.touched.name).toBe(true);
  });

  it('should validate required fields', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, rules, { validateOnChange: true })
    );

    act(() => {
      result.current.handleChange('name', '');
    });

    expect(result.current.errors.name).toBe('name is required');
    expect(result.current.isValid).toBe(false);
    expect(result.current.hasErrors).toBe(true);
  });

  it('should validate minimum length', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, rules, { validateOnChange: true })
    );

    act(() => {
      result.current.handleChange('name', 'J');
    });

    expect(result.current.errors.name).toBe('name must be at least 2 characters');
  });

  it('should validate maximum length', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, rules, { validateOnChange: true })
    );

    const longName = 'a'.repeat(51);
    
    act(() => {
      result.current.handleChange('name', longName);
    });

    expect(result.current.errors.name).toBe('name must be no more than 50 characters');
  });

  it('should validate email format', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, rules, { validateOnChange: true })
    );

    act(() => {
      result.current.handleChange('email', 'invalid-email');
    });

    expect(result.current.errors.email).toBe('email must be a valid email address');

    act(() => {
      result.current.handleChange('email', 'valid@email.com');
    });

    expect(result.current.errors.email).toBeNull();
  });

  it('should validate minimum value', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, rules, { validateOnChange: true })
    );

    act(() => {
      result.current.handleChange('age', '15');
    });

    expect(result.current.errors.age).toBe('age must be at least 18');
  });

  it('should validate maximum value', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, rules, { validateOnChange: true })
    );

    act(() => {
      result.current.handleChange('age', '105');
    });

    expect(result.current.errors.age).toBe('age must be no more than 100');
  });

  it('should validate with custom messages', () => {
    const customRules = {
      name: {
        required: true,
        requiredMessage: 'Please enter your name'
      }
    };

    const { result } = renderHook(() => 
      useFormValidation(initialValues, customRules, { validateOnChange: true })
    );

    act(() => {
      result.current.handleChange('name', '');
    });

    expect(result.current.errors.name).toBe('Please enter your name');
  });

  it('should validate with custom validation function', () => {
    const customRules = {
      name: {
        validate: (value) => {
          if (value && value.toLowerCase().includes('admin')) {
            return 'Name cannot contain "admin"';
          }
          return null;
        }
      }
    };

    const { result } = renderHook(() => 
      useFormValidation(initialValues, customRules, { validateOnChange: true })
    );

    act(() => {
      result.current.handleChange('name', 'admin-user');
    });

    expect(result.current.errors.name).toBe('Name cannot contain "admin"');
  });

  it('should validate with pattern', () => {
    const patternRules = {
      code: {
        pattern: /^[A-Z]{3}\d{3}$/,
        patternMessage: 'Code must be 3 uppercase letters followed by 3 digits'
      }
    };

    const { result } = renderHook(() => 
      useFormValidation({ code: '' }, patternRules, { validateOnChange: true })
    );

    act(() => {
      result.current.handleChange('code', 'abc123');
    });

    expect(result.current.errors.code).toBe('Code must be 3 uppercase letters followed by 3 digits');

    act(() => {
      result.current.handleChange('code', 'ABC123');
    });

    expect(result.current.errors.code).toBeNull();
  });

  it('should handle blur validation', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, rules, { validateOnBlur: true, validateOnChange: false })
    );

    act(() => {
      result.current.handleChange('name', '');
      result.current.handleBlur('name');
    });

    expect(result.current.errors.name).toBe('name is required');
    expect(result.current.touched.name).toBe(true);
  });

  it('should handle form submission', async () => {
    const mockOnSubmit = vi.fn().mockResolvedValue();
    
    const { result } = renderHook(() => 
      useFormValidation(initialValues, rules)
    );

    // Fill valid data
    act(() => {
      result.current.handleChange('name', 'John Doe');
      result.current.handleChange('email', 'john@example.com');
      result.current.handleChange('age', '25');
    });

    let isValid;
    await act(async () => {
      isValid = await result.current.handleSubmit(mockOnSubmit);
    });

    expect(isValid).toBe(true);
    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      age: '25'
    });
  });

  it('should prevent submission with invalid data', async () => {
    const mockOnSubmit = vi.fn();
    
    const { result } = renderHook(() => 
      useFormValidation(initialValues, rules)
    );

    let isValid;
    await act(async () => {
      isValid = await result.current.handleSubmit(mockOnSubmit);
    });

    expect(isValid).toBe(false);
    expect(mockOnSubmit).not.toHaveBeenCalled();
    expect(result.current.hasErrors).toBe(true);
    
    // All fields should be marked as touched after submission attempt
    expect(result.current.touched.name).toBe(true);
    expect(result.current.touched.email).toBe(true);
    expect(result.current.touched.age).toBe(true);
  });

  it('should handle submission errors', async () => {
    const mockError = new Error('Submission failed');
    const mockOnSubmit = vi.fn().mockRejectedValue(mockError);
    
    const { result } = renderHook(() => 
      useFormValidation({ name: 'Valid Name' }, { name: { required: true } })
    );

    let isValid;
    await act(async () => {
      isValid = await result.current.handleSubmit(mockOnSubmit);
    });

    expect(isValid).toBe(true); // Form validation passed
    expect(mockOnSubmit).toHaveBeenCalled();
    expect(result.current.isSubmitting).toBe(false);
  });

  it('should reset form', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, rules)
    );

    // Make changes
    act(() => {
      result.current.handleChange('name', 'John Doe');
      result.current.handleChange('email', 'invalid-email');
    });

    expect(result.current.isDirty).toBe(true);
    expect(result.current.hasErrors).toBe(true);

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.isDirty).toBe(false);
    expect(result.current.hasErrors).toBe(false);
  });

  it('should reset with new initial values', () => {
    const newInitialValues = { name: 'Jane Doe', email: 'jane@example.com', age: '30' };
    
    const { result } = renderHook(() => 
      useFormValidation(initialValues, rules)
    );

    act(() => {
      result.current.reset(newInitialValues);
    });

    expect(result.current.values).toEqual(newInitialValues);
    expect(result.current.isDirty).toBe(false);
  });

  it('should set field value programmatically', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, rules)
    );

    act(() => {
      result.current.setValue('name', 'Programmatically Set');
    });

    expect(result.current.values.name).toBe('Programmatically Set');
    expect(result.current.isDirty).toBe(true);
  });

  it('should set field error programmatically', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, rules)
    );

    act(() => {
      result.current.setError('name', 'Custom error message');
    });

    expect(result.current.errors.name).toBe('Custom error message');
    expect(result.current.hasErrors).toBe(true);
    expect(result.current.isValid).toBe(false);
  });

  it('should set multiple errors', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, rules)
    );

    const serverErrors = {
      name: 'Name already exists',
      email: 'Email is not valid'
    };

    act(() => {
      result.current.setFormErrors(serverErrors);
    });

    expect(result.current.errors.name).toBe('Name already exists');
    expect(result.current.errors.email).toBe('Email is not valid');
  });

  it('should return field props for input components', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, rules)
    );

    act(() => {
      result.current.handleChange('name', 'Test Name');
      result.current.setError('name', 'Test error');
      result.current.handleBlur('name');
    });

    const fieldProps = result.current.getFieldProps('name');

    expect(fieldProps.value).toBe('Test Name');
    expect(fieldProps.error).toBe('Test error');
    expect(typeof fieldProps.onChange).toBe('function');
    expect(typeof fieldProps.onBlur).toBe('function');
  });

  it('should handle field props onChange event', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, rules)
    );

    const fieldProps = result.current.getFieldProps('name');
    const mockEvent = { target: { value: 'Event Value' } };

    act(() => {
      fieldProps.onChange(mockEvent);
    });

    expect(result.current.values.name).toBe('Event Value');
  });

  it('should handle field props onChange with direct value', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, rules)
    );

    const fieldProps = result.current.getFieldProps('name');

    act(() => {
      fieldProps.onChange('Direct Value');
    });

    expect(result.current.values.name).toBe('Direct Value');
  });

  it('should show touched errors only', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, rules, { validateOnChange: true })
    );

    // Create error but don't touch field
    act(() => {
      result.current.handleChange('name', '', false); // Don't touch
      result.current.setError('name', 'Error message');
    });

    expect(result.current.touchedWithErrors).toEqual({});

    // Touch the field
    act(() => {
      result.current.handleBlur('name');
    });

    expect(result.current.touchedWithErrors.name).toBe('Error message');
  });

  it('should disable validation options', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, rules, { 
        validateOnChange: false, 
        validateOnBlur: false 
      })
    );

    act(() => {
      result.current.handleChange('name', ''); // Invalid value
      result.current.handleBlur('name');
    });

    expect(result.current.errors.name).toBeUndefined();
  });
});

describe('validationRules helpers', () => {
  it('should create required rule', () => {
    const rule = validationRules.required('Custom required message');
    
    expect(rule).toEqual({
      required: true,
      requiredMessage: 'Custom required message'
    });
  });

  it('should create email rule', () => {
    const rule = validationRules.email('Custom email message');
    
    expect(rule).toEqual({
      email: true,
      emailMessage: 'Custom email message'
    });
  });

  it('should create minLength rule', () => {
    const rule = validationRules.minLength(5, 'Too short');
    
    expect(rule).toEqual({
      minLength: 5,
      minLengthMessage: 'Too short'
    });
  });

  it('should create maxLength rule', () => {
    const rule = validationRules.maxLength(10, 'Too long');
    
    expect(rule).toEqual({
      maxLength: 10,
      maxLengthMessage: 'Too long'
    });
  });

  it('should create minValue rule', () => {
    const rule = validationRules.minValue(18, 'Too young');
    
    expect(rule).toEqual({
      minValue: 18,
      minValueMessage: 'Too young'
    });
  });

  it('should create maxValue rule', () => {
    const rule = validationRules.maxValue(65, 'Too old');
    
    expect(rule).toEqual({
      maxValue: 65,
      maxValueMessage: 'Too old'
    });
  });

  it('should create pattern rule', () => {
    const pattern = /^\d+$/;
    const rule = validationRules.pattern(pattern, 'Numbers only');
    
    expect(rule).toEqual({
      pattern,
      patternMessage: 'Numbers only'
    });
  });

  it('should create custom rule', () => {
    const validateFn = (value) => value === 'test' ? null : 'Must be test';
    const rule = validationRules.custom(validateFn, 'Custom message');
    
    expect(rule).toEqual({
      validate: validateFn,
      customMessage: 'Custom message'
    });
  });
});