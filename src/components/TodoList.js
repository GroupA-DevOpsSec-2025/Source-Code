import { useState, useEffect } from "react";
import Todo from "./Todo";

const API_BASE = '/api/todos';

function TodoList() {
    const [todos, setTodos] = useState([]);
    const [text, setText] = useState("");
    const [updateText, setUpdateText] = useState("");

    // Load todos from server on component mount
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
        const newTodo = {
            text: text,
            completed: false
        };

        try {
            // Save to server
            const response = await fetch(API_BASE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newTodo)
            });
            const addedTodo = await response.json();

            // Update local state with the todo returned from server (includes ID)
            setTodos([...todos, addedTodo]);
            setText("");
        } catch (error) {
            console.error("Failed to add todo:", error);
        }
    }

    async function handleDelete(e, id) {
        e.preventDefault();
        try {
            // Delete from server
            await fetch(`${API_BASE}/${id}`, {
                method: 'DELETE'
            });

            // Update local state
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
        const updatedTodo = {
            text: updateText,
            isInEditingMode: false
        };

        try {
            // Update on server
            const response = await fetch(`${API_BASE}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedTodo)
            });
            const updatedTodoFromServer = await response.json();

            // Update local state
            setTodos(todos.map(todo => 
                todo.id === id ? { ...todo, ...updatedTodoFromServer } : todo
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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    completed: !todo.completed,
                    text: todo.text
                })
            });
            const updatedTodo = await response.json();
            
            setTodos(todos.map(t => 
                t.id === id ? updatedTodo : t
            ));
        } catch (error) {
            console.error("Failed to toggle todo:", error);
        }
    }

    function handleInput(e) {
        setText(e.target.value);
    }

    function handleUpdateText(e) {
        setUpdateText(e.target.value);
    }

    return (
        <div>
            <input value={text} onChange={handleInput} />
            <button onClick={handleSubmit}>Add ToDo</button>
            <ul>
                {todos.map((todo) => (
                    <li key={todo.id}>
                        {todo.isInEditingMode ? (
                            <>
                                <Todo 
                                    todo={todo} 
                                    handleUpdateText={handleUpdateText} 
                                    updateText={updateText} 
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
                                <Todo todo={todo} />
                                <button onClick={(e) => handleDelete(e, todo.id)}>
                                    Delete
                                </button>
                                <button onClick={(e) => handleEdit(e, todo.id)}>
                                    Update Todo
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