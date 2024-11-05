"use client";
import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import "./../app/app.css";
import "./page.module.css";
import { Amplify } from "aws-amplify";
import { useAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function App() {
  const { signOut, user } = useAuthenticator();
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  function deleteTodo(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    client.models.Todo.delete({ id });
  }

  async function toggleTodo(e: React.MouseEvent, todo: Schema["Todo"]["type"]) {
    e.stopPropagation();
    await client.models.Todo.update({
      id: todo.id,
      isDone: !todo.isDone,
      content: todo.content
    });
  }

  function listTodos() {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos(data.items || []),
    });
  }

  useEffect(() => {
    listTodos();
  }, []);

  function createTodo() {
    const content = window.prompt("Todo content");
    if (content) {
      client.models.Todo.create({
        content,
        isDone: false
      });
    }
  }

  return (
    <main>
      <h1>{user?.signInDetails?.loginId}'s todos</h1>
      <h1>My todos</h1>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id} className={todo.isDone ? 'done' : ''}>
            <span className="todo-content">{todo.content}</span>
            <div className="todo-actions">
              <button 
                className={`action-button check-button ${todo.isDone ? 'checked' : ''}`}
                onClick={(e) => toggleTodo(e, todo)}
                title={todo.isDone ? "Mark as undone" : "Mark as done"}
              >
                ✓
              </button>
              <button 
                className="action-button delete-button"
                onClick={(e) => deleteTodo(e, todo.id)}
                title="Delete todo"
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/nextjs/start/quickstart/nextjs-app-router-client-components/">
          Review next steps of this tutorial.
        </a>
      </div>
      <button onClick={signOut}>Sign out</button>
    </main>
  );
}