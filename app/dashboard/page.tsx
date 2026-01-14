'use client';
import { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Low');
  const [status, setStatus] = useState('Open');
  const [assignedTo, setAssignedTo] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [similarIssue, setSimilarIssue] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchIssues();
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchIssues = async () => {
    const q = query(collection(db, 'issues'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const issuesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setIssues(issuesData);
  };

  const checkSimilarIssues = () => {
    const similar = issues.find(issue => 
      issue.title.toLowerCase().includes(title.toLowerCase()) ||
      title.toLowerCase().includes(issue.title.toLowerCase())
    );
    setSimilarIssue(similar);
    return similar;
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    const similar = checkSimilarIssues();
    if (similar && !window.confirm(`Similar issue found: "${similar.title}". Create anyway?`)) {
      return;
    }
    
    await addDoc(collection(db, 'issues'), {
      title,
      description,
      priority,
      status,
      assignedTo,
      createdAt: Timestamp.now(),
      createdBy: user.email
    });
    
    setTitle('');
    setDescription('');
    setPriority('Low');
    setStatus('Open');
    setAssignedTo('');
    setShowForm(false);
    setSimilarIssue(null);
    fetchIssues();
  };

  const handleStatusChange = async (issue: any, newStatus: string) => {
    if (issue.status === 'Open' && newStatus === 'Done') {
      alert('Cannot move directly from Open to Done. Please set to In Progress first.');
      return;
    }
    // In a real app, update Firestore here
    alert('Status update would happen here');
  };

  const filteredIssues = issues.filter(issue => {
    if (filterStatus !== 'All' && issue.status !== filterStatus) return false;
    if (filterPriority !== 'All' && issue.priority !== filterPriority) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Issue Board</h1>
            <p className="text-gray-600">Logged in as: {user?.email}</p>
          </div>
          <button onClick={() => signOut(auth)} className="bg-red-500 text-white px-4 py-2 rounded">
            Logout
          </button>
        </div>

        <button onClick={() => setShowForm(!showForm)} className="bg-blue-500 text-white px-4 py-2 rounded mb-4">
          {showForm ? 'Cancel' : 'Create New Issue'}
        </button>

        {showForm && (
          <form onSubmit={handleCreateIssue} className="bg-white p-6 rounded-lg shadow-md mb-6">
            <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} 
              className="w-full p-2 mb-4 border rounded" required />
            <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} 
              className="w-full p-2 mb-4 border rounded" required />
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full p-2 mb-4 border rounded">
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full p-2 mb-4 border rounded">
              <option>Open</option>
              <option>In Progress</option>
              <option>Done</option>
            </select>
            <input type="text" placeholder="Assigned To (email/name)" value={assignedTo} 
              onChange={(e) => setAssignedTo(e.target.value)} className="w-full p-2 mb-4 border rounded" />
            {similarIssue && (
              <p className="text-orange-500 mb-4">⚠️ Similar issue exists: {similarIssue.title}</p>
            )}
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Create Issue</button>
          </form>
        )}

        <div className="flex gap-4 mb-6">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="p-2 border rounded">
            <option>All</option>
            <option>Open</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="p-2 border rounded">
            <option>All</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>

        <div className="grid gap-4">
          {filteredIssues.map(issue => (
            <div key={issue.id} className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-xl font-bold">{issue.title}</h3>
              <p className="text-gray-600">{issue.description}</p>
              <div className="flex gap-4 mt-2 text-sm">
                <span className="font-semibold">Priority: {issue.priority}</span>
                <span className="font-semibold">Status: {issue.status}</span>
                <span>Assigned: {issue.assignedTo || 'Unassigned'}</span>
                <span>By: {issue.createdBy}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}