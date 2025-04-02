import { useState, useEffect } from "react";
import Todo from "./Todo";

const API_URL = 'http://localhost:3001/todos';

function TodoList() {
    const [todos, setTodos] = useState([]);
    const [text, setText] = useState("");
    const [updateText, setUpdateText] = useState("");

    // Load todos from server on component mount
    useEffect(() => {
        async function fetchTodos() {
            try {
                const response = await fetch(API_URL);
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
            id: Date.now(), // Using timestamp as ID
            isInEditingMode: false
        };

        try {
            // Save to server
            await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newTodo)
            });

            // Update local state
            setTodos([...todos, newTodo]);
            setText("");
        } catch (error) {
            console.error("Failed to add todo:", error);
        }
    }

    async function handleDelete(e, id) {
        e.preventDefault();
        try {
            // Delete from server
            await fetch(`${API_URL}/${id}`, {
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
            await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedTodo)
            });

            // Update local state
            setTodos(todos.map(todo => 
                todo.id === id ? { ...todo, ...updatedTodo } : todo
            ));
            setUpdateText("");
        } catch (error) {
            console.error("Failed to update todo:", error);
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
                {todos.map((todo, index) => (
                    <li key={index}>
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