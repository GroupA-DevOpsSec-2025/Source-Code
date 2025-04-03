import { useState, useEffect } from "react";
import './TodoList.css'; // Import the CSS file

function TodoList() {
    const [todos, setTodos] = useState([]);
    const [text, setText] = useState("");
    const [updateText, setUpdateText] = useState("");

    useEffect(() => {
        async function fetchTodos() {
            try {
                const response = await fetch(API_BASE);
                const data = await response.json();
                setTodos(data);
            } catch (error) {
                console.error("Failed to fetch todos:", error);
            }
        }
        fetchTodos();
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!text.trim()) return;
        
        try {
            const response = await fetch(API_BASE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, completed: false })
            });
            const addedTodo = await response.json();
            setTodos([...todos, addedTodo]);
            setText("");
        } catch (error) {
            console.error("Failed to add todo:", error);
        }
    }

    async function handleDelete(e, id) {
        e.preventDefault();
        try {
            await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
            setTodos(todos.filter(todo => todo.id !== id));
        } catch (error) {
            console.error("Failed to delete todo:", error);
        }
    }

    function handleEdit(e, id) {
        e.preventDefault();
        const todoToEdit = todos.find(todo => todo.id === id);
        if (todoToEdit) {
            setTodos(todos.map(todo => 
                todo.id === id ? { ...todo, isInEditingMode: true } : todo
            ));
            setUpdateText(todoToEdit.text);
        }
    }

    async function handleUpdate(e, id) {
        e.preventDefault();
        if (!updateText.trim()) return;
        
        try {
            const response = await fetch(`${API_BASE}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    text: updateText,
                    completed: todos.find(t => t.id === id).completed 
                })
            });
            const updatedTodo = await response.json();
            
            setTodos(todos.map(todo => 
                todo.id === id ? { ...updatedTodo, isInEditingMode: false } : todo
            ));
            setUpdateText("");
        } catch (error) {
            console.error("Failed to update todo:", error);
        }
    }

    async function handleToggleComplete(id) {
        const todo = todos.find(t => t.id === id);
        try {
            const response = await fetch(`${API_BASE}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: todo.text,
                    completed: !todo.completed
                })
            });
            const updatedTodo = await response.json();
            setTodos(todos.map(t => t.id === id ? updatedTodo : t));
        } catch (error) {
            console.error("Failed to toggle todo:", error);
        }
    }

    return (
        <div className="todo-container">
            <h1 className="todo-header">Your To Do List</h1>
            
            <div className="add-section">
                <h2 className="section-title">Add New Items</h2>
                <div className="input-container">
                    <input
                        className="todo-input"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Enter new todo..."
                    />
                    <button className="add-button" onClick={handleSubmit}>
                        Add
                    </button>
                </div>
            </div>
            
            <div className="list-section">
                <h2 className="section-title">Current List</h2>
                <ul className="todo-list">
                    {todos.map((todo) => (
                        <li key={todo.id} className="todo-item">
                            <div className="todo-content">
                                <input
                                    type="checkbox"
                                    checked={todo.completed || false}
                                    onChange={() => handleToggleComplete(todo.id)}
                                    className="todo-checkbox"
                                />
                                <span className={`todo-text ${todo.completed ? 'completed-todo' : ''}`}>
                                    {todo.text}
                                </span>
                            </div>
                            <div className="button-group">
                                {todo.isInEditingMode ? (
                                    <>
                                        <input
                                            className="edit-input"
                                            value={updateText}
                                            onChange={(e) => setUpdateText(e.target.value)}
                                        />
                                        <button 
                                            className="done-button"
                                            onClick={(e) => handleUpdate(e, todo.id)}
                                        >
                                            Done
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button 
                                            className="edit-button"
                                            onClick={(e) => handleEdit(e, todo.id)}
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            className="delete-button"
                                            onClick={(e) => handleDelete(e, todo.id)}
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default TodoList;