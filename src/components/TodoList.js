import { useState, useEffect } from "react";
import Todo from "./Todo";

const API_BASE = '/api/todos';

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
        <div>
            <input 
                value={text} 
                onChange={(e) => setText(e.target.value)} 
                placeholder="Add new todo"
            />
            <button onClick={handleSubmit}>Add ToDo</button>
            <ul>
                {todos.map((todo) => (
                    <li key={todo.id}>
                        {todo.isInEditingMode ? (
                            <>
                                <input
                                    value={updateText}
                                    onChange={(e) => setUpdateText(e.target.value)}
                                />
                                <button onClick={(e) => handleUpdate(e, todo.id)}>
                                    Done
                                </button>
                            </>
                        ) : (
                            <>
                                <input
                                    type="checkbox"
                                    checked={todo.completed || false}
                                    onChange={() => handleToggleComplete(todo.id)}
                                />
                                <span style={{ 
                                    textDecoration: todo.completed ? 'line-through' : 'none',
                                    margin: '0 10px'
                                }}>
                                    {todo.text}
                                </span>
                                <button onClick={(e) => handleDelete(e, todo.id)}>
                                    Delete
                                </button>
                                <button onClick={(e) => handleEdit(e, todo.id)}>
                                    Edit
                                </button>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default TodoList;