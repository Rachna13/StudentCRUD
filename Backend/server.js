const express = require('express');
const { google } = require('googleapis');
const bodyParser = require('body-parser');
const cors = require('cors');


const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = 5000;

// Google Sheet info
const SPREADSHEET_ID = '1OL2aCYLOBEwfaVGajI_KS-wpf3LvC-vrxl_yFeiomhs';
const SHEET_NAME = 'students'; 

// Authenticate using service account
const auth = new google.auth.GoogleAuth({
  keyFile: './service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Read students
async function readStudents() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:F`,
  });

  const rows = res.data.values || [];
  if (rows.length < 2) return [];
  const dataRows = rows.slice(1);
  return dataRows.map(row => ({
    ID: Number(row[0]),
    Name: row[1],
    Email: row[2],
    Course: row[3],
    Year: Number(row[4]),
    Marks: Number(row[5]),
  }));
}

// Write students
async function writeStudents(students) {
  try {
    // Clear the sheet first
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_NAME
    });

    // Prepare updated rows
    const values = [
      ['ID', 'Name', 'Email', 'Course', 'Year', 'Marks'], // header
      ...students.map((s) => [s.ID, s.Name, s.Email, s.Course, s.Year, s.Marks]),
    ];

    // Write updated rows
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:F`,
      valueInputOption: 'RAW',
      requestBody: { values },
    });

  } catch (err) {
    console.error('Error writing Google Sheet:', err.message);
    throw err;
  }
}

// GET /students?search=&sort=&order=
app.get('/students', async (req, res) => {
  try {
    let students = await readStudents();

    // Search
    if (req.query.search) {
      const term = req.query.search.toLowerCase();
      students = students.filter(
        s => s.Name.toLowerCase().includes(term) || String(s.ID) === term
      );
    }

    // Sort
    if (req.query.sort) {
      const { sort, order } = req.query;
      students.sort((a, b) => {
        if (a[sort] < b[sort]) return order === 'desc' ? 1 : -1;
        if (a[sort] > b[sort]) return order === 'desc' ? -1 : 1;
        return 0;
      });
    }

    res.json(students);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// POST /students
app.post('/students', async (req, res) => {
  try {
    const students = await readStudents();
    const existingIds = students.map(s => s.ID);
//existingIds= [1,2,3,5] 
let newId= Math.max(...existingIds)+1;
    // Smallest available ID
    //let newId = 1;
    //while (existingIds.includes(newId)) newId++;
//newId=4
    const newStudent = { ID: newId, ...req.body };
    students.push(newStudent);

    await writeStudents(students);
    res.json(newStudent);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add student' });
  }
});

// PUT /students/:id
app.put('/students/:id', async (req, res) => {
  try {
    const students = await readStudents();
    const id = Number(req.params.id);
    const index = students.findIndex(s => s.ID === id);
    if (index === -1) return res.status(404).json({ error: 'Student not found' });

    students[index] = { ...students[index], ...req.body };
    await writeStudents(students);
    res.json(students[index]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// DELETE /students/:id
app.delete('/students/:id', async (req, res) => {
  try {
    const students = await readStudents();
    const id = Number(req.params.id);
    const index = students.findIndex(s => s.ID === id);
    if (index === -1) return res.status(404).json({ error: 'Student not found' });

    students.splice(index, 1); // remove exact student
    await writeStudents(students);
    res.json({ message: 'Deleted successfully ✅' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
