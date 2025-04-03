//import logo from './logo.svg';
import './App.css';
import TodoList from './components/TodoList';

function App() {
  return (
    <div className="App" data-testid="app-container">
      <TodoList />
    </div>
  );
}

export default App;
