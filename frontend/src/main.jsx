import React, {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import './style.css';

const API = '/api/v1';

function LargeFileApp() {
  const [file, setFile] = useState(null), [upload, setUpload] = useState(null);
  const [preview, setPreview] = useState(''), [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Choose a JSON or XML file');
  const [operation, setOperation] = useState('json_to_csv'), [fields, setFields] = useState('');
  const [parent, setParent] = useState(''), [job, setJob] = useState(null);

  async function uploadFile(selected) {
    if (!selected || !/\.(json|xml)$/i.test(selected.name)) throw new Error('Only JSON and XML files are supported.');
    if (selected.size > 1024 ** 3) throw new Error('The maximum file size is 1 GB.');
    setFile(selected); setPreview(''); setUpload(null); setJob(null); setProgress(0); setStatus('Starting upload…');
    const initResponse = await fetch(`${API}/uploads/init`, {method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({filename:selected.name, size:selected.size})});
    if (!initResponse.ok) throw new Error('Could not start the upload.');
    const init = await initResponse.json();
    const id = init.upload_id;
    for (let i = 0; i < init.total_chunks; i++) {
      const start = i * init.chunk_size;
      const chunk = selected.slice(start, Math.min(start + init.chunk_size, selected.size));
      await new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('PUT', `${API}/uploads/${id}/chunks/${i}`);
        request.upload.onprogress = event => {
          if (event.lengthComputable) {
            const value = Math.min(100, ((start + event.loaded) / selected.size) * 100);
            setProgress(value); setStatus(`Uploading ${value.toFixed(1)}%`);
          }
        };
        request.onload = () => request.status >= 200 && request.status < 300
          ? resolve() : reject(new Error(`Upload failed on chunk ${i + 1}.`));
        request.onerror = () => reject(new Error('Network error while uploading.'));
        request.send(chunk);
      });
      setProgress(Math.min(100, ((start + chunk.size) / selected.size) * 100));
    }
    const completeResponse = await fetch(`${API}/uploads/${id}/complete`, {method:'POST'});
    if (!completeResponse.ok) throw new Error('Upload completed, but could not finalize the file.');
    const completed = await completeResponse.json();
    setUpload(completed); setStatus(`Uploaded ${completed.filename}; loading preview…`);
    const firstResponse = await fetch(`${API}/files/${id}/preview`);
    if (!firstResponse.ok) throw new Error('The uploaded file could not be previewed.');
    const first = await firstResponse.json();
    setPreview(first.text);
    setOperation(/\.xml$/i.test(selected.name) ? 'xml_to_csv' : 'json_to_csv');
    if (/\.json$/i.test(selected.name)) {
      try {
        const parsed = JSON.parse(first.text);
        const item = Array.isArray(parsed) ? parsed[0] : parsed;
        if (item && typeof item === 'object') setFields(Object.keys(item).join(','));
      } catch (_) { /* A large JSON preview may be incomplete. */ }
    } else {
      const xml = new DOMParser().parseFromString(first.text, 'application/xml');
      const item = xml.documentElement?.firstElementChild || xml.documentElement;
      if (item) setFields(Array.from(item.children).map(child => child.tagName).join(','));
    }
    setStatus(`Uploaded ${completed.filename}; preview loaded.`);
    setProgress(100);
  }

  async function chooseFile(event) {
    try { await uploadFile(event.target.files[0]); }
    catch (error) { setStatus(error.message || 'Upload failed.'); }
  }

  async function runJob() {
    if (!upload) return;
    setStatus('Processing on the server…');
    const created = await fetch(`${API}/jobs`, {method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({file_id:upload.file_id, operation, params:{fields, parent}})}).then(r=>r.json());
    setJob(created);
  }

  useEffect(() => {
    if (!job || job.status === 'completed' || job.status === 'failed') return;
    const timer = setInterval(async () => setJob(await fetch(`${API}/jobs/${job.id}`).then(r=>r.json())), 1000);
    return () => clearInterval(timer);
  }, [job]);
  useEffect(() => { if (job?.status === 'completed') setStatus(`Completed: ${job.rows.toLocaleString()} rows`); }, [job]);

  return <main><h1>TSETools large-file workspace</h1>
    <p className="hint">Files are streamed to disk and never copied into a browser textarea.</p>
    <label className="drop">{file ? file.name : 'Drop a JSON/XML file here'}<input type="file" accept=".json,.xml" onChange={chooseFile}/></label>
    <progress value={progress} max="100" /> <p>{status}</p>
    {upload && <><h2>Input data preview (first 256 KiB)</h2><textarea className="preview-input" value={preview} readOnly />
      <label>Operation <select value={operation} onChange={e=>setOperation(e.target.value)}>
        <option value="json_to_csv">JSON to CSV</option><option value="xml_to_csv">XML to CSV</option>
        <option value="json_extract">JSON extract</option><option value="xml_extract">XML extract</option>
        <option value="json_filter">JSON filter</option><option value="xml_filter">XML filter</option>
      </select></label>
      <label>Fields (comma-separated) <input value={fields} onChange={e=>setFields(e.target.value)} placeholder="id,name,location.city"/></label>
      <label>Filter <input value={parent} onChange={e=>setParent(e.target.value)} placeholder="id = 2"/></label>
      <button onClick={runJob}>Run without loading the file in the browser</button>
    </>}
    {job && <p>Job: {job.status} {job.rows ? `(${job.rows.toLocaleString()} rows)` : ''}
      {job.status === 'completed' && <a href={`${API}/jobs/${job.id}/download`}> Download CSV</a>}</p>}
  </main>;
}
createRoot(document.getElementById('root')).render(<LargeFileApp/>);

