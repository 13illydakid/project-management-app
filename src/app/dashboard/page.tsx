"use client";
import { useEffect, useState } from "react";
// import { getServerSession } from "next-auth";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import SessionWrapper from "../SessionWrapper";
import styles from "./dashboard.module.css";

type Task = {
  id: string;
  title: string;
  status: string;
  dueDate?: string;
};

type Project = {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  dueDate?: string;
  tasks?: Task[];
};

function statusColor(status: string) {
  switch (status) {
    case "todo":
      return "bg-gray-300 text-gray-800";
    case "in-progress":
      return "bg-yellow-300 text-yellow-900";
    case "done":
      return "bg-green-300 text-green-900";
    default:
      return "bg-gray-200 text-gray-700";
  }
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<Project | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    startDate: "",
    dueDate: "",
  });
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"name" | "start" | "due">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    fetch("/api/projects", { credentials: "include" })
      .then((res) => res.json())
      .then(setProjects);
  }, [showNew]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProject),
      credentials: "include",
    });
    if (res.ok) {
      setShowNew(false);
      setNewProject({
        name: "",
        description: "",
        startDate: "",
        dueDate: "",
      });
      fetch("/api/projects", { credentials: "include" })
        .then((res) => res.json())
        .then(setProjects);
    } else {
      setError("Failed to create project");
    }
  };

  // const session = getServerSession(authOptions);
  const { data: session, status } = useSession();
  if (status === "loading") return <div>Loading...</div>;

  if (!session?.user?.email) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600 via-purple-600 to-cyan-500 animate-[pulse_12s_ease-in-out_infinite]" />
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-black/10 blur-3xl" />
        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <Link
            href="/auth/signin"
            className="bg-white/20 border border-white/30 text-white px-5 py-2 rounded-lg shadow hover:bg-white/30"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <SessionWrapper>
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600 via-purple-600 to-cyan-500" />
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-black/10 blur-3xl" />
        <div className="relative z-10 p-8">
          <div className="flex justify-between items-center mb-6 text-white">
            <h1 className="text-4xl font-extrabold tracking-tight drop-shadow-sm">
              {(session.user?.name?.trim() || "demo") + "'s Projects"}
            </h1>
            <div className="flex gap-4">
              <button
                onClick={() => setShowNew(true)}
                className="bg-white/20 border border-white/30 text-white px-5 py-2 rounded-lg shadow hover:bg-white/30 transition"
              >
                + New Project
              </button>
              <button
                onClick={() => signOut()}
                className="bg-white/20 border border-white/30 text-white px-5 py-2 rounded-lg shadow hover:bg-white/30 transition"
              >
                Sign Out
              </button>
            </div>
          </div>
          {/* Finder-style header controls */}
          <div className="flex items-center justify-between mb-3 text-white">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-red-500" />
              <span className="inline-block w-3 h-3 rounded-full bg-yellow-500" />
              <span className="inline-block w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="text-sm text-white/80">Projects</div>
          </div>
          {/* Toolbar: search + view toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between mb-4">
            <div className="flex-1">
              <input
                aria-label="Search projects"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or description"
                className="w-full bg-white/15 border border-white/25 rounded-lg px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-300"
              />
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 rounded-lg border ${
                  viewMode === "list"
                    ? "bg-white/25 border-white/40 text-white"
                    : "bg-white/10 border-white/25 text-white/80 hover:bg-white/20"
                }`}
                aria-label="Show projects as a list"
              >
                List
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 rounded-lg border ${
                  viewMode === "grid"
                    ? "bg-white/25 border-white/40 text-white"
                    : "bg-white/10 border-white/25 text-white/80 hover:bg-white/20"
                }`}
                aria-label="Show projects as a grid"
              >
                Grid
              </button>
            </div>
          </div>
          {(() => {
            const needle = search.trim().toLowerCase();
            const filtered = projects.filter((p) => {
              if (!needle) return true;
              return (
                p.name.toLowerCase().includes(needle) ||
                (p.description || "").toLowerCase().includes(needle)
              );
            });
            const getDateValue = (s?: string) =>
              s ? new Date(s).getTime() : Number.POSITIVE_INFINITY;
            const sorted = [...filtered].sort((a, b) => {
              let cmp = 0;
              if (sortKey === "name") {
                cmp = a.name.localeCompare(b.name);
              } else if (sortKey === "start") {
                cmp = getDateValue(a.startDate) - getDateValue(b.startDate);
              } else {
                cmp = getDateValue(a.dueDate) - getDateValue(b.dueDate);
              }
              return sortDir === "asc" ? cmp : -cmp;
            });
            const displayed = sorted;
            const sortIndicator = (key: typeof sortKey) => {
              if (sortKey !== key) return "";
              return sortDir === "asc" ? " ▲" : " ▼";
            };
            const onSort = (key: typeof sortKey) => {
              if (sortKey === key) {
                setSortDir((d) => (d === "asc" ? "desc" : "asc"));
              } else {
                setSortKey(key);
                setSortDir("asc");
              }
            };
            return (
              <>
                {viewMode === "list" ? (
                  <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-xl overflow-hidden">
                    <div className="grid grid-cols-5 text-xs text-white/80 bg-white/5 px-4 py-2 border-b border-white/20">
                      <button
                        className="col-span-2 text-left hover:text-white"
                        onClick={() => onSort("name")}
                      >
                        Name{sortIndicator("name")}
                      </button>
                      <div>Description</div>
                      <button
                        className="text-left hover:text-white"
                        onClick={() => onSort("start")}
                      >
                        Start{sortIndicator("start")}
                      </button>
                      <button
                        className="text-left hover:text-white"
                        onClick={() => onSort("due")}
                      >
                        Due{sortIndicator("due")}
                      </button>
                    </div>
                    <ul>
                      {displayed.map((p, idx) => (
                        <li
                          key={p.id}
                          className={`grid grid-cols-5 items-center px-4 py-3 text-white cursor-pointer ${
                            idx % 2 === 0 ? "bg-white/0" : "bg-white/[0.04]"
                          } border-b border-white/15 hover:bg-white/[0.08]`}
                          onClick={() => setSelected(p)}
                        >
                          <div className="col-span-2 flex items-center gap-3">
                            <span className="inline-block w-8 h-8 rounded bg-white/15" />
                            <span className="font-medium">{p.name}</span>
                          </div>
                          <div className="truncate text-white/80 pr-4">
                            {p.description || "-"}
                          </div>
                          <div className="text-white/80">
                            {p.startDate
                              ? new Date(p.startDate).toLocaleDateString()
                              : "-"}
                          </div>
                          <div className="text-white/80">
                            {p.dueDate
                              ? new Date(p.dueDate).toLocaleDateString()
                              : "-"}
                          </div>
                        </li>
                      ))}
                      {displayed.length === 0 && (
                        <li className="px-4 py-6 text-white/70">
                          No projects found.
                        </li>
                      )}
                    </ul>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                    {displayed.map((p) => (
                      <div
                        key={p.id}
                        className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-xl p-6 hover:scale-[1.02] transition cursor-pointer text-white"
                        onClick={() => setSelected(p)}
                      >
                        <h2 className="text-xl font-bold mb-2">{p.name}</h2>
                        <p className="text-white/80 mb-2">
                          {p.description || "No description"}
                        </p>
                        <div className="flex gap-2 text-xs mb-2">
                          <span className="bg-white/20 border border-white/30 px-2 py-1 rounded">
                            Start:{" "}
                            {p.startDate
                              ? new Date(p.startDate).toLocaleDateString()
                              : "-"}
                          </span>
                          <span className="bg-white/20 border border-white/30 px-2 py-1 rounded">
                            Due:{" "}
                            {p.dueDate
                              ? new Date(p.dueDate).toLocaleDateString()
                              : "-"}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {p.tasks?.map((t: Task) => (
                            <span
                              key={t.id}
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor(
                                t.status
                              )}`}
                            >
                              {t.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                    {displayed.length === 0 && (
                      <div className="text-white/70">No projects found.</div>
                    )}
                  </div>
                )}
              </>
            );
          })()}
          {/* Project Details Modal */}
          {selected && (
            <div
              className={`fixed inset-0 flex items-center justify-center z-50 ${styles.pointerAuto}`}
              onClick={() => setSelected(null)}
            >
              <div
                className="backdrop-blur-xl bg-white/10 border border-white/20 text-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white text-xl"
                >
                  &times;
                </button>
                <h2 className="text-2xl font-bold mb-2">{selected.name}</h2>
                <p className="text-white/80 mb-2">
                  {selected.description || "No description"}
                </p>
                <div className="flex gap-2 text-xs mb-4">
                  <span className="bg-white/20 border border-white/30 px-2 py-1 rounded">
                    Start:{" "}
                    {selected.startDate
                      ? new Date(selected.startDate).toLocaleDateString()
                      : "-"}
                  </span>
                  <span className="bg-white/20 border border-white/30 px-2 py-1 rounded">
                    Due:{" "}
                    {selected.dueDate
                      ? new Date(selected.dueDate).toLocaleDateString()
                      : "-"}
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Tasks</h3>
                <ul className="mb-4">
                  {selected.tasks?.length ? (
                    selected.tasks.map((t: Task) => (
                      <li
                        key={t.id}
                        className="flex justify-between items-center py-2 border-b border-white/20"
                      >
                        <span>{t.title}</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor(
                            t.status
                          )}`}
                        >
                          {t.status}
                        </span>
                        <span className="text-xs text-white/80">
                          {t.dueDate
                            ? new Date(t.dueDate).toLocaleDateString()
                            : "No due"}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="text-white/70">No tasks yet.</li>
                  )}
                </ul>
                <a
                  href={`/dashboard/${selected.id}`}
                  className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white px-4 py-2 rounded shadow hover:from-fuchsia-600 hover:to-cyan-600 transition"
                >
                  Go to Project
                </a>
              </div>
            </div>
          )}
          {/* New Project Modal */}
          {showNew && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <form
                onSubmit={handleCreate}
                className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fadeIn flex flex-col gap-4 text-white"
              >
                <button
                  type="button"
                  onClick={() => setShowNew(false)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white text-xl"
                >
                  &times;
                </button>
                <h2 className="text-xl font-bold mb-2">New Project</h2>
                <label htmlFor="project-name" className="text-sm text-white/80">
                  Project Name
                </label>
                <input
                  id="project-name"
                  type="text"
                  placeholder="Project Name"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                  className="bg-white/20 border border-white/30 rounded-lg px-3 py-2 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                  required
                />
                <label
                  htmlFor="project-description"
                  className="text-sm text-white/80"
                >
                  Description
                </label>
                <textarea
                  id="project-description"
                  placeholder="Description"
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      description: e.target.value,
                    })
                  }
                  className="bg-white/20 border border-white/30 rounded-lg px-3 py-2 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                  required
                />
                <label
                  htmlFor="project-start"
                  className="text-sm text-white/80"
                >
                  Start Date
                </label>
                <input
                  id="project-start"
                  type="date"
                  placeholder="Start Date"
                  value={newProject.startDate}
                  onChange={(e) =>
                    setNewProject({ ...newProject, startDate: e.target.value })
                  }
                  className="bg-white/20 border border-white/30 rounded-lg px-3 py-2 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                  required
                />
                <label htmlFor="project-due" className="text-sm text-white/80">
                  Due Date
                </label>
                <input
                  id="project-due"
                  type="date"
                  placeholder="Due Date"
                  value={newProject.dueDate}
                  onChange={(e) =>
                    setNewProject({ ...newProject, dueDate: e.target.value })
                  }
                  className="bg-white/20 border border-white/30 rounded-lg px-3 py-2 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                  required
                />
                {error && <div className="text-red-200 text-sm">{error}</div>}
                <button
                  type="submit"
                  className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white py-2 rounded-lg font-semibold shadow-lg hover:from-fuchsia-600 hover:to-cyan-600"
                >
                  Create Project
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </SessionWrapper>
  );
}
