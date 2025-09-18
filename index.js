const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Base de datos SQLite
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(path.join(__dirname, 'appointments.db'));

db.run(`
  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL
  )
`);

app.use(express.static(__dirname));
app.use(express.json());

// Ruta principal: sirve el HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index_modified.html'));
});

// Obtener citas
app.get('/appointments', (req, res) => {
  db.all('SELECT name, date, time FROM appointments', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al leer citas' });
    res.json(rows);
  });
});

// Agendar cita
app.post('/appointments', (req, res) => {
  const { name, date, time } = req.body;
  const hour = parseInt(time.split(':')[0]);
  const minute = parseInt(time.split(':')[1]);

  if (hour < 14 || hour > 17 || (hour === 17 && minute > 0)) {
    return res.status(400).json({ error: 'Las citas solo se permiten entre las 2:00 pm y las 5:00 pm.' });
  }

  db.get('SELECT * FROM appointments WHERE name = ? AND date = ?', [name, date], (err, existing) => {
    if (existing) {
      return res.status(400).json({ error: 'Ya existe una cita para este usuario en esa fecha.' });
    }

    db.all('SELECT * FROM appointments WHERE date = ? AND time = ?', [date, time], (err, sameSlot) => {
      if (sameSlot.length >= 2) {
        return res.status(400).json({ error: 'Ya hay 2 personas agendadas en este horario.' });
      }

      db.run('INSERT INTO appointments (name, date, time) VALUES (?, ?, ?)', [name, date, time], (err) => {
        if (err) return res.status(500).json({ error: 'Error al guardar la cita' });
        res.json({ success: true });
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
