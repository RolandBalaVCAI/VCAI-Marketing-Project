import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Toast, { ToastContainer, useToast } from '../Toast';
import { renderHook, act } from '@testing-library/react';

describe('Toast', () => {
  const defaultProps = {
    id: 'toast-1',
    title: 'Test Toast',
    message: 'This is a test message',
    onClose: vi.fn()
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should render toast with title and message', () => {
    render(<Toast {...defaultProps} />);
    
    expect(screen.getByText('Test Toast')).toBeInTheDocument();
    expect(screen.getByText('This is a test message')).toBeInTheDocument();
  });

  it('should render success toast variant', () => {
    render(<Toast {...defaultProps} type="success" />);
    
    const toast = screen.getByText('Test Toast').closest('div');
    expect(toast).toHaveStyle({ 
      backgroundColor: expect.stringContaining('50') // Success background color
    });
  });

  it('should render error toast variant', () => {
    render(<Toast {...defaultProps} type="error" />);
    
    const toast = screen.getByText('Test Toast').closest('div');
    expect(toast).toHaveStyle({ 
      backgroundColor: expect.stringContaining('50') // Error background color
    });
  });

  it('should render warning toast variant', () => {
    render(<Toast {...defaultProps} type="warning" />);
    
    const toast = screen.getByText('Test Toast').closest('div');
    expect(toast).toHaveStyle({ 
      backgroundColor: expect.stringContaining('50') // Warning background color
    });
  });

  it('should render info toast variant by default', () => {
    render(<Toast {...defaultProps} />);
    
    const toast = screen.getByText('Test Toast').closest('div');
    expect(toast).toHaveStyle({ 
      backgroundColor: expect.stringContaining('50') // Info background color
    });
  });

  it('should show close button and handle close', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    
    render(<Toast {...defaultProps} />);
    
    const closeButton = screen.getByRole('button');
    await user.click(closeButton);
    
    // Wait for close animation
    act(() => {
      vi.advanceTimersByTime(300);
    });
    
    expect(defaultProps.onClose).toHaveBeenCalledWith('toast-1');
  });

  it('should auto-close after duration', () => {
    render(<Toast {...defaultProps} duration={5000} />);
    
    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    
    // Wait for close animation
    act(() => {
      vi.advanceTimersByTime(300);
    });
    
    expect(defaultProps.onClose).toHaveBeenCalledWith('toast-1');
  });

  it('should not auto-close when duration is 0', () => {
    render(<Toast {...defaultProps} duration={0} />);
    
    // Fast-forward time significantly
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('should show progress bar by default', () => {
    render(<Toast {...defaultProps} duration={5000} />);
    
    // Progress bar should be visible (it's a div with specific styles)
    const toast = screen.getByText('Test Toast').closest('div').parentElement;
    const progressBar = toast.querySelector('div[style*="position: absolute"][style*="bottom: 0"]');
    expect(progressBar).toBeInTheDocument();
  });

  it('should hide progress bar when showProgress is false', () => {
    render(<Toast {...defaultProps} showProgress={false} duration={5000} />);
    
    const toast = screen.getByText('Test Toast').closest('div').parentElement;
    const progressBar = toast.querySelector('div[style*="position: absolute"][style*="bottom: 0"]');
    expect(progressBar).not.toBeInTheDocument();
  });

  it('should render action button when provided', async () => {
    const mockAction = vi.fn();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    
    render(
      <Toast 
        {...defaultProps} 
        action={mockAction}
        actionText="Retry"
      />
    );
    
    const actionButton = screen.getByText('Retry');
    expect(actionButton).toBeInTheDocument();
    
    await user.click(actionButton);
    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it('should render without title', () => {
    render(<Toast {...defaultProps} title={undefined} />);
    
    expect(screen.queryByText('Test Toast')).not.toBeInTheDocument();
    expect(screen.getByText('This is a test message')).toBeInTheDocument();
  });

  it('should render without message', () => {
    render(<Toast {...defaultProps} message={undefined} />);
    
    expect(screen.getByText('Test Toast')).toBeInTheDocument();
    expect(screen.queryByText('This is a test message')).not.toBeInTheDocument();
  });

  it('should update progress bar over time', () => {
    render(<Toast {...defaultProps} duration={5000} />);
    
    // Check initial progress (should be 100%)
    const toast = screen.getByText('Test Toast').closest('div').parentElement;
    let progressBar = toast.querySelector('div[style*="position: absolute"][style*="bottom: 0"]');
    expect(progressBar).toHaveStyle({ width: '100%' });
    
    // Advance time by half duration
    act(() => {
      vi.advanceTimersByTime(2500);
    });
    
    // Progress should be approximately 50%
    progressBar = toast.querySelector('div[style*="position: absolute"][style*="bottom: 0"]');
    expect(progressBar.style.width).toMatch(/[4-6]\d%/); // Allow for timing variations
  });

  it('should handle different positions', () => {
    render(<Toast {...defaultProps} position="top-left" />);
    
    // Position is handled by ToastContainer, individual toasts don't have position logic
    expect(screen.getByText('Test Toast')).toBeInTheDocument();
  });
});

describe('ToastContainer', () => {
  const mockToasts = [
    {
      id: 'toast-1',
      type: 'success',
      title: 'Success',
      message: 'Operation completed',
      onClose: vi.fn()
    },
    {
      id: 'toast-2',
      type: 'error',
      title: 'Error',
      message: 'Something went wrong',
      onClose: vi.fn()
    }
  ];

  it('should render multiple toasts', () => {
    render(<ToastContainer toasts={mockToasts} onClose={vi.fn()} />);
    
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('should render in top-right position by default', () => {
    render(<ToastContainer toasts={mockToasts} onClose={vi.fn()} />);
    
    const container = screen.getByText('Success').closest('div').parentElement.parentElement;
    expect(container).toHaveStyle({
      position: 'fixed',
      top: '20px',
      right: '20px'
    });
  });

  it('should render in top-left position', () => {
    render(<ToastContainer toasts={mockToasts} position="top-left" onClose={vi.fn()} />);
    
    const container = screen.getByText('Success').closest('div').parentElement.parentElement;
    expect(container).toHaveStyle({
      position: 'fixed',
      top: '20px',
      left: '20px'
    });
  });

  it('should render in bottom-right position', () => {
    render(<ToastContainer toasts={mockToasts} position="bottom-right" onClose={vi.fn()} />);
    
    const container = screen.getByText('Success').closest('div').parentElement.parentElement;
    expect(container).toHaveStyle({
      position: 'fixed',
      bottom: '20px',
      right: '20px'
    });
  });

  it('should render in top-center position', () => {
    render(<ToastContainer toasts={mockToasts} position="top-center" onClose={vi.fn()} />);
    
    const container = screen.getByText('Success').closest('div').parentElement.parentElement;
    expect(container).toHaveStyle({
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)'
    });
  });

  it('should handle empty toasts array', () => {
    render(<ToastContainer toasts={[]} onClose={vi.fn()} />);
    
    // Container should still render but be empty
    expect(screen.queryByText('Success')).not.toBeInTheDocument();
    expect(screen.queryByText('Error')).not.toBeInTheDocument();
  });

  it('should use flex-direction column-reverse for bottom positions', () => {
    render(<ToastContainer toasts={mockToasts} position="bottom-right" onClose={vi.fn()} />);
    
    const container = screen.getByText('Success').closest('div').parentElement.parentElement;
    expect(container).toHaveStyle({
      flexDirection: 'column-reverse'
    });
  });
});

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should initialize with empty toasts array', () => {
    const { result } = renderHook(() => useToast());
    
    expect(result.current.toasts).toEqual([]);
  });

  it('should add toast with addToast', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      const id = result.current.addToast({
        type: 'success',
        title: 'Success',
        message: 'Test message'
      });
      
      expect(typeof id).toBe('number');
    });
    
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      type: 'success',
      title: 'Success',
      message: 'Test message'
    });
  });

  it('should remove toast with removeToast', () => {
    const { result } = renderHook(() => useToast());
    
    let toastId;
    act(() => {
      toastId = result.current.addToast({
        title: 'Test Toast'
      });
    });
    
    expect(result.current.toasts).toHaveLength(1);
    
    act(() => {
      result.current.removeToast(toastId);
    });
    
    expect(result.current.toasts).toHaveLength(0);
  });

  it('should add success toast with success method', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.success('Success Title', 'Success message');
    });
    
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      type: 'success',
      title: 'Success Title',
      message: 'Success message'
    });
  });

  it('should add error toast with error method', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.error('Error Title', 'Error message');
    });
    
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      type: 'error',
      title: 'Error Title',
      message: 'Error message'
    });
  });

  it('should add warning toast with warning method', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.warning('Warning Title', 'Warning message');
    });
    
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      type: 'warning',
      title: 'Warning Title',
      message: 'Warning message'
    });
  });

  it('should add info toast with info method', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.info('Info Title', 'Info message');
    });
    
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      type: 'info',
      title: 'Info Title',
      message: 'Info message'
    });
  });

  it('should add toast with custom options', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.success('Success', 'Message', {
        duration: 10000,
        action: vi.fn(),
        actionText: 'Retry'
      });
    });
    
    expect(result.current.toasts[0]).toMatchObject({
      type: 'success',
      title: 'Success',
      message: 'Message',
      duration: 10000,
      actionText: 'Retry'
    });
    expect(typeof result.current.toasts[0].action).toBe('function');
  });

  it('should handle multiple toasts', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.success('Success 1', 'Message 1');
      result.current.error('Error 1', 'Message 2');
      result.current.warning('Warning 1', 'Message 3');
    });
    
    expect(result.current.toasts).toHaveLength(3);
    expect(result.current.toasts[0].type).toBe('success');
    expect(result.current.toasts[1].type).toBe('error');
    expect(result.current.toasts[2].type).toBe('warning');
  });

  it('should generate unique IDs for toasts', () => {
    const { result } = renderHook(() => useToast());
    
    let id1, id2;
    act(() => {
      id1 = result.current.addToast({ title: 'Toast 1' });
      id2 = result.current.addToast({ title: 'Toast 2' });
    });
    
    expect(id1).not.toEqual(id2);
    expect(result.current.toasts[0].id).toBe(id1);
    expect(result.current.toasts[1].id).toBe(id2);
  });

  it('should return toast ID from convenience methods', () => {
    const { result } = renderHook(() => useToast());
    
    let successId, errorId;
    act(() => {
      successId = result.current.success('Success', 'Message');
      errorId = result.current.error('Error', 'Message');
    });
    
    expect(typeof successId).toBe('number');
    expect(typeof errorId).toBe('number');
    expect(successId).not.toEqual(errorId);
  });
});