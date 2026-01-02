import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- GLOBAL CONFIGURATION ---
// This uses your Vercel Env Var if present, otherwise local
// const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
//const API_URL = BASE_URL.endsWith('/') ? `${BASE_URL}students/` : `${BASE_URL}/students/`;
const API_URL = "https://student-management-system-5d8i.onrender.com/students/";
function App() {
  const [students, setStudents] = useState([])
  const [form, setForm] = useState({ name: '', age: '', major: '', email: '' })
  const [editingId, setEditingId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => { 
    console.log("Current API Endpoint:", API_URL);
    fetchStudents(); 
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await axios.get(API_URL)
      setStudents(response.data)
    } catch (error) { 
      console.error("API Error:", error);
    }
  }

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("University Student Enrollment Report", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    const tableColumn = ["ID", "Name", "Age", "Major", "Email"];
    const tableRows = students.map(s => [s.id, s.name, s.age, s.major, s.email]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] }
    });

    doc.save(`Student_Report_${new Date().getTime()}.pdf`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await axios.put(`${API_URL}${editingId}`, form)
      } else {
        await axios.post(API_URL, form)
      }
      setForm({ name: '', age: '', major: '', email: '' })
      setEditingId(null)
      fetchStudents()
    } catch (err) { 
      alert("Action failed. Check console for details.");
      console.error(err);
    }
  }

  const filteredStudents = (students || []).filter(s => {
    const name = s.name?.toLowerCase() || "";
    const major = s.major?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return name.includes(query) || major.includes(query);
  });

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="logo">🎓 UniAdmin</div>
        <nav><div className="nav-item active">Students</div></nav>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <div className="title-area">
            <h1>Student Management</h1>
            <p className="subtitle">Manage enrollment and export records</p>
          </div>
          <div className="header-actions">
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Search students..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
            </div>
          </div>
        </header>

        <section className="dashboard-grid">
          <div className="glass-card form-container">
            <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              {editingId ? "📝 Update Student" : "👤 Register Student"}
            </h3>
            <form onSubmit={handleSubmit} className="modern-form">
              <input name="name" placeholder="Full Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
              <div className="row">
                <input name="age" type="number" placeholder="Age" value={form.age} onChange={(e) => setForm({...form, age: e.target.value})} required />
                <input name="major" placeholder="Major" value={form.major} onChange={(e) => setForm({...form, major: e.target.value})} required />
              </div>
              <input name="email" type="email" placeholder="Email Address" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
              <div className="form-actions" style={{ marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  {editingId ? "Save Changes" : "Create Record"}
                </button>
                {editingId && (
                  <button type="button" onClick={() => {setEditingId(null); setForm({name:'',age:'',major:'',email:''})}} className="btn btn-ghost" style={{ width: '100%', marginTop: '0.5rem' }}>
                    Cancel
                  </button>
                )}
                <button type="button" onClick={exportPDF} className="btn btn-export-full" style={{ marginTop: '1rem' }}>
                  <span>📥</span> Download Student Report (PDF)
                </button>
              </div>
            </form>
          </div>

          <div className="list-container">
            <div className="list-header">
              <h3>Active Records ({filteredStudents.length})</h3>
            </div>
            <div className="student-cards">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => (
                  <div key={student.id} className="glass-card student-item">
                    <div className="avatar">{student.name ? student.name[0] : "?"}</div>
                    <div className="details">
                      <h4>{student.name}</h4>
                      <span className="badge">{student.major}</span>
                      <p>{student.email}</p>
                    </div>
                    <div className="item-actions">
                      <button onClick={() => {setEditingId(student.id); setForm(student)}} className="icon-btn edit">✎</button>
                      <button onClick={async () => {
                        if(window.confirm("Delete student?")) {
                          await axios.delete(`${API_URL}${student.id}`);
                          fetchStudents();
                        }
                      }} className="icon-btn delete">🗑</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results glass-card">
                  <div className="no-results-icon">🔍</div>
                  <h4>No students found</h4>
                  {searchQuery && <button onClick={() => setSearchQuery('')} className="btn-link">Clear Search</button>}
                </div>
              )}
            </div>
          </div>
        </section>
      

      <footer className="app-footer">
          <p>© 2026 | Created with ❤️ by <strong>[Rajuri Vignan]</strong></p>
          <p className="footer-tech">React • FastAPI • PostgreSQL</p>
        </footer>
      </main>
    </div>
  )
}

  



export default App;