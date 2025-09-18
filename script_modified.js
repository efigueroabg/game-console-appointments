document.getElementById('appointmentForm').onsubmit = function(e) {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const date = document.getElementById('date').value;
  const time = document.getElementById('time').value;

  fetch('/appointments')
    .then(res => res.json())
    .then(data => {
      const sameSlot = data.filter(app => app.date === date && app.time === time);
      if (sameSlot.length >= 2) {
        alert('Ya hay 2 personas agendadas en este horario.');
        return;
      }

      fetch('/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, date, time })
      })
      .then(res => res.json())
      .then(result => {
        if (result.error) {
          alert(result.error);
        } else {
          loadAppointments();
        }
      });
    });
};

function loadAppointments() {
  fetch('/appointments')
    .then(res => res.json())
    .then(data => {
      data.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
      const list = document.getElementById('appointmentsList');
      list.innerHTML = '';
      data.forEach(app => {
        const li = document.createElement('li');
        li.textContent = `${app.name} - ${app.date} ${app.time}`;
        list.appendChild(li);
      });
    });
}

loadAppointments();
