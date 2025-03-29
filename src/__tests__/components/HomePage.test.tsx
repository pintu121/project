import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../../pages/HomePage';

describe('HomePage', () => {
  const renderHomePage = () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
  };

  describe('Layout and Responsiveness', () => {
    it('renders all main sections', () => {
      renderHomePage();
      expect(screen.getByText('Hello, User!')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search topics...')).toBeInTheDocument();
      expect(screen.getByText('Continue Learning')).toBeInTheDocument();
    });

    // Add more layout tests
  });

  describe('Search Functionality', () => {
    it('handles search input correctly', () => {
      renderHomePage();
      const searchInput = screen.getByPlaceholderText('Search topics...');
      fireEvent.change(searchInput, { target: { value: 'React' } });
      expect(searchInput.value).toBe('React');
    });

    // Add more search tests
  });

  describe('Navigation', () => {
    it('navigates to test page on quick test click', () => {
      renderHomePage();
      const quickTestButton = screen.getByText('Quick Test');
      fireEvent.click(quickTestButton);
      // Add navigation assertion
    });

    // Add more navigation tests
  });
});