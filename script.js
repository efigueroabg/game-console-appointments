
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('appointmentForm');
    const nameInput = document.getElementById('name');
    const dateInput = document.getElementById('date');
    const timeSelect = document.getElementById('time');
    const appointmentsList = document.getElementById('appointmentsList');

    // Populate time options (15-minute intervals from 14:00 to 17:00)
    for (let h = 14; h <= 17; h++) {
        for (let m = 0; m < 60; m += 15) {
            if (h === 17 && m > 0) break;
            const hour = h.toString().padStart(2, '0');
            const minute = m.toString().padStart(2, '0');
            const option = document.createElement('option');
            option.value = `${hour}:${minute}`;
            option.textContent = `${hour}:${minute}`;
            timeSelect.appendChild(option);
        }
    }

    function loadAppointments() {
        fetch('/appointments')
            .then(res => res.json())
            .then(data => {
                appointmentsList.innerHTML = '';
                data.forEach(app => {
                    const li = document.createElement('li');
                    li.textContent = `${app.name} - ${app.date} a las ${app.time}`;
                    const cancelBtn = document.createElement('button');
                    cancelBtn.textContent = 'Cancelar';
                    cancelBtn.className = 'cancel';
                    cancelBtn.onclick = () => {
                        if (confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
                            fetch('/appointments', {
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(app)
                            })
                            .then(res => res.json())
                            .then(() => loadAppointments());
                        }
                    };
                    li.appendChild(cancelBtn);
                    appointmentsList.appendChild(li);
                });
            });
    }

    form.onsubmit = (e) => {
        e.preventDefault();
        const name = nameInput.value;
        const date = dateInput.value;
        const time = timeSelect.value;

        fetch('/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, date, time })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                form.reset();
                loadAppointments();
            }
        });
    };

    loadAppointments();
});
