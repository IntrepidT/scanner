import { open } from '@tauri-apps/plugin-dialog';
import { homeDir } from '@tauri-apps/api/path';

type Props = {
  path: string;
  setPath: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  onScan: () => void;
}

export default function PathSelector({ path, setPath, loading, onScan }: Props) {
    const handlePickFolder = async () => {
        const selected = await open({
            directory: true,
            multiple: false,
            defaultPath: await homeDir(),
        });
        
        if (selected) {
            setPath(selected as string);
        }
    };

    return (
        <section className="bg-zinc-800 p-4 rounded-xl shadow flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full flex gap-2">
                <button 
                    onClick={handlePickFolder}
                    className="bg-zinc-600 px-3 py-2 rounded hover:bg-zinc-500"
                >
                    Select
                </button>
                <input
                    type="text"
                    className="flex-1 bg-zinc-700 border border-zinc-600 rounded px-4 py-2 text-zinc-100"
                    value={path}
                    readOnly // User picks via button now
                />
            </div>
            <button
                disabled={loading || !path}
                onClick={onScan}
                className="bg-blue-600 disabled:bg-zinc-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
                {loading ? 'Scanning...' : 'Scan'}
            </button>
        </section>
    );
}
