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

  const previousMonth = () => {
    setDisplayMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setDisplayMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  };

  return (
    <div className="ios-shell min-h-screen px-4 py-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="blob blob-a" />
        <div className="blob blob-b" />
      </div>

      <main className="relative mx-auto flex h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-[2.2rem] border border-white/50 bg-white/70 shadow-[0_24px_80px_rgba(20,24,51,0.22)] backdrop-blur-xl">
        <header className="flex items-center justify-between px-6 pt-5 text-sm font-semibold text-slate-700">
          <span>{new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
          <div className="h-6 w-36 rounded-full bg-slate-900/90" />
          <span>100%</span>
        </header>

        <section className="fade-up flex-1 overflow-y-auto px-5 pb-28 pt-6">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">TodoList</p>
            <h1 className="mt-1 text-3xl font-semibold text-slate-900">Focus Planner</h1>
          </div>

          {activeTab === "undone" ? (
            <div className="space-y-3">
              <div className="fade-up-delay rounded-3xl bg-gradient-to-r from-sky-500 to-cyan-400 p-4 text-white shadow-lg shadow-cyan-300/50">
                <p className="text-sm text-white/90">Undone tasks</p>
                <p className="text-3xl font-semibold">{undoneTodos.length}</p>
              </div>

              {undoneTodos.map((todo, index) => (
                <article
                  key={todo.id}
                  className="card-rise rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)]"
                  style={{ animationDelay: `${120 + index * 80}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold text-slate-900">{todo.title}</h2>
                      <p className="mt-1 text-sm text-slate-600">{todo.note}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleTodo(todo.id)}
                      className="mt-1 grid h-6 w-6 place-items-center rounded-full border-2 border-slate-300 text-slate-500 transition hover:border-emerald-500 hover:text-emerald-500"
                      aria-label={`Mark ${todo.title} done`}
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.4}>
                        <path d="M5 12l5 5 9-9" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                      {todo.dueDate} at {todo.time}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 font-semibold ${
                        todo.priority === "high"
                          ? "bg-rose-100 text-rose-700"
                          : todo.priority === "medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
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
              <section className="fade-up-delay rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-[0_12px_32px_rgba(18,43,63,0.08)]">
                <div className="mb-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={previousMonth}
                    className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-700"
                    aria-label="Previous month"
                  >
                    <span aria-hidden>‹</span>
                  </button>
                  <h2 className="text-sm font-semibold tracking-wide text-slate-800">{monthLabel(displayMonth)}</h2>
                  <button
                    type="button"
                    onClick={nextMonth}
                    className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-700"
                    aria-label="Next month"
                  >
                    <span aria-hidden>›</span>
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-500">
                  {weekDays.map((day) => (
                    <div key={day} className="py-1">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="mt-1 grid grid-cols-7 gap-1.5">
                  {monthCells.map((cellDate, index) => {
                    if (!cellDate) {
                      return <div key={`empty-${index}`} className="h-9" />;
                    }

                    const key = dateKey(cellDate);
                    const isSelected = key === dateKey(selectedDate);
                    const hasEvents = todos.some((todo) => todo.dueDate === key);

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedDate(cellDate)}
                        className={`relative h-9 rounded-xl text-sm font-medium transition ${
                          isSelected
                            ? "bg-sky-500 text-white shadow-md shadow-sky-300/60"
                            : "bg-slate-50 text-slate-700 hover:bg-sky-50"
                        }`}
                      >
                        {cellDate.getDate()}
                        {hasEvents ? (
                          <span
                            className={`absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full ${
                              isSelected ? "bg-white" : "bg-cyan-500"
                            }`}
                          />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">
                  Events on {dateKey(selectedDate)}
                </h3>
                {selectedDateEvents.length > 0 ? (
                  selectedDateEvents.map((event, index) => (
                    <article
                      key={event.id}
                      className="card-rise rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)]"
                      style={{ animationDelay: `${130 + index * 90}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-slate-900">{event.title}</h4>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {event.time}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{event.note}</p>
                      <p className="mt-2 text-xs font-medium text-slate-500">
                        Status: {event.done ? "Completed" : "Pending"}
                      </p>
                    </article>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-center text-sm text-slate-500">
                    No events for this date.
                  </div>
                )}
              </section>
            </div>
          )}
        </section>

        <nav className="absolute inset-x-4 bottom-4 grid grid-cols-3 gap-2 rounded-2xl border border-white/70 bg-white/85 p-2 shadow-[0_8px_24px_rgba(15,23,42,0.1)] backdrop-blur">
          <button
            type="button"
            onClick={() => setActiveTab("undone")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === "undone" ? "bg-sky-500 text-white" : "text-slate-600"
            }`}
          >
            Undone
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("calendar")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === "calendar" ? "bg-sky-500 text-white" : "text-slate-600"
            }`}
          >
            Calendar
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl px-4 py-2 text-sm font-semibold bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg"
          >
            + Add
          </button>
        </nav>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <div className="relative w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl animate-in slide-in-from-bottom-10 fade-in duration-200">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Add New Event</h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.4}>
                    <path d="M6 6l12 12M6 18L18 6" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-700">
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Event title"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="date" className="mb-1 block text-sm font-medium text-slate-700">
                      Date
                    </label>
                    <input
                      id="date"
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                    />
                  </div>
                  <div>
                    <label htmlFor="time" className="mb-1 block text-sm font-medium text-slate-700">
                      Time
                    </label>
                    <input
                      id="time"
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (newTitle.trim()) {
                      setTodos((prev) => [
                        ...prev,
                        {
                          id: Date.now(),
                          title: newTitle.trim(),
                          note: "",
                          dueDate: newDate,
                          time: newTime,
                          done: false,
                          priority: "medium",
                        },
                      ]);
                      setNewTitle("");
                      setNewDate(dateKey(new Date()));
                      setNewTime("23:59");
                      setIsModalOpen(false);
                    }
                  }}
                  disabled={!newTitle.trim()}
                  className="mt-2 w-full rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-300/40 transition enabled:hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
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
