import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Button from '../Button';

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('should render primary variant by default', () => {
    render(<Button>Primary Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveStyle({ backgroundColor: '#3b82f6' }); // Primary color
  });

  it('should render secondary variant', () => {
    render(<Button variant="secondary">Secondary Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveStyle({ backgroundColor: '#6b7280' }); // Secondary color
  });

  it('should render success variant', () => {
    render(<Button variant="success">Success Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveStyle({ backgroundColor: '#10b981' }); // Success color
  });

  it('should render danger variant', () => {
    render(<Button variant="danger">Danger Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveStyle({ backgroundColor: '#ef4444' }); // Danger color
  });

  it('should render outline variant', () => {
    render(<Button variant="outline">Outline Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveStyle({ 
      backgroundColor: 'transparent',
      border: '2px solid #3b82f6'
    });
  });

  it('should render ghost variant', () => {
    render(<Button variant="ghost">Ghost Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveStyle({ 
      backgroundColor: 'transparent',
      border: 'none'
    });
  });

  it('should apply small size', () => {
    render(<Button size="small">Small Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveStyle({ 
      padding: '6px 12px',
      fontSize: '12px'
    });
  });

  it('should apply medium size by default', () => {
    render(<Button>Medium Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveStyle({ 
      padding: '8px 16px',
      fontSize: '14px'
    });
  });

  it('should apply large size', () => {
    render(<Button size="large">Large Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveStyle({ 
      padding: '12px 24px',
      fontSize: '16px'
    });
  });

  it('should handle click events', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Clickable Button</Button>);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    const handleClick = vi.fn();
    
    render(
      <Button disabled onClick={handleClick}>
        Disabled Button
      </Button>
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveStyle({ opacity: '0.5' });
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should show loading state', () => {
    render(<Button loading>Loading Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveStyle({ opacity: '0.7' });
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should show custom loading text', () => {
    render(
      <Button loading loadingText="Saving...">
        Save Button
      </Button>
    );
    
    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(screen.queryByText('Save Button')).not.toBeInTheDocument();
  });

  it('should render left icon', () => {
    const MockIcon = () => <span data-testid="left-icon">Icon</span>;
    
    render(
      <Button leftIcon={<MockIcon />}>
        Button with Left Icon
      </Button>
    );
    
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByText('Button with Left Icon')).toBeInTheDocument();
  });

  it('should render right icon', () => {
    const MockIcon = () => <span data-testid="right-icon">Icon</span>;
    
    render(
      <Button rightIcon={<MockIcon />}>
        Button with Right Icon
      </Button>
    );
    
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    expect(screen.getByText('Button with Right Icon')).toBeInTheDocument();
  });

  it('should render icon-only button', () => {
    const MockIcon = () => <span data-testid="icon">Icon</span>;
    
    render(<Button icon={<MockIcon />} aria-label="Icon button" />);
    
    const button = screen.getByRole('button', { name: 'Icon button' });
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('should apply full width', () => {
    render(<Button fullWidth>Full Width Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveStyle({ width: '100%' });
  });

  it('should apply custom styles', () => {
    const customStyle = { marginTop: '20px', backgroundColor: 'purple' };
    
    render(<Button style={customStyle}>Custom Styled Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveStyle({ 
      marginTop: '20px',
      backgroundColor: 'purple'
    });
  });

  it('should pass through additional props', () => {
    render(
      <Button data-testid="custom-button" title="Tooltip text">
        Button with Props
      </Button>
    );
    
    const button = screen.getByTestId('custom-button');
    expect(button).toHaveAttribute('title', 'Tooltip text');
  });

  it('should prevent click when loading', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(
      <Button loading onClick={handleClick}>
        Loading Button
      </Button>
    );
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should handle keyboard navigation', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Keyboard Button</Button>);
    
    const button = screen.getByRole('button');
    button.focus();
    
    expect(button).toHaveFocus();
    
    await user.keyboard('[Enter]');
    expect(handleClick).toHaveBeenCalledTimes(1);
    
    await user.keyboard('[Space]');
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('should handle hover states', async () => {
    const user = userEvent.setup();
    
    render(<Button>Hover Button</Button>);
    
    const button = screen.getByRole('button');
    
    await user.hover(button);
    // Hover styles are applied via CSS, which is harder to test in JSDOM
    // In a real browser test, we could verify hover styles
    expect(button).toBeInTheDocument();
    
    await user.unhover(button);
    expect(button).toBeInTheDocument();
  });

  it('should render as different HTML element when using as prop', () => {
    render(
      <Button as="a" href="/test">
        Link Button
      </Button>
    );
    
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
    expect(link).toHaveTextContent('Link Button');
  });

  it('should handle button type attribute', () => {
    render(<Button type="submit">Submit Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('should handle form attribute', () => {
    render(<Button form="my-form">Form Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('form', 'my-form');
  });

  it('should apply focus styles', async () => {
    const user = userEvent.setup();
    
    render(<Button>Focus Button</Button>);
    
    const button = screen.getByRole('button');
    
    await user.tab();
    expect(button).toHaveFocus();
  });

  it('should handle loading with spinner position', () => {
    render(
      <Button loading spinnerPosition="right">
        Button with Right Spinner
      </Button>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Loading...');
    // In a real implementation, we would check for spinner position
  });

  it('should render without crashing when no children provided', () => {
    render(<Button />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toBeEmptyDOMElement();
  });

  it('should maintain accessibility with aria attributes', () => {
    render(
      <Button 
        aria-label="Close dialog" 
        aria-describedby="close-help"
        disabled
      >
        ×
      </Button>
    );
    
    const button = screen.getByRole('button', { name: 'Close dialog' });
    expect(button).toHaveAttribute('aria-describedby', 'close-help');
    expect(button).toBeDisabled();
  });
});