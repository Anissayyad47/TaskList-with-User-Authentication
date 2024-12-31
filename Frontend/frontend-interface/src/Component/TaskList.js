import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Css files/TaskList.css';


function TaskList() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const userId = localStorage.getItem("userId"); 
  // Fetch todos from the backend
  useEffect(() => {
    const fetchTodos = async () => {
      if (!userId) {
        console.error("UserId is not available.");
        return;
      }
  
      try {
        const response = await axios.get(`http://localhost:5000/api/todos?userId=${userId}`);
        setTodos(response.data);
      } catch (error) {
        console.error("Error fetching todos:", error);
      }
    };
    fetchTodos();
  }, [userId]);
  
  const handleAddTodo = () => {
    if (newTodo.trim()) {
      const todo = { userId:userId,text: newTodo, completed: false };
      axios.post('http://localhost:5000/api/todos', todo)
        .then((response) => {
          setTodos([...todos, response.data]);
          setNewTodo('');
        })
        .catch((error) => console.error('Error adding todo:', error));
    }
  };

  const handleToggleComplete = (index) => {
    const todo = todos[index];
    const updatedTodo = { ...todo, completed: !todo.completed, userId: userId };
  
    axios.put(`http://localhost:5000/api/todos/${todo.id}`, updatedTodo)
      .then(() => {
        const updatedTodos = todos.map((t, i) => (i === index ? updatedTodo : t));
        setTodos(updatedTodos);
      })
      .catch((error) => console.error('Error updating todo:', error));
  };
  

  const handleUpdateTodo = (index, newText) => {
    const todo = todos[index];
    const updatedTodo = { ...todo, text: newText };

    axios.put(`http://localhost:5000/api/todos/${todo.id}`, updatedTodo)
      .then(() => {
        const updatedTodos = todos.map((t, i) => (i === index ? updatedTodo : t));
        setTodos(updatedTodos);
      })
      .catch((error) => console.error('Error updating todo:', error));
  };

  const handleDeleteTodo = (index) => {
    const todo = todos[index];

    axios.delete(`http://localhost:5000/api/todos/${todo.id}?userId=${userId}`)
      .then(() => {
        const updatedTodos = todos.filter((_, i) => i !== index);
        setTodos(updatedTodos);
      })
      .catch((error) => console.error('Error deleting todo:', error));
  };
  

  return (
    <>
    <div className="todo-container">
      <h1>Task List</h1>
      <div className="todo-input">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new task..."
        />
        <button onClick={handleAddTodo}>Add</button>
      </div>
      <ul className="todo-list">
        {todos.map((todo, index) => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggleComplete(index)}
            />
            <input
              type="text"
              value={todo.text}
              onChange={(e) => handleUpdateTodo(index, e.target.value)}
            />
            <button onClick={() => handleDeleteTodo(index)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
    </>
  );
}

export default TaskList;



