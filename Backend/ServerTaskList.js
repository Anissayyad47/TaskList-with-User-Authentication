const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  user: 'AwsPostgre',
  password: 'Anis352003',
  host: 'postgre-database-1.clgao60q03ky.ap-southeast-2.rds.amazonaws.com',
  database: 'user_authentication',
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect()
  .then(() => console.log("Connected to PostgreSQL database"))
  .catch(err => console.error("Failed to connect to PostgreSQL database:", err));

const createUserTodoTable = async (userId) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos_${userId} (
        id SERIAL PRIMARY KEY,
        text VARCHAR(255) NOT NULL,
        completed BOOLEAN DEFAULT FALSE
      );
    `);
    console.log(`Table "todos_${userId}" ensured to exist.`);
  } catch (err) {
    console.error('Error creating user-specific table:', err.message);
  }
};

app.post('/sign-up', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }
  try {
    const query = "SELECT * FROM users WHERE username = $1";
    const values = [username];
    const result = await pool.query(query, values);
    // If the user already exists
    if (result.rows.length > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }
    // Insert user into the database
    const insertQuery = "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id";
    const insertValues = [username, password];
    const insertResult = await pool.query(insertQuery, insertValues);
    const userId = insertResult.rows[0].id;
    // Create a todo table for the new user
    await createUserTodoTable(userId);

    res.status(201).json({ message: "User registered successfully", userId });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "An error occurred while registering the user" });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    const query = "SELECT * FROM users WHERE username = $1";
    const values = [username];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];

    if (user.password !== password) {
      return res.status(401).json({ error: "Incorrect password" });
    }
    res.status(200).json({ message: "Login successful", user: { username: user.username, userId: user.id } });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "An error occurred while logging in" });
  }
});

app.get('/api/todos', async (req, res) => {
    const userId = req.query.userId; 
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
  
    try {
      const result = await pool.query(`SELECT * FROM todos_${userId} ORDER BY id ASC`);
      res.json(result.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
  
// Create a new task for a user
app.post('/api/todos', async (req, res) => {
  const { userId, text, completed } = req.body; 

  if (!userId || !text) {
    return res.status(400).json({ error: "User ID and todo text are required" });
  }

  try {
    // Create the user-specific table if it doesn't exist
    await createUserTodoTable(userId);

    const result = await pool.query(
      `INSERT INTO todos_${userId} (text, completed) VALUES ($1, $2) RETURNING *`,
      [text, completed || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update a todo for a user
app.put('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { userId, text, completed } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    // Ensure the table name is sanitized
    const tableName = `todos_${parseInt(userId, 10)}`;
    const result = await pool.query(
      `UPDATE ${tableName} SET text = $1, completed = $2 WHERE id = $3 RETURNING *`,
      [text, completed, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating todo:", err.message);
    res.status(500).json({ error: "An unexpected error occurred while updating the todo" });
  }
});


// Delete a todo for a user
app.delete('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const result = await pool.query(`DELETE FROM todos_${userId} WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Todo not found');
    }
    res.json({ message: 'Todo deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
