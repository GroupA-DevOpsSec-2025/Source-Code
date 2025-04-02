import { render, screen } from '@testing-library/react';
import App from './App';

test('renders todo app components', () => {
  render(<App />);
  
  // Test for input field
  const inputElement = screen.getByPlaceholderText(''); // or more specific if you add placeholder
  expect(inputElement).toBeInTheDocument();
  
  // Test for add button
  const addButton = screen.getByText(/add todo/i);
  expect(addButton).toBeInTheDocument();
  
  // Test for empty todo list
  const emptyList = screen.getByRole('list');
  expect(emptyList).toBeEmptyDOMElement();
});