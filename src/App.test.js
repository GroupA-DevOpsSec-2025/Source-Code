import { render, screen } from '@testing-library/react';
import App from './App';

test('renders todo app components', () => {
  render(<App />);
  
  // Test for input field - using role instead of placeholder
  const inputElement = screen.getByRole('textbox');
  expect(inputElement).toBeInTheDocument();
  
  // Test for add button - more specific text match
  const addButton = screen.getByRole('button', { name: /add todo/i });
  expect(addButton).toBeInTheDocument();
  
  // Test for empty todo list
  const emptyList = screen.getByRole('list');
  expect(emptyList).toBeInTheDocument();
  expect(emptyList.children).toHaveLength(0);
});