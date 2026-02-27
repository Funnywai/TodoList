import { useState, useEffect } from 'react';

interface Todo {
  id: string;
  title: string;
  date: string;
  time: string;
  status: 'pending' | 'completed';
}

const FIREBASE_URL = 'https://todolist-data-14734-default-rtdb.firebaseio.com/events.json';
const COURSE_OPTIONS = ['CENG 3420', 'CSCI 3250', 'CSCI 3251', 'ELTU 3014', 'CSCI 3180', 'CSCI 3100'];

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [activeTab, setActiveTab] = useState<'mission' | 'calendar'>('mission');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [newCourse, setNewCourse] = useState('CENG 3420');
  const [newMission, setNewMission] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('23:59');
  const [newStatus, setNewStatus] = useState<'pending' | 'completed'>('pending');
  const [currentMonth, setCurrentMonth] = useState(new Date());

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
        }));
        setTodos(todoList);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const openModal = () => {
    setModalMode('add');
    setEditingTodoId(null);
    setNewDate(selectedDate);
    setNewTime('23:59');
    setNewCourse('CENG 3420');
    setNewMission('');
    setNewStatus('pending');
    setIsModalOpen(true);
  };

  const openEditModal = (todo: Todo) => {
    setModalMode('edit');
    setEditingTodoId(todo.id);
    const matched = COURSE_OPTIONS.find(c => todo.title.startsWith(c));
    if (matched) {
      setNewCourse(matched);
      setNewMission(todo.title.slice(matched.length).trim());
    } else {
      setNewCourse('CENG 3420');
      setNewMission(todo.title);
    }
    setNewDate(todo.date);
    setNewTime(todo.time);
    setNewStatus(todo.status);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewCourse('CENG 3420');
    setNewMission('');
    setNewDate('');
    setNewTime('23:59');
    setNewStatus('pending');
    setEditingTodoId(null);
  };

  const handleAddTodo = async () => {
    const combinedTitle = `${newCourse} ${newMission}`.trim();
    if (!newMission.trim() || !newDate) return;

    const newTodo = {
      title: combinedTitle,
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
      setTodos(prev => [...prev, todoWithId]);
      closeModal();
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const handleUpdateTodo = async () => {
    const combinedTitle = `${newCourse} ${newMission}`.trim();
    if (!editingTodoId || !newMission.trim() || !newDate || !newTime) return;

    const updatedTodo = {
      title: combinedTitle,
      date: newDate,
      time: newTime,
      status: newStatus,
    };

    try {
      await fetch(`https://todolist-data-14734-default-rtdb.firebaseio.com/events/${editingTodoId}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTodo),
      });
      setTodos(prev =>
        prev.map(todo => todo.id === editingTodoId ? { ...todo, ...updatedTodo } : todo)
      );
      closeModal();
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const handleDeleteTodo = async () => {
    if (!editingTodoId) return;
    try {
      await fetch(`https://todolist-data-14734-default-rtdb.firebaseio.com/events/${editingTodoId}.json`, {
        method: 'DELETE',
      });
      setTodos(prev => prev.filter(todo => todo.id !== editingTodoId));
      closeModal();
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const toggleTodoStatus = async (id: string, currentStatus: 'pending' | 'completed') => {
    const next = currentStatus === 'pending' ? 'completed' : 'pending';
    try {
      await fetch(`https://todolist-data-14734-default-rtdb.firebaseio.com/events/${id}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      setTodos(prev => prev.map(todo => todo.id === id ? { ...todo, status: next } : todo));
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
    for (let i = 0; i < startingDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const formatDate = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const getTodosForDate = (date: string) => todos.filter(todo => todo.date === date);

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const selectedDateTodos = getTodosForDate(selectedDate);

  const TaskCard = ({ todo }: { todo: Todo }) => (
    <div
      onClick={() => openEditModal(todo)}
      className={`rounded-lg p-4 shadow-sm border cursor-pointer transition-colors ${
        todo.status === 'completed'
          ? 'bg-gray-100 border-gray-200'
          : 'bg-white border-gray-200 hover:border-blue-300'
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={(e) => { e.stopPropagation(); toggleTodoStatus(todo.id, todo.status); }}
          className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
            todo.status === 'completed'
              ? 'border-gray-300 bg-gray-200'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <svg
            className={`w-3.5 h-3.5 text-gray-600 transition-all duration-200 ease-out ${
              todo.status === 'completed' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium break-words ${
            todo.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-800'
          }`}>
            {todo.title}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {new Date(todo.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {todo.time}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 pb-28">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800">TodoList</h1>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-4">
        {activeTab === 'mission' ? (
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              Mission <span className="text-sm font-normal text-gray-400">({todos.length})</span>
            </h2>
            {todos.length === 0 ? (
              <div className="text-center py-12 text-gray-400 bg-white rounded-lg border border-gray-200">
                <p>No tasks yet. Tap + to add one!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todos
                  .slice()
                  .sort((a, b) => (a.status === 'completed' ? 1 : -1) - (b.status === 'completed' ? 1 : -1))
                  .map(todo => <TaskCard key={todo.id} todo={todo} />)}
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Calendar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="font-semibold text-gray-800">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </span>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-xs font-medium text-gray-400 py-1">{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentMonth).map((day, index) => {
                  const dateStr = day ? formatDate(day) : '';
                  const hasEvent = day ? getTodosForDate(dateStr).length > 0 : false;
                  const isSelected = dateStr === selectedDate;
                  const isToday = dateStr === new Date().toISOString().split('T')[0];
                  return (
                    <button
                      key={index}
                      onClick={() => day && setSelectedDate(formatDate(day))}
                      disabled={!day}
                      className={`aspect-square flex items-center justify-center text-sm rounded-lg relative transition-colors
                        ${!day ? 'invisible' : ''}
                        ${isSelected ? 'bg-blue-500 text-white font-semibold' : ''}
                        ${isToday && !isSelected ? 'bg-blue-50 text-blue-600 font-semibold' : ''}
                        ${!isSelected && !isToday ? 'hover:bg-gray-100 text-gray-700' : ''}
                      `}
                    >
                      {day}
                      {hasEvent && (
                        <span className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-400'}`}></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Date Events */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-3">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                <span className="text-sm font-normal text-gray-400 ml-2">({selectedDateTodos.length})</span>
              </h2>
              {selectedDateTodos.length === 0 ? (
                <div className="text-center py-10 text-gray-400 bg-white rounded-lg border border-gray-200">
                  <p>No events for this date</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDateTodos.map(todo => <TaskCard key={todo.id} todo={todo} />)}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Floating Navigation Bar */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md shadow-lg rounded-full border border-white/60 px-6 py-3 z-40">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('mission')}
            className={`text-sm font-medium px-2 py-1 rounded-full transition-colors ${
              activeTab === 'mission' ? 'text-blue-500' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Mission
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`text-sm font-medium px-2 py-1 rounded-full transition-colors ${
              activeTab === 'calendar' ? 'text-blue-500' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={openModal}
            className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-600 active:scale-95 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slide-up">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">
              {modalMode === 'add' ? '➕ Add New Event' : '✏️ Edit Event'}
            </h2>

            <div className="space-y-4">
              {/* Course */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Course</label>
                <select
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-gray-800"
                >
                  {COURSE_OPTIONS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Mission */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Mission</label>
                <input
                  type="text"
                  value={newMission}
                  onChange={(e) => setNewMission(e.target.value)}
                  placeholder="e.g. Assignment 1"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800"
                />
              </div>

              {/* Title Preview */}
              {newMission.trim() && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 text-sm text-blue-700">
                  <span className="text-blue-400 mr-1">Title:</span>
                  <span className="font-medium">{newCourse} {newMission}</span>
                </div>
              )}

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="no-date-icon w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Time</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="no-time-icon w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800"
                />
              </div>

              {/* Status (edit only) */}
              {modalMode === 'edit' && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as 'pending' | 'completed')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-gray-800"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              {modalMode === 'edit' && (
                <button
                  onClick={handleDeleteTodo}
                  className="px-4 py-2.5 bg-red-50 text-red-500 border border-red-200 rounded-xl hover:bg-red-100 transition-colors font-medium"
                >
                  Delete
                </button>
              )}
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={modalMode === 'add' ? handleAddTodo : handleUpdateTodo}
                className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 active:scale-95 transition-all font-medium"
              >
                {modalMode === 'add' ? 'Add' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
