function Todo({ todo, updateText, handleUpdateText }) {
    return todo.isInEditingMode ? (
        <input 
            value={updateText} 
            onChange={handleUpdateText} 
        />
    ) : (
        <span>
            {todo.text}
        </span>
    );
}

export default Todo;