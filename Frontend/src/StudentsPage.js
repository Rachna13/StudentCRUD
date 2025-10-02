import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form } from 'react-bootstrap';

export default function App() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    Name: '', Email: '', Course: '', Year: '', Marks: ''
  });

  const fetchStudents = async () => {
    const res = await axios.get('http://localhost:5000/students', {
      params: { search, sort: sortField, order: sortOrder }
    });
    setStudents(res.data);
  };

  useEffect(() => {
    fetchStudents();
  }, [search, sortField, sortOrder]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingStudent) {
      await axios.put(`http://localhost:5000/students/${editingStudent.ID}`, formData);
    } else {
      await axios.post('http://localhost:5000/students', formData);
    }
    setShowModal(false);
    setEditingStudent(null);
    setFormData({ Name: '', Email: '', Course: '', Year: '', Marks: '' });
    fetchStudents();
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      Name: student.Name,
      Email: student.Email,
      Course: student.Course,
      Year: student.Year,
      Marks: student.Marks
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/students/${id}`);
    fetchStudents();
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Student Management</h1>

      <div className="d-flex mb-3">
        <input
          type="text"
          placeholder="Search by Name or ID"
          className="form-control me-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-select me-2"
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
        >
          <option value="">Sort By</option>
          <option value="Name">Name</option>
          <option value="Marks">Marks</option>
          <option value="Year">Year</option>
            <option value="Course">Course</option> 
        </select>
        <select
          className="form-select"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
      </div>

      <Button variant="primary" className="mb-3" onClick={() => setShowModal(true)}>
        Add Student
      </Button>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Email</th><th>Course</th><th>Year</th><th>Marks</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.ID}>
              <td>{s.ID}</td><td>{s.Name}</td><td>{s.Email}</td><td>{s.Course}</td><td>{s.Year}</td><td>{s.Marks}</td>
              <td>
                <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(s)}>Edit</Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(s.ID)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingStudent ? 'Edit Student' : 'Add Student'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {['Name','Email','Course','Year','Marks'].map(field => (
              <Form.Group className="mb-2" key={field}>
                <Form.Label>{field}</Form.Label>
                <Form.Control
                  name={field}
                  type={field === 'Year' || field === 'Marks' ? 'number' : 'text'}
                  value={formData[field]}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            ))}
            <Button type="submit" className="mt-2">{editingStudent ? 'Update' : 'Add'}</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
