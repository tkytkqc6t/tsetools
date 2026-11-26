import React, {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import './style.css';

const API = '/api/v1';

function LargeFileApp() {
  const [file, setFile] = useState(null), [upload, setUpload] = useState(null);
  const [preview, setPreview] = useState(''), [status, setStatus] = useState('Choose a JSON or XML file');
  const [operation, setOperation] = useState('json_to_csv'), [fields, setFields] = useState('');
  const [parent, setParent] = useState(''), [job, setJob] = useState(null);

  async function uploadFile(selected) {
    if (!selected || !/\.(json|xml)$/i.test(selected.name)) return setStatus('Only JSON and XML files are supported.');
    if (selected.size > 1024 ** 3) return setStatus('The maximum file size is 1 GB.');
    setFile(selected); setPreview(''); setJob(null); setStatus('Starting upload…');
    const init = await fetch(`${API}/uploads/init`, {method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({filename:selected.name, size:selected.size})}).then(r => r.json());
    const id = init.upload_id;
    for (let i=0; i<init.total_chunks; i++) {
      const start = i * init.chunk_size;
      await fetch(`${API}/uploads/${id}/chunks/${i}`, {method:'PUT', body:selected.slice(start, start + init.chunk_size)});
      setStatus(`Uploading ${Math.min(100, ((start + init.chunk_size) / selected.size) * 100).toFixed(1)}%`);
    }
    const completed = await fetch(`${API}/uploads/${id}/complete`, {method:'POST'}).then(r => r.json());
    setUpload(completed); setStatus(`Uploaded ${completed.filename}; the file remains on disk.`);
    const first = await fetch(`${API}/files/${id}/preview`).then(r => r.json());
    setPreview(first.text);
  }

  async function runJob() {
    if (!upload) return;
    setStatus('Processing on the server…');
    const created = await fetch(`${API}/jobs`, {method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({file_id:upload.file_id, operation, params:{fields, parent}})}).then(r=>r.json());
    setJob(created);
  }

  useEffect(() => { if (!job || job.status === 'completed' || job.status === 'failed') return;
    const timer = setInterval(async () => setJob(await fetch(`${API}/jobs/${job.id}`).then(r=>r.json())), 1000);
    return () => clearInterval(timer);
  }, [job]);
  useEffect(() => { if (job?.status === 'completed') setStatus(`Completed: ${job.rows.toLocaleString()} rows`); }, [job]);

  return <main><h1>TSETools large-file workspace</h1>
    <p className="hint">Files are streamed to disk and never copied into a browser textarea.</p>
    <label className="drop">{file ? file.name : 'Drop a JSON/XML file here'}<input type="file" accept=".json,.xml" onChange={e=>uploadFile(e.target.files[0])}/></label>
    <progress value={upload ? 1 : 0} max="1" /> <p>{status}</p>
    {upload && <><h2>Bounded preview (first 256 KiB)</h2><pre>{preview}</pre>
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
