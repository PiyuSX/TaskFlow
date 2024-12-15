import { Check, Trash2, Circle, Bell } from 'lucide-react';
import { Todo } from '../types/Todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm group hover:shadow-md transition-shadow">
      <button
        onClick={() => onToggle(todo.id)}
        className="text-gray-400 hover:text-blue-500 transition-colors"
      >
        {todo.completed ? (
          <Check className="w-5 h-5 text-green-500" />
        ) : (
          <Circle className="w-5 h-5" />
        )}
      </button>
      <div className="flex-1">
        <span
          className={`text-gray-700 ${
            todo.completed ? 'line-through text-gray-400' : ''
          }`}
        >
          {todo.text}
        </span>
        {todo.reminder && (
          <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
            <Bell className="w-4 h-4" />
            {new Date(todo.reminder).toLocaleString()}
          </div>
        )}
      </div>
      <button
        onClick={() => onDelete(todo.id)}
        className="text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
}
