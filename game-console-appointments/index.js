
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const db = new sqlite3.Database('./database/citas.db');

app.use(cors());
app.use(bodyParser.json());

db.serialize(() => {
db.run(\`
CREATE TABLE IF NOT EXISTS citas (
id INTEGER PRIMARY KEY AUTOINCREMENT,
nombre TEXT NOT NULL,
fecha TEXT NOT NULL,
hora TEXT NOT NULL
)
\`);
});

app.get('/citas', (req, res) => {
db.all("SELECT * FROM citas", [], (err, rows) => {
if (err) {
res.status(500).send(err.message);
} else {
res.json(rows);
}
});
});

app.post('/citas', (req, res) => {
const { nombre, fecha, hora } = req.body;
db.get("SELECT * FROM citas WHERE nombre = ? AND fecha = ?", [nombre, fecha], (err, row) => {
if (row) {
res.status(400).send("Ya tienes una cita ese día.");
} else {
db.run("INSERT INTO citas (nombre, fecha, hora) VALUES (?, ?, ?)", [nombre, fecha, hora], function(err) {
if (err) {
res.status(500).send(err.message);
} else {
res.status(201).send("Cita agendada con éxito.");
}
});
}
});
});

app.delete('/appointments/:id', (req, res) => {
const id = req.params.id;
db.run("DELETE FROM citas WHERE id = ?", [id], function(err) {
if (err) {
res.status(500).send(err.message);
} else {
res.status(200).send("Cita eliminada.");
}
});
});

app.listen(3000, () => {
console.log('Servidor corriendo en http://localhost:3000');
});
