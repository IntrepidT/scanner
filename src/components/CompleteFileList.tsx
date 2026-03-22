import React, { useState, useMemo } from 'react';
import type { FileInfo } from "../types";
import { formatSize } from "../utils";

export default function CompleteFileList({ files }: { files: FileInfo[] }) {
  const [expanded, setExpanded] = useState(false);
  const [currentPath, setCurrentPath] = useState<string>("");

  // 1. Get the 'Root' path from the first file in the scan
  const rootPath = useMemo(() => {
    if (files.length === 0) return "";
    // Find the shortest path to determine the base directory
    return files.reduce((prev, curr) => prev.path.length < curr.path.length ? prev : curr).path;
  }, [files]);

  // Initialize view to root when files change
  React.useEffect(() => {
    if (!currentPath && rootPath) {
      const parentDir = rootPath.substring(0, rootPath.lastIndexOf('/'));
      setCurrentPath(parentDir || "/");
    }
  }, [rootPath]);

  // 2. Filter logic: Only show files/folders that live DIRECTLY inside currentPath
  const visibleItems = useMemo(() => {
    const items = new Map<string, { isDir: boolean; size: number; path: string }>();

    files.forEach(file => {
      if (file.path.startsWith(currentPath) && file.path !== currentPath) {
        const relative = file.path.replace(currentPath, "").replace(/^\//, "");
        const parts = relative.split('/');
        const name = parts[0];
        const fullPath = `${currentPath}/${name}`.replace(/\/+/g, '/');

        if (parts.length > 1) {
          // It's a directory
          const existing = items.get(name) || { isDir: true, size: 0, path: fullPath };
          existing.size += file.size;
          items.set(name, existing);
        } else {
          // It's a file
          items.set(name, { isDir: false, size: file.size, path: fullPath });
        }
      }
    });

    return Array.from(items.entries()).sort((a, b) => b[1].size - a[1].size);
  }, [files, currentPath]);

  if (files.length === 0) return null;

  return (
    <section className="bg-zinc-800 p-4 rounded-xl shadow flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <header className="text-lg font-bold flex gap-2 items-center">
          <span>Explore Files</span>
          <span className="text-xs bg-zinc-700 px-2 py-1 rounded text-zinc-400 font-mono">
            {currentPath || "/"}
          </span>
        </header>
        <button 
          onClick={() => setExpanded(!expanded)}
          className="bg-zinc-600 px-4 py-1 rounded hover:bg-zinc-500 transition-colors"
        >
          {expanded ? 'Close' : 'Inspect'}
        </button>
      </div>

      {expanded && (
        <div className="w-full flex flex-col gap-2">
          {/* Navigation Controls */}
          <button 
            disabled={currentPath === "/" || currentPath === ""}
            onClick={() => setCurrentPath(currentPath.substring(0, currentPath.lastIndexOf('/')))}
            className="text-left text-blue-400 text-sm hover:underline disabled:text-zinc-600"
          >
            ← Up one level
          </button>

          <ul className="divide-y divide-zinc-700 border border-zinc-700 rounded-lg overflow-hidden">
            {visibleItems.map(([name, info]) => (
              <li 
                key={info.path} 
                onClick={() => info.isDir && setCurrentPath(info.path)}
                className={`p-2 flex justify-between gap-4 text-sm font-mono hover:bg-zinc-700/50 cursor-pointer ${info.isDir ? 'text-yellow-400' : 'text-zinc-300'}`}
              >
                <span className="truncate flex-1">
                  {info.isDir ? `📁 ${name}/` : `📄 ${name}`}
                </span>
                <span className="text-zinc-500 tabular-nums">{formatSize(info.size)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
