import React from 'react';
import { Connect } from '@stacks/connect-react';
import { TodoList } from './components/TodoList';

const appDetails = {
  name: 'Stacks Todo List',
  icon: '/favicon.ico',
};

function App() {
  return (
    <Connect appDetails={appDetails}>
      <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
        <div className="relative py-3 sm:max-w-xl sm:mx-auto">
          <TodoList />
        </div>
      </div>
    </Connect>
  );
}

export default App;