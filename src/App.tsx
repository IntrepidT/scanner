import { useState } from "react";
import PathSelector from "./components/PathSelector";
import DiskUsageSummary from "./components/DiskUsageSummary";
import CleanupSuggestions from "./components/CleanupSuggestions";
import CompleteFileList from "./components/CompleteFileList";
import type { FileInfo } from "./types";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [path, setPath] = useState('');
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleScan() {
    if (!path) return alert('Please enter a folder or disk path.');

    setLoading(true);
    try {
      const scannedFiles = await invoke<FileInfo[]>('scan_folder', { path });
      setFiles(scannedFiles);
    } catch (err) {
      alert(`Failed to scan folder: ${err}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleTrash(filePath: string) {
    try {
      await invoke('move_to_trash', { path: filePath });
      alert(`Moved to Trash: ${filePath}`);
      await handleScan(); // Refresh the file list after moving to trash
    } catch (err) {
      alert(`Failed to move to Trash: ${err}`);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-100 p-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="text-center">
          <h1 className="text-3xl font-bold">CleanSweep</h1>
          <p className="text-zinc-400 mt-2">Analyze and clean up disk space on your pc.</p>
        </header>

        <PathSelector 
          path={path}
          setPath={setPath}
          loading={loading}
          onScan={handleScan}
        />

        {files.length > 0 && (
          <>
            <DiskUsageSummary files={files} />

            <CompleteFileList files={files} />

            <CleanupSuggestions files={files} onTrash={handleTrash} />
          </>
        )}
      </div>
    </main>
  );
}

export default App;
