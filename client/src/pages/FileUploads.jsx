import { Download, FileUp, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import './FileUploads.css';

const formatSize = (bytes) => bytes < 1024 * 1024
  ? `${Math.max(1, Math.round(bytes / 1024))} KB`
  : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

export default function FileUploads() {
  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState('');
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadPatients = useCallback(async () => {
    setLoadingPatients(true);
    setError('');
    try {
      const response = await api.get('/patients', { params: { limit: 100 } });
      setPatients(response.data.data);
      setPatientId((current) => current || response.data.data[0]?._id || '');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load patients');
    } finally {
      setLoadingPatients(false);
    }
  }, []);

  const loadFiles = useCallback(async () => {
    if (!patientId) {
      setFiles([]);
      return;
    }
    setLoadingFiles(true);
    setError('');
    try {
      const response = await api.get(`/patients/${patientId}/files`);
      setFiles(response.data.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load patient files');
    } finally {
      setLoadingFiles(false);
    }
  }, [patientId]);

  useEffect(() => { loadPatients(); }, [loadPatients]);
  useEffect(() => { loadFiles(); }, [loadFiles]);

  const upload = async (event) => {
    event.preventDefault();
    if (!selectedFile || !patientId) return;
    const form = event.currentTarget;
    setBusy(true);
    setError('');
    setNotice('');
    const payload = new FormData();
    payload.append('file', selectedFile);
    try {
      await api.post(`/patients/${patientId}/files`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSelectedFile(null);
      form.reset();
      setNotice('File uploaded successfully.');
      await loadFiles();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'File upload failed');
    } finally {
      setBusy(false);
    }
  };

  const download = async (file) => {
    setError('');
    try {
      const response = await api.get(`/patients/${patientId}/files/${file._id}/download`, { responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.originalName;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'File download failed');
    }
  };

  return <div className="page">
    <PageHeader eyebrow="Patient records" title="Files" description="Upload and retrieve patient documents securely." action={<button className="secondary" onClick={loadFiles} disabled={!patientId}><RefreshCw size={16} /> Refresh</button>} />
    {error && <div className="alert error" role="alert">{error}</div>}
    {notice && <div className="alert success" role="status">{notice}</div>}
    <div className="panel">
      <div className="panel-title"><h3>Upload a patient file</h3></div>
      {loadingPatients ? <LoadingState message="Loading patients…" /> : patients.length === 0 ? <EmptyState title="No patients available" message="Create a patient record before uploading files." /> : <>
        <form onSubmit={upload} className="file-upload-form">
          <label className="field">
            <span>Patient</span>
            <select value={patientId} onChange={(event) => { setPatientId(event.target.value); setSelectedFile(null); setNotice(''); }} required>
              {patients.map((patient) => <option key={patient._id} value={patient._id}>{patient.name}</option>)}
            </select>
          </label>
          <label className="field">
            <span>File (PDF, JPEG, or PNG; up to 5 MB)</span>
            <input key={patientId} type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={(event) => setSelectedFile(event.target.files?.[0] || null)} required />
          </label>
          <button className="primary" disabled={busy || !selectedFile}><FileUp size={17} />{busy ? 'Uploading…' : 'Upload file'}</button>
        </form>
      </>}
    </div>
    {patientId && <div className="panel file-list-panel">
      <div className="panel-title"><h3>Patient files</h3></div>
      {loadingFiles ? <LoadingState message="Loading files…" /> : files.length === 0 ? <EmptyState title="No files uploaded" message="Upload a PDF or image to attach it to this patient record." /> : <div className="table-wrap"><table>
        <thead><tr><th>File</th><th>Type</th><th>Size</th><th>Uploaded</th><th>By</th><th>Action</th></tr></thead>
        <tbody>{files.map((file) => <tr key={file._id}>
          <td>{file.originalName}</td>
          <td>{file.mimeType}</td>
          <td>{formatSize(file.size)}</td>
          <td>{new Date(file.createdAt).toLocaleString()}</td>
          <td>{file.uploadedBy?.name || '—'}</td>
          <td><button className="icon-btn" onClick={() => download(file)} aria-label={`Download ${file.originalName}`} title="Download file"><Download size={15} /></button></td>
        </tr>)}</tbody>
      </table></div>}
    </div>}
  </div>;
}
