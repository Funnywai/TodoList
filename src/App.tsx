import { useMemo, useState } from "react";

type Tab = "undone" | "calendar";
type Priority = "high" | "medium" | "low";

type Todo = {
  id: number;
  title: string;
  note: string;
  dueDate: string;
  time: string;
  done: boolean;
  priority: Priority;
};

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function addDays(baseDate: Date, days: number) {
  const next = new Date(baseDate);
  next.setDate(baseDate.getDate() + days);
  return next;
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

const now = new Date();
const initialTodos: Todo[] = [
  {
    id: 1,
    title: "Finalize sprint roadmap",
    note: "Align priorities with product and design before standup.",
    dueDate: dateKey(addDays(now, 0)),
    time: "09:30",
    done: false,
    priority: "high",
  },
  {
    id: 2,
    title: "Pick up groceries",
    note: "Get fruit, yogurt, oats, and coffee beans.",
    dueDate: dateKey(addDays(now, 1)),
    time: "18:00",
    done: false,
    priority: "medium",
  },
  {
    id: 3,
    title: "Yoga session",
    note: "45-minute recovery class after work.",
    dueDate: dateKey(addDays(now, 2)),
    time: "20:00",
    done: false,
    priority: "low",
  },
  {
    id: 4,
    title: "Dentist appointment",
    note: "Routine cleaning. Bring insurance card.",
    dueDate: dateKey(addDays(now, 5)),
    time: "11:15",
    done: false,
    priority: "high",
  },
  {
    id: 5,
    title: "Book flight to NYC",
    note: "Compare evening departures and baggage options.",
    dueDate: dateKey(addDays(now, 8)),
    time: "15:45",
    done: true,
    priority: "medium",
  },
];

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>("undone");
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [displayMonth, setDisplayMonth] = useState<Date>(
    new Date(now.getFullYear(), now.getMonth(), 1)
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState(dateKey(new Date()));
  const [newTime, setNewTime] = useState("23:59");

  const undoneTodos = useMemo(() => todos.filter((todo) => !todo.done), [todos]);
  const selectedDateEvents = useMemo(
    () => todos.filter((todo) => todo.dueDate === dateKey(selectedDate)),
    [selectedDate, todos]
  );

  const monthCells = useMemo(() => {
    const start = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), 1);
    const end = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 0);
    const totalDays = end.getDate();
    const firstDay = start.getDay();
    const cellCount = Math.ceil((firstDay + totalDays) / 7) * 7;

    return Array.from({ length: cellCount }, (_, index) => {
      const dayNumber = index - firstDay + 1;
      if (dayNumber < 1 || dayNumber > totalDays) {
        return null;
      }

      return new Date(displayMonth.getFullYear(), displayMonth.getMonth(), dayNumber);
    });
  }, [displayMonth]);

  const toggleTodo = (id: number) => {
    setTodos((current) => current.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)));
  };

  const openModal = () => {
    setNewTitle("");
    setNewDate(dateKey(new Date()));
    setNewTime("23:59");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleAddTodo = () => {
    if (!newTitle.trim()) return;
    const newTodo: Todo = {
      id: Date.now(),
      title: newTitle.trim(),
      note: "",
      dueDate: newDate,
      time: newTime,
      done: false,
      priority: "medium",
    };
    setTodos((current) => [...current, newTodo]);
    closeModal();
  };

  const previousMonth = () => {
    setDisplayMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setDisplayMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-md">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">TodoList</h1>
          <span className="text-sm font-medium text-gray-500">{new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
        </header>

        <section className="flex-1 overflow-y-auto px-4 py-4">

          {activeTab === "undone" ? (
            <div className="space-y-3">
              <div className="mb-4 rounded-lg bg-blue-50 p-4">
                <p className="text-sm font-medium text-gray-600">Undone tasks</p>
                <p className="text-2xl font-bold text-gray-900">{undoneTodos.length}</p>
              </div>

              {undoneTodos.map((todo) => (
                <article
                  key={todo.id}
                  className="mb-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h2 className="text-base font-semibold text-gray-900">{todo.title}</h2>
                      <p className="mt-1 text-sm text-gray-600">{todo.note}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleTodo(todo.id)}
                      className="mt-1 grid h-6 w-6 place-items-center rounded-full border-2 border-gray-300 text-gray-500 transition hover:border-green-500 hover:text-green-500"
                      aria-label={`Mark ${todo.title} done`}
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.4}>
                        <path d="M5 12l5 5 9-9" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="rounded bg-gray-100 px-2 py-1 font-medium text-gray-700">
                      {todo.dueDate} at {todo.time}
                    </span>
                    <span
                      className={`rounded px-2 py-1 font-semibold ${
                        todo.priority === "high"
                          ? "bg-red-100 text-red-700"
                          : todo.priority === "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {todo.priority}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <section className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={previousMonth}
                    className="grid h-8 w-8 place-items-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                    aria-label="Previous month"
                  >
                    <span aria-hidden>‹</span>
                  </button>
                  <h2 className="text-sm font-semibold text-gray-800">{monthLabel(displayMonth)}</h2>
                  <button
                    type="button"
                    onClick={nextMonth}
                    className="grid h-8 w-8 place-items-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                    aria-label="Next month"
                  >
                    <span aria-hidden>›</span>
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500">
                  {weekDays.map((day) => (
                    <div key={day} className="py-1">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="mt-1 grid grid-cols-7 gap-1">
                  {monthCells.map((cellDate, i) => {
                    if (!cellDate) {
                      return <div key={`empty-${i}`} className="h-9" />;
                    }

                    const key = dateKey(cellDate);
                    const isSelected = key === dateKey(selectedDate);
                    const hasEvents = todos.some((todo) => todo.dueDate === key);

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedDate(cellDate)}
                        className={`relative h-9 rounded text-sm font-medium transition ${
                          isSelected
                            ? "bg-blue-500 text-white"
                            : "bg-gray-50 text-gray-700 hover:bg-blue-50"
                        }`}
                      >
                        {cellDate.getDate()}
                        {hasEvents ? (
                          <span
                            className={`absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${
                              isSelected ? "bg-white" : "bg-blue-500"
                            }`}
                          />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  Events on {dateKey(selectedDate)}
                </h3>
                {selectedDateEvents.length > 0 ? (
                  selectedDateEvents.map((event) => (
                    <article
                      key={event.id}
                      className="mb-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900">{event.title}</h4>
                        <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                          {event.time}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{event.note}</p>
                      <p className="mt-2 text-xs font-medium text-gray-500">
                        Status: {event.done ? "Completed" : "Pending"}
                      </p>
                    </article>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-gray-300 bg-white p-4 text-center text-sm text-gray-500">
                    No events for this date.
                  </div>
                )}
              </section>
            </div>
          )}
        </section>

        <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-4 py-2">
          <div className="mx-auto max-w-md">
            <div className="flex items-center justify-around">
              <button
                type="button"
                onClick={() => setActiveTab("undone")}
                className={`flex flex-1 flex-col items-center rounded-lg px-4 py-2 text-sm font-medium transition ${
                  activeTab === "undone" ? "text-blue-600" : "text-gray-600"
                }`}
              >
                <span className="text-xs">Undone</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("calendar")}
                className={`flex flex-1 flex-col items-center rounded-lg px-4 py-2 text-sm font-medium transition ${
                  activeTab === "calendar" ? "text-blue-600" : "text-gray-600"
                }`}
              >
                <span className="text-xs">Calendar</span>
              </button>
              <button
                type="button"
                onClick={openModal}
                className="flex flex-col items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <span className="text-lg">+</span>
              </button>
            </div>
          </div>
        </nav>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
            <div className="w-full max-w-md rounded-t-xl border border-gray-200 bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Add New Event</h3>
                <button
                  type="button"
                  onClick={closeModal}
                  className="grid h-8 w-8 place-items-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200"
                  aria-label="Close"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Enter event title"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Time (default: 23:59)</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddTodo}
                  disabled={!newTitle.trim()}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Add Event
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
