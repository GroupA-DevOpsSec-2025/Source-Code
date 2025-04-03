import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the child components to simplify testing
jest.mock('./components/TodoList', () => () => (
  <div data-testid="todo-list-mock">Todo List Mock</div>
));

describe('App Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders main app container', () => {
    render(<App />);
    
    // Verify main structure
    const appContainer = screen.getByTestId('app-container');
    expect(appContainer).toBeInTheDocument();
    
    // Verify TodoList is rendered
    const todoListMock = screen.getByTestId('todo-list-mock');
    expect(todoListMock).toBeInTheDocument();
  });
});