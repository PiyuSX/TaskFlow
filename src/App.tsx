import { useEffect, useState, useCallback } from 'react';
import './index.css';
import { Todo, AlarmSound } from './types/Todo';
import { TodoItem } from './components/TodoItem';
import { TodoInput } from './components/TodoInput';

const DEFAULT_SOUNDS: AlarmSound[] = [
  { id: 'default', name: 'Default Bell', url: '/sounds/default.mp3' },
  { id: 'chime', name: 'Chime', url: '/sounds/chime.mp3' },
];

function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });

  const [sounds] = useState<AlarmSound[]>(() => {
    const savedSounds = localStorage.getItem('sounds');
    return savedSounds ? [...DEFAULT_SOUNDS, ...JSON.parse(savedSounds)] : DEFAULT_SOUNDS;
  });

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const checkReminders = useCallback(() => {
    const now = new Date();
    todos.forEach(todo => {
      if (todo.reminder && !todo.completed) {
        const reminderTime = new Date(todo.reminder);
        if (Math.abs(now.getTime() - reminderTime.getTime()) < 60000) { // Within 1 minute
          const sound = sounds.find(s => s.id === todo.alarmSound);
          if (sound) {
            new Audio(sound.url).play().catch(console.error);
          }
          
          // Show notification if supported
          if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                new Notification('Todo Reminder', {
                  body: todo.text,
                  icon: '/icon.png'
                });
              }
            });
          }
        }
      }
    });
  }, [todos, sounds]);

  useEffect(() => {
    const interval = setInterval(checkReminders, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [checkReminders]);

  const addTodo = (text: string, reminder?: Date, alarmSound?: string) => {
    setTodos([
      ...todos,
      {
        id: crypto.randomUUID(),
        text,
        completed: false,
        reminder,
        alarmSound
      }
    ]);
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto pt-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Todo App with Reminders
        </h1>
        
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <TodoInput onAdd={addTodo} availableSounds={sounds} />

          <div className="mt-6 space-y-3">
            {todos.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                No todos yet. Add one above!
              </p>
            ) : (
              todos.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                />
              ))
            )}
          </div>
          
          {todos.length > 0 && (
            <div className="mt-4 text-sm text-gray-500 text-center">
              {todos.filter(t => t.completed).length} of {todos.length} completed
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
