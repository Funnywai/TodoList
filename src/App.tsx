import { useState, useEffect } from 'react';

interface Todo {
  id: string;
  title: string;
  date: string;
  time: string;
  status: 'pending' | 'completed';
  completedDate?: string;
}

const FIREBASE_URL = 'https://todolist-data-14734-default-rtdb.firebaseio.com/events.json';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [activeTab, setActiveTab] = useState<'mission' | 'calendar'>('mission');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('23:59');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Fetch todos from Firebase
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch(FIREBASE_URL);
      const data = await response.json();
      if (data) {
        const todoList: Todo[] = Object.entries(data).map(([id, todo]: [string, any]) => ({
          id,
          title: todo.title,
          date: todo.date,
          time: todo.time,
          status: todo.status || 'pending',
          completedDate: todo.completedDate,
        }));
        setTodos(todoList);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const openModal = () => {
    setNewDate(selectedDate);
    setNewTime('23:59');
    setNewTitle('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewTitle('');
  };

  const handleAddTodo = async () => {
    if (!newTitle.trim() || !newDate) return;

    const newTodo = {
      title: newTitle,
      date: newDate,
      time: newTime,
      status: 'pending',
    };

    try {
      const response = await fetch(FIREBASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTodo),
      });
      const data = await response.json();
      
      const todoWithId: Todo = {
        id: data.name,
        title: newTodo.title,
        date: newTodo.date,
        time: newTodo.time,
        status: newTodo.status as 'pending' | 'completed',
      };
      
      setTodos([...todos, todoWithId]);
      closeModal();
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const toggleTodoStatus = async (id: string, currentStatus: 'pending' | 'completed') => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    const completedDate = newStatus === 'completed' ? new Date().toISOString().split('T')[0] : undefined;
    
    try {
      await fetch(`https://todolist-data-14734-default-rtdb.firebaseio.com/events/${id}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, completedDate }),
      });
      
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, status: newStatus, completedDate } : todo
      ));
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days: (number | null)[] = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const formatDate = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const getTodosForDate = (date: string) => {
    return todos.filter(todo => todo.date === date);
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const undoneTodos = todos.filter(todo => todo.status === 'pending');
  const todayStr = new Date().toISOString().split('T')[0];
  const missionTodos = [
    ...undoneTodos,
    ...todos.filter(todo => todo.status === 'completed' && todo.completedDate === todayStr)
  ].sort((a, b) => a.time.localeCompare(b.time));
  const selectedDateTodos = getTodosForDate(selectedDate);

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800">TodoList</h1>
          <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-4">
        {activeTab === 'mission' ? (
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Mission ({missionTodos.length})</h2>
            {missionTodos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No missions for today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {missionTodos.map(todo => (
                  <div 
                    key={todo.id} 
                    className={`rounded-lg p-4 shadow-sm border ${
                      todo.status === 'completed' 
                        ? 'bg-gray-100 border-gray-200' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleTodoStatus(todo.id, todo.status)}
                        className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          todo.status === 'completed' 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-gray-300 hover:border-green-500'
                        }`}
                      >
                        {todo.status === 'completed' && (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                      <div className="flex-1">
                        <h3 className={`font-medium ${
                          todo.status === 'completed' 
                            ? 'text-gray-500 line-through' 
                            : 'text-gray-800'
                        }`}>
                          {todo.title}
                        </h3>
                        <p className={`text-sm mt-1 ${
                          todo.status === 'completed' 
                            ? 'text-gray-400' 
                            : 'text-gray-500'
                        }`}>
                          {new Date(todo.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {todo.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Calendar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="font-semibold text-gray-800">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </span>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentMonth).map((day, index) => {
                  const dateStr = day ? formatDate(day) : '';
                  const hasEvent = day && getTodosForDate(dateStr).length > 0;
                  const isSelected = dateStr === selectedDate;
                  const isToday = dateStr === new Date().toISOString().split('T')[0];
                  
                  return (
                    <button
                      key={index}
                      onClick={() => day && setSelectedDate(formatDate(day))}
                      disabled={!day}
                      className={`
                        aspect-square flex items-center justify-center text-sm rounded-lg relative
                        ${!day ? 'invisible' : ''}
                        ${isSelected ? 'bg-blue-500 text-white' : ''}
                        ${isToday && !isSelected ? 'bg-blue-100 text-blue-600 font-semibold' : ''}
                        ${!isSelected && !isToday ? 'hover:bg-gray-100 text-gray-700' : ''}
                      `}
                    >
                      {day}
                      {hasEvent && !isSelected && (
                        <span className="absolute bottom-1 w-1 h-1 bg-blue-500 rounded-full"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Date Events */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-3">
                Events for {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
              {selectedDateTodos.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200">
                  <p>No events for this date</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDateTodos.map(todo => (
                    <div 
                      key={todo.id} 
                      className={`rounded-lg p-4 shadow-sm border ${
                        todo.status === 'completed' 
                          ? 'bg-green-500 border-green-600' 
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`font-medium ${
                            todo.status === 'completed' ? 'text-white' : 'text-gray-800'
                          }`}>
                            {todo.title}
                          </h3>
                          <p className={`text-sm ${
                            todo.status === 'completed' ? 'text-green-100' : 'text-gray-500'
                          }`}>
                            {todo.time}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleTodoStatus(todo.id, todo.status)}
                          className={`ml-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            todo.status === 'completed' 
                              ? 'border-white bg-white' 
                              : 'border-gray-300 hover:border-green-500'
                          }`}
                        >
                          {todo.status === 'completed' && (
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Floating Navigation Bar */}
      <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/80 backdrop-blur-md shadow-lg rounded-full border border-white/50 px-6 py-3 z-40">
        <div className="flex items-center gap-8">
          <button
            onClick={() => setActiveTab('mission')}
            className={`text-sm font-medium transition-colors ${
              activeTab === 'mission' ? 'text-blue-500' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Mission
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`text-sm font-medium transition-colors ${
              activeTab === 'calendar' ? 'text-blue-500' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={openModal}
            className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Event</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Enter event title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTodo}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
