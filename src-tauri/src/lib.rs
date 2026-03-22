use serde::Serialize;
use std::path::PathBuf;
use trash::delete;
use walkdir::WalkDir;

#[tauri::command]
async fn scan_folder(path: String) -> Result<Vec<FileInfo>, String> {
    // We use spawn_blocking because WalkDir is synchronous (blocking)
    // and performs heavy I/O.
    let handle = tokio::task::spawn_blocking(move || {
        let mut files = Vec::new();

        for entry in WalkDir::new(path).into_iter().filter_map(|e| e.ok()) {
            if let Ok(metadata) = entry.metadata() {
                if metadata.is_file() {
                    let size = metadata.len();
                    let modified = metadata
                        .modified()
                        .map(|time| {
                            let datetime: chrono::DateTime<chrono::Utc> = time.into();
                            datetime.format("%Y-%m-%d %H:%M:%S").to_string()
                        })
                        .unwrap_or_else(|_| "Unknown".to_string());

                    files.push(FileInfo {
                        path: entry.path().display().to_string(),
                        size,
                        modified,
                    });
                }
            }
        }
        files
    });

    // Await the background task and handle potential join errors
    handle.await.map_err(|e| e.to_string())
}

#[tauri::command]
fn move_to_trash(path: String) -> Result<(), String> {
    let pathbuf = PathBuf::from(path);
    delete(pathbuf).map_err(|e| e.to_string())
}
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![move_to_trash, scan_folder])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[derive(Serialize)]
pub struct FileInfo {
    pub path: String,
    pub size: u64,
    pub modified: String,
}
