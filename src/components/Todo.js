function Todo(props) {

        if (props.todo.isInEditingMode) {
            return(
                <span>
                    <input value={props.updateText} onChange={props.handleUpdateText} />
                </span>
            );
        } else {
            return (
            <span>
                {props.todo.text}
            </span>
            );
        }
}

export default Todo;