const express = require('express');
const cors = require('cors');
const app = express();

// Dynamic CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed domains
    const allowedDomains = [
      'http://localhost', // For local development
      'http://localhost:3000',
      /\.compute-1\.amazonaws\.com$/, // All AWS EC2 instances in this region
      /\.amazonaws\.com$/ // All AWS domains
    ];
    
    // Check if the origin matches any allowed pattern
    if (allowedDomains.some(domain => {
      if (typeof domain === 'string') {
        return origin.startsWith(domain);
      } else if (domain instanceof RegExp) {
        return domain.test(origin);
      }
      return false;
    })) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));
app.use(express.json());

let todos = [];
let currentId = 1;

// Get all todos
app.get('/api/todos', (req, res) => {
  res.json(todos);
});

// Add new todo
app.post('/api/todos', (req, res) => {
  const newTodo = {
    id: currentId++,
    text: req.body.text,
    completed: req.body.completed || false
  };
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// Update todo
app.put('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todoIndex = todos.findIndex(todo => todo.id === id);
  
  if (todoIndex !== -1) {
    todos[todoIndex] = {
      ...todos[todoIndex],
      text: req.body.text || todos[todoIndex].text,
      completed: req.body.completed !== undefined ? req.body.completed : todos[todoIndex].completed
    };
    res.json(todos[todoIndex]);
  } else {
    res.status(404).send('Not found');
  }
});

// Delete todo
app.delete('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  todos = todos.filter(todo => todo.id !== id);
  res.status(204).end();
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});