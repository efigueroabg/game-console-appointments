const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const DATA_FILE = path.join(__dirname, 'appointments.json');

app.use(express.static(__dirname));
app.use(express.json());

let appointments = [];
if (fs.existsSync(DATA_FILE)) {
  appointments = JSON.parse(fs.readFileSync(DATA_FILE));
}

function saveAppointments() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(appointments, null, 2));
}

app.get('/', (req, res) => {
  res.send('¡Servidor funcionando!');
});

app.post('/appointments', (req, res) => {
  const { name, date, time } = req.body;

  const hour = parseInt(time.split(':')[0]);
  const minute = parseInt(time.split(':')[1]);

  if (hour < 14 || hour > 17 || (hour === 17 && minute > 0)) {
    return res.status(400).json({ error: 'Las citas solo se permiten entre las 2:00 pm y las 5:00 pm.' });
  }

  const exists = appointments.find(app => app.name === name && app.date === date);
  if (exists) {
    return res.status(400).json({ error: 'Ya existe una cita para este usuario en esa fecha.' });
  }

  const sameSlot = appointments.filter(app => app.date === date && app.time === time);
  if (sameSlot.length >= 2) {
    return res.status(400).json({ error: 'Ya hay 2 personas agendadas en este horario.' });
  }

  appointments.push({ name, date, time });
  saveAppointments();
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
