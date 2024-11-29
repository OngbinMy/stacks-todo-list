import React, { useState, useEffect } from 'react';
import { useConnect } from '@stacks/connect-react';
import {
  uintCV,
  stringCV,
  cvToValue,
  callReadOnlyFunction
} from '@stacks/transactions';
import { StacksMocknet } from '@stacks/network';

const network = new StacksMocknet();
const contractAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
const contractName = 'todo-list';

export function TodoList() {
  const { doContractCall } = useConnect();
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Pagination variables
  const [page, setPage] = useState(0);
  const limit = 10;

  const fetchTodos = async (start = 0) => {
    setIsLoading(true);
    try {
      const result = await callReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'get-all-todos',
        functionArgs: [uintCV(start)],
        network,
      });

      const fetchedTodos = cvToValue(result).map((todo, index) => ({
        id: index + start,
        ...todo,
      }));

      setTodos((prevTodos) => [...prevTodos, ...fetchedTodos]);
      setPage((prevPage) => prevPage + 1);
      if (!fetchedTodos.length) setError('No more todos available');
    } catch (error) {
      console.error('Error fetching todos:', error);
      setError('Failed to fetch todos');
    } finally {
      setIsLoading(false);
    }
  };

  const addTodo = async () => {
    if (!newTodo.trim()) return;

    try {
      await doContractCall({
        contractAddress,
        contractName,
        functionName: 'add-todo',
        functionArgs: [stringCV(newTodo)],
        network,
        onFinish: () => {
          setNewTodo('');
          setTodos([]);
          setPage(0);
          fetchTodos(); // Refetch all todos
        },
        onCancel: () => {
          setError('Transaction was cancelled');
        },
      });
    } catch (error) {
      console.error('Error adding todo:', error);
      setError('Failed to add todo');
    }
  };

  const completeTodo = async (id) => {
    try {
      await doContractCall({
        contractAddress,
        contractName,
        functionName: 'complete-todo',
        functionArgs: [uintCV(id)],
        network,
        onFinish: () => {
          setTodos((prevTodos) =>
            prevTodos.map((todo) =>
              todo.id === id ? { ...todo, completed: true } : todo
            )
          );
        },
        onCancel: () => {
          setError('Transaction was cancelled');
        },
      });
    } catch (error) {
      console.error('Error completing todo:', error);
      setError('Failed to complete todo');
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleScroll = () => {
    const isBottom =
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
    if (isBottom && !isLoading) {
      fetchTodos(page * limit);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [page, isLoading]);

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h1 className="text-2xl font-bold mb-4">Stacks Todo List</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex mb-4">
        <input
          type="text"
          className="flex-grow p-2 border rounded-l"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo"
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-r"
          onClick={addTodo}
        >
          Add
        </button>
      </div>

      <ul>
        {todos.map((todo) => (
          <li
            key={todo.id}
            className={`p-2 mb-2 border rounded ${
              todo.completed ? 'bg-gray-200 line-through' : ''
            }`}
          >
            {todo.text}
            {!todo.completed && (
              <button
                className="ml-2 text-sm text-blue-500"
                onClick={() => completeTodo(todo.id)}
              >
                Complete
              </button>
            )}
          </li>
        ))}
      </ul>

      {isLoading && <div>Loading more...</div>}
    </div>
  );
}

