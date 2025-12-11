import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [students, setStudents] = useState([])
  const [form, setForm] = useState({ name: '', age: '', major: '', email: '' })
  const [editingId, setEditingId] = useState(null)

  const API_URL = "http://127.0.0.1:8000/students/"

  // Fetch Students
  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    const response = await axios.get(API_URL)
    setStudents(response.data)
  }

  // Handle Input Change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Submit Form (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editingId) {
      await axios.put(`${API_URL}${editingId}`, form)
    } else {
      await axios.post(API_URL, form)
    }
    setForm({ name: '', age: '', major: '', email: '' })
    setEditingId(null)
    fetchStudents()
  }

  // Handle Edit Click
  const handleEdit = (student) => {
    setForm(student)
    setEditingId(student.id)
  }

  // Handle Delete
  const handleDelete = async (id) => {
    await axios.delete(`${API_URL}${id}`)
    fetchStudents()
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Student Management System</h1>

      {/* Form Section */}
      <div style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ddd" }}>
        <h3>{editingId ? "Edit Student" : "Add New Student"}</h3>
        <form onSubmit={handleSubmit}>
          <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required style={{ margin: "5px" }} />
          <input name="age" type="number" placeholder="Age" value={form.age} onChange={handleChange} required style={{ margin: "5px" }} />
          <input name="major" placeholder="Major" value={form.major} onChange={handleChange} required style={{ margin: "5px" }} />
          <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required style={{ margin: "5px" }} />
          <button type="submit">{editingId ? "Update" : "Add"}</button>
          {editingId && <button onClick={() => { setEditingId(null); setForm({ name: '', age: '', major: '', email: '' }) }}>Cancel</button>}
        </form>
      </div>

      {/* List Section */}
      <h3>Student List</h3>
      <ul>
        {students.map((student) => (
          <li key={student.id} style={{ borderBottom: "1px solid #ccc", padding: "10px", display: "flex", justifyContent: "space-between" }}>
            <span>
              <strong>{student.name}</strong> (Age: {student.age}) - {student.major} [{student.email}]
            </span>
            <div>
              <button onClick={() => handleEdit(student)} style={{ marginRight: "10px" }}>Edit</button>
              <button onClick={() => handleDelete(student.id)} style={{ backgroundColor: "red", color: "white" }}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App