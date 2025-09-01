"use client";
import React, { ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

// Whitelisted width classes for resizable columns (ensures Tailwind generates them)
const COL_WIDTH_CLASSES = [
  "w-[360px]",
  "w-[380px]",
  "w-[400px]",
  "w-[420px]",
  "w-[440px]",
  "w-[460px]",
  "w-[480px]",
  "w-[500px]",
  "w-[520px]",
  "w-[540px]",
  "w-[560px]",
  "w-[580px]",
  "w-[600px]",
  "w-[620px]",
  "w-[640px]",
  "w-[660px]",
  "w-[680px]",
  "w-[700px]",
  "w-[720px]",
  "w-[740px]",
  "w-[760px]",
  "w-[780px]",
  "w-[800px]",
  "w-[820px]",
  "w-[840px]",
  "w-[860px]",
  "w-[880px]",
  "w-[900px]",
] as const;
type ColWidthClass = (typeof COL_WIDTH_CLASSES)[number];
function widthToClass(px: number): ColWidthClass {
  const min = 360;
  const max = 900;
  const step = 20;
  const clamped = Math.max(min, Math.min(max, px));
  const snappedSteps = Math.round((clamped - min) / step);
  const idx = Math.min(COL_WIDTH_CLASSES.length - 1, Math.max(0, snappedSteps));
  return COL_WIDTH_CLASSES[idx];
}

export type ExplorerItem = {
  id: string;
  name: string;
  type: "folder" | "file" | "photo";
  url?: string;
  preview?: boolean;
  note?: string | null;
  uploadedAt?: string;
  size?: number | null;
  mimeType?: string | null;
};

type ApiDir = {
  id: string;
  name: string;
  note?: string | null;
  children?: ApiDir[];
  files?: ApiFile[];
};
type ApiFile = {
  id: string;
  name: string;
  url: string;
  note?: string | null;
  createdAt?: string;
  size?: number | null;
  mimeType?: string | null;
};

type ExplorerSelectItem = ExplorerItem & { dropFileId?: string };
type Project = { id: string; name: string };
type Task = {
  id: string;
  title: string;
  status: string;
  dueDate?: string | null;
};

interface ExplorerColumnProps {
  items: ExplorerItem[];
  selectedId: string | undefined;
  onSelect: (item: ExplorerItem | ExplorerSelectItem) => void;
  type: "folder" | "file" | "preview";
  label: string;
  path: string;
  projectId: string;
  onNoteIconClick: (item: ExplorerItem) => void;
}

function getPath(selected: ExplorerItem[], endIdx?: number): string {
  const end =
    typeof endIdx === "number"
      ? Math.min(endIdx + 1, selected.length)
      : selected.length;
  return selected
    .slice(0, end)
    .map((it) => it.name)
    .join("/");
}

function ExplorerColumn({
  items,
  selectedId,
  onSelect,
  type,
  label,
  path,
  projectId,
  onNoteIconClick,
}: ExplorerColumnProps) {
  const [openFolders, setOpenFolders] = useState<{ [id: string]: boolean }>({});

  const handleToggle = (item: ExplorerItem) => {
    if (item.type !== "folder") return;
    setOpenFolders((prev) => ({ ...prev, [item.id]: !prev[item.id] }));
  };

  return (
    <div className="min-w-[22rem] sm:min-w-[26rem] min-h-[400px] backdrop-blur-xl bg-black/30 border border-white/10 text-gray-100 rounded-2xl shadow p-4 mr-4 flex flex-col gap-2">
      <div className="mb-2 font-bold text-gray-100/90 text-sm">{label}</div>
      {type === "preview"
        ? items[0] && <PreviewPane item={items[0]} />
        : items.map((item) => (
            <div key={item.id}>
              <div
                className={`cursor-pointer px-3 py-2 rounded-lg flex items-center justify-between transition border relative ${
                  selectedId === item.id
                    ? "bg-white/20 border-white/40"
                    : "hover:bg-white/10 border-white/10"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(item);
                }}
                draggable={type === "file"}
                onDragStart={
                  type === "file"
                    ? (e) => e.dataTransfer.setData("fileId", item.id)
                    : undefined
                }
                onDragOver={
                  type === "folder" ? (e) => e.preventDefault() : undefined
                }
                onDrop={
                  type === "folder"
                    ? (e) => {
                        e.preventDefault();
                        const fileId = e.dataTransfer.getData("fileId");
                        if (fileId) {
                          onSelect({
                            ...(item as ExplorerItem),
                            dropFileId: fileId,
                          } as ExplorerSelectItem);
                        }
                      }
                    : undefined
                }
              >
                <span className="flex items-center gap-2 font-semibold break-words">
                  {item.name}
                </span>
                {item.note && (
                  <button
                    type="button"
                    className="absolute -left-6 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full border border-white/30 bg-white/10 text-white/80 hover:text-white hover:bg-white/20 hover:scale-110 transition"
                    title="View note(tasks)"
                    aria-label="View note(tasks)"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNoteIconClick(item);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-3.5 h-3.5"
                    >
                      <path d="M5 3a2 2 0 0 0-2 2v14.586A1 1 0 0 0 4.707 21L8 17.707 11.293 21A1 1 0 0 0 13 20.586V5a2 2 0 0 0-2-2H5Z" />
                    </svg>
                  </button>
                )}
                {item.type === "folder" && (
                  <button
                    className="ml-2 p-1 text-xs rounded hover:bg-white/10"
                    aria-label={
                      openFolders[item.id]
                        ? "Hide folder contents"
                        : "Show folder contents"
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(item);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className={`w-4 h-4 transition-transform ${
                        openFolders[item.id] ? "rotate-180" : "rotate-0"
                      }`}
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.585l3.71-3.355a.75.75 0 111.02 1.1l-4.22 3.815a.75.75 0 01-1.02 0L5.25 8.33a.75.75 0 01-.02-1.12z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
                {item.type === "folder" && (
                  <span className="text-xs bg-white/10 border border-white/20 text-gray-100 px-2 py-1 rounded ml-2">
                    Folder
                  </span>
                )}
                {item.type === "file" && (
                  <span className="text-xs bg-white/10 border border-white/20 text-gray-100 px-2 py-1 rounded ml-2">
                    File
                  </span>
                )}
              </div>
              {/* Dropdown for folder contents */}
              {item.type === "folder" && openFolders[item.id] && (
                <FolderContents folderId={item.id} projectId={projectId} />
              )}
            </div>
          ))}
      {selectedId && type !== "preview" && (
        <div className="mt-4 text-xs text-gray-300">
          <span className="font-semibold">Path:</span> {path}
        </div>
      )}
    </div>
  );
}

// Simple preview component for different file types
function PreviewPane({ item }: { item: ExplorerItem }) {
  if (!item.url)
    return <div className="text-gray-500">No preview available</div>;
  const url = item.url;
  const mime = item.mimeType || "";
  const name = item.name || "";

  // Determine if this is a text/code-like file
  const looksText =
    /^text\//.test(mime) ||
    /\.(txt|md|markdown|js|jsx|ts|tsx|json|css|scss|sass|less|html|htm|xml|yml|yaml|toml|ini|cfg|py|rb|go|java|kt|c|h|cpp|hpp|cs|rs|sh|sql)$/i.test(
      name
    );

  // Basic handlers for common types first
  if (item.type === "photo" || /image\//.test(mime)) {
    return (
      <div className="flex flex-col items-center p-2">
        <Image
          src={url}
          alt={item.name}
          width={400}
          height={300}
          className="max-w-full max-h-80"
          style={{ objectFit: "contain" }}
        />
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 text-cyan-400 underline"
        >
          Open original
        </a>
      </div>
    );
  }
  if (mime === "application/pdf" || url.match(/\.pdf$/i)) {
    return (
      <object
        data={url}
        type="application/pdf"
        className="w-full h-[360px] border border-white/10 rounded"
      >
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 underline"
        >
          Open PDF
        </a>
      </object>
    );
  }
  if (/audio\//.test(mime)) {
    return <audio src={url} controls className="w-full" />;
  }
  if (/video\//.test(mime)) {
    return <video src={url} controls className="w-full h-[300px]" />;
  }

  // Text/code preview: render text component
  if (looksText) {
    return <TextPreview url={url} name={name} />;
  }

  // Generic fallback
  return (
    <div className="p-2">
      <div className="mb-2">{item.name}</div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-cyan-400 underline"
      >
        Download / Open
      </a>
    </div>
  );
}

function TextPreview({ url, name }: { url: string; name: string }) {
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [truncated, setTruncated] = useState<boolean>(false);
  useEffect(() => {
    let canceled = false;
    setLoading(true);
    setError(null);
    setTextContent(null);
    setTruncated(false);
    const LIMIT = 200_000; // characters
    fetch(url)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const txt = await res.text();
        if (canceled) return;
        if (txt.length > LIMIT) {
          setTextContent(txt.slice(0, LIMIT));
          setTruncated(true);
        } else {
          setTextContent(txt);
        }
      })
      .catch((e) => {
        if (canceled) return;
        setError(e?.message || "Failed to load preview");
      })
      .finally(() => !canceled && setLoading(false));
    return () => {
      canceled = true;
    };
  }, [url]);

  return (
    <div className="p-2">
      <div className="mb-2 text-sm text-gray-300">{name}</div>
      {loading && <div className="text-gray-400">Loading preview…</div>}
      {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
      {textContent != null && (
        <pre className="bg-black/30 border border-white/10 rounded-lg p-3 max-h-80 overflow-auto text-xs sm:text-sm whitespace-pre font-mono text-gray-100">
          {textContent}
        </pre>
      )}
      <div className="mt-2 flex items-center gap-3">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 underline"
        >
          Open original
        </a>
        {truncated && (
          <span className="text-xs text-gray-400">
            Truncated preview (200k chars)
          </span>
        )}
      </div>
    </div>
  );
}

// List view with sortable headers
function ListView({
  items,
  onSelect,
  onNoteIconClick,
}: {
  items: ExplorerItem[];
  onSelect: (item: ExplorerItem) => void;
  onNoteIconClick: (item: ExplorerItem) => void;
}) {
  const [sortKey, setSortKey] = useState<
    "name" | "type" | "size" | "uploadedAt"
  >("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sorted = React.useMemo(() => {
    const arr = [...items];
    const dir = sortDir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      if (sortKey === "size") {
        const ai = typeof a.size === "number" ? a.size : -1;
        const bi = typeof b.size === "number" ? b.size : -1;
        return (ai - bi) * dir;
      }
      const as = String(av).toLowerCase();
      const bs = String(bv).toLowerCase();
      if (as < bs) return -1 * dir;
      if (as > bs) return 1 * dir;
      return 0;
    });
    return arr;
  }, [items, sortKey, sortDir]);

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const fmtSize = (n?: number | null) => {
    if (n == null || n < 0) return "";
    if (n < 1024) return `${n} B`;
    const kb = n / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    const gb = mb / 1024;
    return `${gb.toFixed(1)} GB`;
  };

  const header = (key: typeof sortKey, label: string) => {
    return (
      <th
        scope="col"
        className="px-3 py-2 text-left cursor-pointer select-none"
        onClick={() => toggleSort(key)}
      >
        <span className="inline-flex items-center gap-1">
          {label}
          {sortKey === key && (
            <span className="text-xs">{sortDir === "asc" ? "▲" : "▼"}</span>
          )}
        </span>
      </th>
    );
  };

  return (
    <div className="w-full">
      <table className="min-w-[720px] w-full bg-black/30 border border-white/10 text-gray-100 rounded-2xl shadow overflow-hidden">
        <thead className="bg-white/10 text-sm text-gray-300">
          <tr>
            {header("name", "Name")}
            {header("type", "Type")}
            {header("size", "Size")}
            {header("uploadedAt", "Uploaded")}
          </tr>
        </thead>
        <tbody>
          {sorted.map((it) => (
            <tr
              key={it.id}
              className="border-t border-white/10 hover:bg-white/5 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(it);
              }}
            >
              <td className="px-3 py-2">
                <span className="inline-flex items-center gap-2">
                  {it.note && (
                    <button
                      type="button"
                      className="flex items-center justify-center w-5 h-5 rounded-full border border-white/30 bg-white/10 text-white/80 hover:text-white hover:bg-white/20 hover:scale-110 transition"
                      title="View note(tasks)"
                      aria-label="View note(tasks)"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNoteIconClick(it);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-3.5 h-3.5"
                      >
                        <path d="M5 3a2 2 0 0 0-2 2v14.586A1 1 0 0 0 4.707 21L8 17.707 11.293 21A1 1 0 0 0 13 20.586V5a2 2 0 0 0-2-2H5Z" />
                      </svg>
                    </button>
                  )}
                  {it.name}
                </span>
              </td>
              <td className="px-3 py-2 text-sm text-gray-300">
                {it.mimeType || it.type}
              </td>
              <td className="px-3 py-2 text-sm text-gray-300">
                {fmtSize(it.size)}
              </td>
              <td className="px-3 py-2 text-sm text-gray-300">
                {it.uploadedAt ? new Date(it.uploadedAt).toLocaleString() : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Helper component to fetch and show folder contents, indented
function FolderContents({
  folderId,
  projectId,
}: {
  folderId: string;
  projectId: string;
}) {
  const [contents, setContents] = useState<ExplorerItem[]>([]);
  useEffect(() => {
    fetch(`/api/projects/${projectId}/directory/${folderId}`)
      .then((res) => res.json())
      .then((dir: { children?: ApiDir[]; files?: ApiFile[] }) => {
        const children: ExplorerItem[] = (dir.children || []).map((d) => ({
          id: d.id,
          name: d.name,
          type: "folder",
        }));
        const files: ExplorerItem[] = (dir.files || []).map((f) => ({
          id: f.id,
          name: f.name,
          type: f.url?.match(/\.(jpg|jpeg|png|gif)$/i) ? "photo" : "file",
          url: f.url,
        }));
        setContents([...children, ...files]);
      });
  }, [folderId, projectId]);
  return (
    <div className="ml-1">
      {contents.map((item) => (
        <div key={item.id} className="pl-2 py-1 text-sm">
          <span>{item.name}</span>
          <span className="ml-2 text-xs text-gray-500">{item.type}</span>
        </div>
      ))}
    </div>
  );
}

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = React.use(params);

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<ExplorerItem[][]>([]);
  const [selected, setSelected] = useState<ExplorerItem[]>([]);
  const [showUpload, setShowUpload] = useState<boolean>(false);
  const [showNewFolder, setShowNewFolder] = useState<boolean>(false);
  const [showDelete, setShowDelete] = useState<boolean>(false);
  const [deleteTarget, setDeleteTarget] = useState<ExplorerItem | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"columns" | "list">("columns");
  // list view sorting will be handled inside a dedicated component in the future
  const folderUploadRef = React.useRef<HTMLInputElement>(null);
  const [showRename, setShowRename] = useState<boolean>(false);
  const [renameTarget, setRenameTarget] = useState<ExplorerItem | null>(null);
  const [showNote, setShowNote] = useState<boolean>(false);
  const [noteTarget, setNoteTarget] = useState<ExplorerItem | null>(null);
  const [noteDraft, setNoteDraft] = useState<string>("");
  // dynamic column widths (in pixels), one per column
  const [colWidths, setColWidths] = useState<number[]>([]);
  const dragRef = React.useRef<{
    idx: number | null;
    startX: number;
    startW: number;
  }>({ idx: null, startX: 0, startW: 0 });

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((res) => res.json())
      .then((data) => {
        setProject(data);
        setTasks(data.tasks || []);
      });
  }, [projectId]);

  // enable directory selection on the hidden input
  useEffect(() => {
    if (folderUploadRef.current) {
      try {
        folderUploadRef.current.setAttribute("webkitdirectory", "");
        folderUploadRef.current.setAttribute("directory", "");
        folderUploadRef.current.setAttribute("multiple", "");
      } catch {
        // ignore if not supported
      }
    }
  }, []);

  // Load root directory
  useEffect(() => {
    fetch(`/api/projects/${projectId}/directory`)
      .then((res) => res.json())
      .then((rootDirs) => {
        // Always fetch root files and include in first column
        fetch(`/api/projects/${projectId}/file`)
          .then((res) => res.json())
          .then((rootFiles) => {
            const dirs: ApiDir[] = Array.isArray(rootDirs)
              ? (rootDirs as ApiDir[])
              : [];
            const filesApi: ApiFile[] = Array.isArray(rootFiles)
              ? (rootFiles as ApiFile[])
              : [];
            const dirItems: ExplorerItem[] = dirs.map((d) => ({
              id: d.id,
              name: d.name,
              type: "folder",
              note: d.note ?? null,
            }));
            const fileItems: ExplorerItem[] = filesApi.map((f) => ({
              id: f.id,
              name: f.name,
              type: f.url?.match(/\.(jpg|jpeg|png|gif)$/i) ? "photo" : "file",
              url: f.url,
              note: f.note ?? null,
              uploadedAt: f.createdAt ?? undefined,
              size: f.size ?? null,
              mimeType: f.mimeType ?? null,
            }));
            setColumns([[...dirItems, ...fileItems]]);
            setSelected([]);
          });
      });
  }, [projectId]);

  // Persist and restore view mode
  useEffect(() => {
    const key = `project:${projectId}:viewMode`;
    try {
      const saved = localStorage.getItem(key);
      if (saved === "list" || saved === "columns") setViewMode(saved);
    } catch {}
  }, [projectId]);

  useEffect(() => {
    const key = `project:${projectId}:viewMode`;
    try {
      localStorage.setItem(key, viewMode);
    } catch {}
  }, [projectId, viewMode]);

  // Sync column widths to number of columns
  useEffect(() => {
    if (!columns || columns.length === 0) return;
    setColWidths((prev) => {
      const next = [...prev];
      const DEFAULT_W = 420; // px
      if (next.length < columns.length) {
        while (next.length < columns.length) next.push(DEFAULT_W);
      } else if (next.length > columns.length) {
        next.length = columns.length;
      }
      return next;
    });
  }, [columns]);

  // Global mouse handlers for resizing
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const idx = dragRef.current.idx;
      if (idx == null) return;
      e.preventDefault();
      const dx = e.clientX - dragRef.current.startX;
      setColWidths((ws) => {
        const arr = [...ws];
        const MIN = 360;
        const MAX = 900;
        const base = dragRef.current.startW;
        const next = Math.max(MIN, Math.min(MAX, base + dx));
        arr[idx] = next;
        return arr;
      });
    };
    const onUp = () => {
      dragRef.current.idx = null;
      document.body.classList.remove("select-none");
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  // Load next column when folder selected

  // Selection handler
  const handleSelect = async (colIdx: number, item: ExplorerItem) => {
    const newSelected = [...selected.slice(0, colIdx), item];
    setSelected(newSelected);

    // Drag-and-drop move support: if a fileId is present, move it into this folder first
    const maybeDrop = (item as ExplorerSelectItem).dropFileId;
    if (isFolder(item)) {
      if (maybeDrop) {
        await fetch(`/api/projects/${projectId}/file/${maybeDrop}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ directoryId: item.id }),
        });
      }
      // Fetch children and files for the selected folder
      const res = await fetch(
        `/api/projects/${projectId}/directory/${item.id}`
      );
      const dir = await res.json();
      const childrenArr: ApiDir[] = Array.isArray(dir?.children)
        ? (dir.children as ApiDir[])
        : [];
      const filesArr: ApiFile[] = Array.isArray(dir?.files)
        ? (dir.files as ApiFile[])
        : [];
      const children: ExplorerItem[] = childrenArr.map((d) => ({
        id: d.id,
        name: d.name,
        type: "folder",
        note: d.note ?? null,
      }));
      const files: ExplorerItem[] = filesArr.map((f) => ({
        id: f.id,
        name: f.name,
        type: f.url?.match(/\.(jpg|jpeg|png|gif)$/i) ? "photo" : "file",
        url: f.url,
        note: f.note ?? null,
        uploadedAt: f.createdAt ?? undefined,
        size: f.size ?? null,
        mimeType: f.mimeType ?? null,
      }));
      // Always append a new column for the next folder level
      setColumns([...columns.slice(0, colIdx + 1), [...children, ...files]]);
    } else if (item.type === "file" || item.type === "photo") {
      // Always append a new column for preview
      setColumns([
        ...columns.slice(0, colIdx + 1),
        [{ ...(item as ExplorerItem), preview: true }],
      ]);
    } else {
      // Just trim columns if not folder or file
      setColumns([...columns.slice(0, colIdx + 1)]);
    }
  };

  // Add folder
  const handleAddFolder = async (): Promise<void> => {
    setShowNewFolder(true);
  };
  const handleCreateFolder = async (
    name: string,
    parentId?: string
  ): Promise<void> => {
    await fetch(`/api/projects/${projectId}/directory`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, parentId }),
    });
    setShowNewFolder(false);
    // reload root
    fetch(`/api/projects/${projectId}/directory`)
      .then((res) => res.json())
      .then((rootDirs) => {
        fetch(`/api/projects/${projectId}/file`)
          .then((res) => res.json())
          .then((rootFiles) => {
            const dirs: ApiDir[] = Array.isArray(rootDirs)
              ? (rootDirs as ApiDir[])
              : [];
            const filesApi: ApiFile[] = Array.isArray(rootFiles)
              ? (rootFiles as ApiFile[])
              : [];
            const dirItems: ExplorerItem[] = dirs.map((d) => ({
              id: d.id,
              name: d.name,
              type: "folder",
            }));
            const fileItems: ExplorerItem[] = filesApi.map((f) => ({
              id: f.id,
              name: f.name,
              type: f.url?.match(/\.(jpg|jpeg|png|gif)$/i) ? "photo" : "file",
              url: f.url,
            }));
            setColumns([[...dirItems, ...fileItems]]);
          });
      });
  };

  // Upload file
  const handleUpload = async (
    e: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    setUploading(true);
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    // If a folder is selected, upload into it
    const targetDirId =
      selected.length && selected[selected.length - 1].type === "folder"
        ? selected[selected.length - 1].id
        : undefined;
    if (targetDirId) formData.append("directoryId", targetDirId);
    await fetch(`/api/projects/${projectId}/file`, {
      method: "POST",
      body: formData,
    });
    setUploading(false);
    setShowUpload(false);
    // reload root
    fetch(`/api/projects/${projectId}/directory`)
      .then((res) => res.json())
      .then((rootDirs) => {
        fetch(`/api/projects/${projectId}/file`)
          .then((res) => res.json())
          .then((rootFiles) => {
            const dirs: ApiDir[] = Array.isArray(rootDirs)
              ? (rootDirs as ApiDir[])
              : [];
            const filesApi: ApiFile[] = Array.isArray(rootFiles)
              ? (rootFiles as ApiFile[])
              : [];
            const dirItems: ExplorerItem[] = dirs.map((d) => ({
              id: d.id,
              name: d.name,
              type: "folder",
            }));
            const fileItems: ExplorerItem[] = filesApi.map((f) => ({
              id: f.id,
              name: f.name,
              type: f.url?.match(/\.(jpg|jpeg|png|gif)$/i) ? "photo" : "file",
              url: f.url,
            }));
            setColumns([[...dirItems, ...fileItems]]);
          });
      });
  };

  // Delete logic
  const handleDelete = async (): Promise<void> => {
    if (!deleteTarget) return;
    const isFile = deleteTarget.url;
    const endpoint = isFile ? "file" : "directory";
    await fetch(`/api/projects/${projectId}/${endpoint}/${deleteTarget.id}`, {
      method: "DELETE",
    });
    setShowDelete(false);
    setDeleteTarget(null);
    // reload root
    fetch(`/api/projects/${projectId}/directory`)
      .then((res) => res.json())
      .then((rootDirs) => {
        fetch(`/api/projects/${projectId}/file`)
          .then((res) => res.json())
          .then((rootFiles) => {
            const dirs: ApiDir[] = Array.isArray(rootDirs)
              ? (rootDirs as ApiDir[])
              : [];
            const filesApi: ApiFile[] = Array.isArray(rootFiles)
              ? (rootFiles as ApiFile[])
              : [];
            const dirItems: ExplorerItem[] = dirs.map((d) => ({
              id: d.id,
              name: d.name,
              type: "folder",
            }));
            const fileItems: ExplorerItem[] = filesApi.map((f) => ({
              id: f.id,
              name: f.name,
              type: f.url?.match(/\.(jpg|jpeg|png|gif)$/i) ? "photo" : "file",
              url: f.url,
            }));
            setColumns([[...dirItems, ...fileItems]]);
          });
      });
  };

  if (!project) return <div>Loading...</div>;

  // Selection-derived flags for UI logic
  const lastSelected: ExplorerItem | null = selected.length
    ? selected[selected.length - 1]
    : null;
  const hasSelectable = !!lastSelected && !lastSelected.preview;
  const selectedIsFolder = hasSelectable && lastSelected!.type === "folder";
  // Uploads are allowed when targeting a folder or root (nothing selected)
  const canUploadTargets = !!selectedIsFolder || !hasSelectable;

  return (
    <div
      className={`${inter.className} min-h-screen relative overflow-hidden`}
      onClick={() => {
        if (hasSelectable) setSelected([]);
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 to-slate-900" />
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-white/5 blur-3xl" />
      <div
        className="relative z-10 p-6 sm:p-8 text-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/dashboard"
            className="bg-white/10 border border-white/20 text-gray-100 px-3 py-1 rounded text-sm font-semibold hover:bg-white/15"
          >
            &larr; Back
          </Link>
          <h1 className="text-2xl font-bold drop-shadow-sm">{project.name}</h1>
          {/* Removed New Task */}
        </div>
        <ul className="mt-4 hidden">
          {tasks.map((t: Task) => (
            <li
              key={t.id}
              className="border-b py-2 flex justify-between items-center"
            >
              <span>{t.title}</span>
              <span className="text-xs text-gray-500">{t.status}</span>
              <span className="text-xs text-gray-400">
                {t.dueDate
                  ? new Date(t.dueDate).toLocaleDateString()
                  : "No due"}
              </span>
              <form
                method="post"
                action={`/api/projects/${project.id}/tasks/${t.id}`}
                className="inline"
              >
                <label htmlFor={`status-select-${t.id}`} className="sr-only">
                  Status
                </label>
                <select
                  id={`status-select-${t.id}`}
                  name="status"
                  defaultValue={t.status}
                  className="ml-2 p-1 border rounded"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
                <button
                  type="submit"
                  className="ml-2 px-2 py-1 bg-blue-500 text-white rounded"
                >
                  Update
                </button>
              </form>
            </li>
          ))}
        </ul>
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Left controls */}
          <aside
            className="backdrop-blur-xl bg-black/30 border border-white/10 rounded-2xl p-4 flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("columns")}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border ${
                  viewMode === "columns"
                    ? "bg-white/25 border-white/40 text-white"
                    : "bg-white/10 border-white/25 text-white/80 hover:bg-white/20"
                }`}
                aria-label="Column view"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M9 4.5H6A1.5 1.5 0 0 0 4.5 6v12A1.5 1.5 0 0 0 6 19.5h3A1.5 1.5 0 0 0 10.5 18V6A1.5 1.5 0 0 0 9 4.5Zm9 0h-3A1.5 1.5 0 0 0 13.5 6v12A1.5 1.5 0 0 0 15 19.5h3A1.5 1.5 0 0 0 19.5 18V6A1.5 1.5 0 0 0 18 4.5Z" />
                </svg>
                Columns
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border ${
                  viewMode === "list"
                    ? "bg-white/25 border-white/40 text-white"
                    : "bg-white/10 border-white/25 text-white/80 hover:bg-white/20"
                }`}
                aria-label="List view"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M4 7a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H5A1 1 0 0 1 4 7Zm0 5a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1Zm1 4a1 1 0 1 0 0 2h14a1 1 0 1 0 0-2H5Z" />
                </svg>
                List
              </button>
            </div>
            <button
              onClick={() => canUploadTargets && setShowUpload(true)}
              disabled={!canUploadTargets}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${
                canUploadTargets
                  ? "bg-white/15 border-white/30 hover:bg-white/25"
                  : "bg-white/5 border-white/10 opacity-50 cursor-not-allowed"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M12 3a1 1 0 0 1 1 1v7.586l2.293-2.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4A1 1 0 1 1 8.707 9.293L11 11.586V4a1 1 0 0 1 1-1ZM4 15a2 2 0 0 1 2-2h12a2 2 0 1 1 0 4H6a2 2 0 0 1-2-2Z" />
              </svg>
              Upload File
            </button>
            <button
              onClick={() =>
                canUploadTargets && folderUploadRef.current?.click()
              }
              disabled={!canUploadTargets}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${
                canUploadTargets
                  ? "bg-white/15 border-white/30 hover:bg-white/25"
                  : "bg-white/5 border-white/10 opacity-50 cursor-not-allowed"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1h-7a2 2 0 0 0-2 2v5H5a2 2 0 0 1-2-2V6Zm18 7a1 1 0 0 1 1 1v2h1a1 1 0 1 1 0 2h-1v2a1 1 0 1 1-2 0v-2h-2a1 1 0 1 1 0-2h2v-2a1 1 0 0 1 1-1Z" />
              </svg>
              Upload Folder
            </button>
            <button
              onClick={() => canUploadTargets && handleAddFolder()}
              disabled={!canUploadTargets}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${
                canUploadTargets
                  ? "bg-white/15 border-white/30 hover:bg-white/25"
                  : "bg-white/5 border-white/10 opacity-50 cursor-not-allowed"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Zm14 3a1 1 0 0 0-1 1v1h-1a1 1 0 1 0 0 2h1v1a1 1 0 1 0 2 0v-1h1a1 1 0 1 0 0-2h-1V10a1 1 0 0 0-1-1Z" />
              </svg>
              Add Folder
            </button>
            <div className="h-px bg-white/20 my-1" />
            <button
              onClick={() => {
                if (!hasSelectable) return;
                setRenameTarget(lastSelected!);
                setShowRename(true);
              }}
              disabled={!hasSelectable}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${
                hasSelectable
                  ? "bg-white/15 border-white/30 hover:bg-white/25"
                  : "bg-white/5 border-white/10 opacity-50 cursor-not-allowed"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm14.71-9.04a1 1 0 0 0 0-1.41l-2.5-2.5a1 1 0 0 0-1.41 0l-1.29 1.29 3.75 3.75 1.45-1.13Z" />
              </svg>
              Rename Selected
            </button>
            <button
              onClick={() => {
                if (!hasSelectable) return;
                setNoteTarget(lastSelected!);
                setNoteDraft((lastSelected!.note as string) || "");
                setShowNote(true);
              }}
              disabled={!hasSelectable}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${
                hasSelectable
                  ? "bg-white/15 border-white/30 hover:bg-white/25"
                  : "bg-white/5 border-white/10 opacity-50 cursor-not-allowed"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M5 4a2 2 0 0 0-2 2v12.586A1 1 0 0 0 4.707 19L8 15.707 11.293 19A1 1 0 0 0 13 18.586V6a2 2 0 0 0-2-2H5Z" />
              </svg>
              Add/View note(tasks)
            </button>
            <button
              onClick={() => {
                if (!hasSelectable) return;
                setShowDelete(true);
                setDeleteTarget(lastSelected!);
              }}
              disabled={!hasSelectable}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${
                hasSelectable
                  ? "bg-white/15 border-white/30 hover:bg-white/25"
                  : "bg-white/5 border-white/10 opacity-50 cursor-not-allowed"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M9 3a1 1 0 0 0-1 1v1H4a1 1 0 1 0 0 2h1v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7h1a1 1 0 1 0 0-2h-4V4a1 1 0 0 0-1-1H9Zm2 4a1 1 0 1 0-2 0v10a1 1 0 1 0 2 0V7Zm4 0a1 1 0 1 0-2 0v10a1 1 0 1 0 2 0V7Z" />
              </svg>
              Delete Selected
            </button>
            <label htmlFor="folder-upload-input" className="sr-only">
              Upload Folder
            </label>
            <input
              id="folder-upload-input"
              ref={folderUploadRef}
              type="file"
              className="hidden"
              aria-label="Upload Folder"
              onChange={async (e) => {
                const files = e.currentTarget.files;
                if (!files || files.length === 0) return;
                const dirMap = new Map<string, string>();
                const ensureDir = async (
                  parts: string[]
                ): Promise<string | undefined> => {
                  if (parts.length === 0) return undefined;
                  const key = parts.join("/");
                  if (dirMap.has(key)) return dirMap.get(key);
                  const parentId = await ensureDir(parts.slice(0, -1));
                  const name = parts[parts.length - 1];
                  const res = await fetch(
                    `/api/projects/${projectId}/directory`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name, parentId }),
                    }
                  );
                  const dir = await res.json();
                  dirMap.set(key, dir.id);
                  return dir.id as string;
                };
                for (const f of Array.from(files)) {
                  const f2 = f as File & { webkitRelativePath?: string };
                  const rel: string = f2.webkitRelativePath || f2.name;
                  const segs = rel.split("/");
                  segs.pop();
                  const dirId = await ensureDir(segs);
                  const fd = new FormData();
                  fd.append("file", f2);
                  if (dirId) fd.append("directoryId", dirId);
                  await fetch(`/api/projects/${projectId}/file`, {
                    method: "POST",
                    body: fd,
                  });
                }
                e.currentTarget.value = "";
                fetch(`/api/projects/${projectId}/directory`)
                  .then((r) => r.json())
                  .then((rootDirs) => {
                    fetch(`/api/projects/${projectId}/file`)
                      .then((r) => r.json())
                      .then((rootFiles) => {
                        const dirs: ApiDir[] = Array.isArray(rootDirs)
                          ? (rootDirs as ApiDir[])
                          : [];
                        const filesApi: ApiFile[] = Array.isArray(rootFiles)
                          ? (rootFiles as ApiFile[])
                          : [];
                        const dirItems: ExplorerItem[] = dirs.map((d) => ({
                          id: d.id,
                          name: d.name,
                          type: "folder",
                          note: d.note ?? null,
                        }));
                        const fileItems: ExplorerItem[] = filesApi.map((f) => ({
                          id: f.id,
                          name: f.name,
                          type: f.url?.match(/\.(jpg|jpeg|png|gif)$/i)
                            ? "photo"
                            : "file",
                          url: f.url,
                          note: f.note ?? null,
                          uploadedAt: f.createdAt ?? undefined,
                          size: f.size ?? null,
                          mimeType: f.mimeType ?? null,
                        }));
                        setColumns([[...dirItems, ...fileItems]]);
                      });
                  });
              }}
            />
          </aside>
          {/* Centered explorer */}
          <section className="min-w-0" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 text-sm text-gray-300">
              <span className="font-semibold">Current Path:</span>{" "}
              {getPath(selected)}
            </div>
            {viewMode === "columns" && (
              <div className="w-full overflow-auto">
                <div className="flex justify-center">
                  <div className="flex gap-2">
                    {columns.map((items, idx) => (
                      <div key={idx} className="flex items-stretch">
                        <div
                          className={`shrink-0 ${widthToClass(
                            colWidths[idx] ?? 420
                          )}`}
                        >
                          <ExplorerColumn
                            items={items}
                            selectedId={selected[idx]?.id}
                            onSelect={(item) => handleSelect(idx, item)}
                            type={
                              items[0]?.preview
                                ? "preview"
                                : items[0]?.url
                                ? "file"
                                : "folder"
                            }
                            label={
                              items[0]?.preview
                                ? "Preview"
                                : items[0]?.url
                                ? "Files"
                                : `Folder Level ${idx + 1}`
                            }
                            path={getPath(selected, idx)}
                            projectId={projectId}
                            onNoteIconClick={(it) => {
                              setNoteTarget(it);
                              setNoteDraft((it.note as string) || "");
                              setShowNote(true);
                            }}
                          />
                        </div>
                        {idx < columns.length - 1 && (
                          <div
                            role="separator"
                            aria-label="Resize column"
                            title="Drag to resize"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              dragRef.current.idx = idx;
                              dragRef.current.startX = e.clientX;
                              dragRef.current.startW = colWidths[idx] ?? 420;
                              document.body.classList.add("select-none");
                            }}
                            className="w-1.5 mx-1 cursor-col-resize rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {viewMode === "list" && (
              <div className="backdrop-blur-xl bg-black/30 border border-white/10 rounded-2xl p-2">
                <ListView
                  items={(
                    columns[
                      (function () {
                        let i = columns.length - 1;
                        for (; i >= 0; i--) {
                          if (!columns[i][0]?.preview) return i;
                        }
                        return columns.length - 1;
                      })()
                    ] || []
                  ).filter((i) => !i.preview)}
                  onSelect={(item) => {
                    const idx = (function () {
                      let i = columns.length - 1;
                      for (; i >= 0; i--) {
                        if (!columns[i][0]?.preview) return i;
                      }
                      return columns.length - 1;
                    })();
                    handleSelect(idx, item);
                  }}
                  onNoteIconClick={(it) => {
                    setNoteTarget(it);
                    setNoteDraft((it.note as string) || "");
                    setShowNote(true);
                  }}
                />
              </div>
            )}
          </section>
        </div>
      </div>
      {showUpload && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
          <div className="backdrop-blur-xl bg-gradient-to-tl from-slate-900 to-slate-950 text-gray-100 border border-white/10 p-8 rounded-2xl shadow-2xl relative">
            <button
              onClick={() => setShowUpload(false)}
              className="absolute top-2 right-2 text-gray-300 hover:text-gray-100"
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-4">Upload File</h2>
            <label htmlFor="file-upload" className="block mb-2 font-semibold">
              Select file to upload
            </label>
            <input
              id="file-upload"
              type="file"
              onChange={handleUpload}
              disabled={uploading}
              title="Choose a file to upload"
            />
            {uploading && (
              <div className="mt-2 text-cyan-400">Uploading...</div>
            )}
          </div>
        </div>
      )}
      {/* Rename Modal */}
      {showRename && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
          <div className="backdrop-blur-xl bg-gradient-to-tl from-slate-900 to-slate-950 text-gray-100 border border-white/10 p-8 rounded-2xl shadow-2xl relative">
            <button
              onClick={() => setShowRename(false)}
              className="absolute top-2 right-2 text-gray-300 hover:text-gray-100"
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-4">Rename</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const input = form.elements.namedItem(
                  "newName"
                ) as HTMLInputElement;
                const newName = input.value.trim();
                if (!renameTarget || !newName) return;
                const endpoint = renameTarget.url
                  ? `file/${renameTarget.id}`
                  : `directory/${renameTarget.id}`;
                await fetch(`/api/projects/${projectId}/${endpoint}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name: newName }),
                });
                setShowRename(false);
                setRenameTarget(null);
                // refresh root
                fetch(`/api/projects/${projectId}/directory`)
                  .then((r) => r.json())
                  .then((rootDirs) => {
                    fetch(`/api/projects/${projectId}/file`)
                      .then((r) => r.json())
                      .then((rootFiles) => {
                        const dirs: ApiDir[] = Array.isArray(rootDirs)
                          ? (rootDirs as ApiDir[])
                          : [];
                        const filesApi: ApiFile[] = Array.isArray(rootFiles)
                          ? (rootFiles as ApiFile[])
                          : [];
                        const dirItems: ExplorerItem[] = dirs.map((d) => ({
                          id: d.id,
                          name: d.name,
                          type: "folder",
                          note: d.note ?? null,
                        }));
                        const fileItems: ExplorerItem[] = filesApi.map((f) => ({
                          id: f.id,
                          name: f.name,
                          type: f.url?.match(/\.(jpg|jpeg|png|gif)$/i)
                            ? "photo"
                            : "file",
                          url: f.url,
                          note: f.note ?? null,
                          uploadedAt: f.createdAt ?? undefined,
                          size: f.size ?? null,
                          mimeType: f.mimeType ?? null,
                        }));
                        setColumns([[...dirItems, ...fileItems]]);
                      });
                  });
              }}
            >
              <label htmlFor="newName" className="block mb-2 font-semibold">
                New name
              </label>
              <input
                id="newName"
                name="newName"
                type="text"
                defaultValue={renameTarget?.name}
                className="bg-white/5 border border-white/10 text-gray-100 p-2 rounded w-full mb-4 placeholder-gray-400"
                required
              />
              <button
                type="submit"
                className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Notes Side Panel (Drawer) */}
      {showNote && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowNote(false)}
          />
          <aside
            className="absolute right-0 top-0 h-full w-[380px] sm:w-[420px] bg-gradient-to-tl from-slate-900 to-slate-950 text-gray-100 shadow-2xl border-l border-white/10 flex flex-col animate-[slideIn_.25s_ease-out]"
            role="complementary"
            aria-label="Notes panel"
          >
            <div className="px-5 py-4 border-b border-white/10 flex items-start justify-between bg-white/5">
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-400">
                  {noteTarget?.url ? "File" : "Folder"}
                </div>
                <div className="flex items-center gap-2">
                  {noteTarget?.note && (
                    <span
                      className={`${
                        noteTarget?.url ? "bg-red-500" : "bg-orange-500"
                      } inline-block w-2 h-2 rounded-full`}
                      aria-hidden
                    />
                  )}
                  <h2 className="text-lg font-bold truncate max-w-[260px]">
                    {noteTarget?.name || "note(tasks)"}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setShowNote(false)}
                className="text-gray-300 hover:text-gray-100 text-xl leading-none"
                aria-label="Close notes panel"
              >
                &times;
              </button>
            </div>
            <div className="p-5 flex-1 overflow-auto">
              <div className="mb-4 grid grid-cols-2 gap-2 text-xs text-gray-300">
                <div>
                  <span className="font-semibold">Type:</span>{" "}
                  {noteTarget?.mimeType || noteTarget?.type}
                </div>
                <div>
                  <span className="font-semibold">Size:</span>{" "}
                  {typeof noteTarget?.size === "number"
                    ? `${noteTarget?.size} B`
                    : "-"}
                </div>
                <div className="col-span-2">
                  <span className="font-semibold">Uploaded:</span>{" "}
                  {noteTarget?.uploadedAt
                    ? new Date(noteTarget.uploadedAt).toLocaleString()
                    : "-"}
                </div>
              </div>
              <label htmlFor="note-text" className="block mb-2 font-semibold">
                note(tasks)
              </label>
              <textarea
                id="note-text"
                className="w-full bg-white/5 border border-white/10 text-gray-100 p-3 rounded h-48 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                aria-label="note(tasks) text"
              />
            </div>
            <div className="p-5 border-t flex items-center justify-between">
              {noteTarget && (
                <button
                  className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-500"
                  onClick={async () => {
                    const endpoint = noteTarget.url
                      ? `file/${noteTarget.id}`
                      : `directory/${noteTarget.id}`;
                    await fetch(`/api/projects/${projectId}/${endpoint}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ note: null }),
                    });
                    setShowNote(false);
                    setNoteTarget(null);
                    setNoteDraft("");
                  }}
                >
                  Delete
                </button>
              )}
              <div className="flex gap-2 ml-auto">
                <button
                  className="px-3 py-2 bg-white/10 border border-white/20 text-gray-100 rounded hover:bg-white/15"
                  onClick={() => setShowNote(false)}
                >
                  Close
                </button>
                <button
                  className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded shadow"
                  onClick={async () => {
                    if (!noteTarget) return;
                    const endpoint = noteTarget.url
                      ? `file/${noteTarget.id}`
                      : `directory/${noteTarget.id}`;
                    await fetch(`/api/projects/${projectId}/${endpoint}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ note: noteDraft }),
                    });
                    setShowNote(false);
                    setNoteTarget(null);
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
          <div className="backdrop-blur-xl bg-gradient-to-tl from-slate-900 to-slate-950 text-gray-100 border border-white/10 p-8 rounded-2xl shadow-2xl relative">
            <button
              onClick={() => setShowDelete(false)}
              className="absolute top-2 right-2 text-gray-300 hover:text-gray-100"
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deleteTarget?.name}</span>?
            </p>
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDelete(false)}
                className="bg-white/10 border border-white/20 text-gray-100 px-4 py-2 rounded hover:bg-white/15"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* New Folder Modal */}
      {showNewFolder && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
          <div className="backdrop-blur-xl bg-gradient-to-tl from-slate-900 to-slate-950 text-gray-100 border border-white/10 p-8 rounded-2xl shadow-2xl relative">
            <button
              onClick={() => setShowNewFolder(false)}
              className="absolute top-2 right-2 text-gray-300 hover:text-gray-100"
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-4">Create New Folder</h2>
            <form
              onSubmit={(e: FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const nameInput = form.elements.namedItem(
                  "folderName"
                ) as HTMLInputElement;
                const name = nameInput.value;
                handleCreateFolder(name, selected[selected.length - 1]?.id);
              }}
            >
              <label htmlFor="folderName" className="block mb-2 font-semibold">
                Folder Name
              </label>
              <input
                id="folderName"
                name="folderName"
                type="text"
                className="bg-white/5 border border-white/10 text-gray-100 p-2 rounded w-full mb-4"
                required
              />
              <button
                type="submit"
                className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded"
              >
                Create
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
function isFolder(item: ExplorerItem) {
  return item.type === "folder";
}
