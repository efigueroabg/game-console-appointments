
document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('formulario');
    const listaCitas = document.getElementById('listaCitas');
    const modoAdminCheckbox = document.getElementById('modoAdmin');
    const claveAdminContainer = document.getElementById('claveAdminContainer');
    let modoAdminActivo = false;

    modoAdminCheckbox.addEventListener('change', () => {
        claveAdminContainer.style.display = modoAdminCheckbox.checked ? 'block' : 'none';
    });

    window.validarClave = () => {
        const clave = document.getElementById('claveAdmin').value;
        if (clave === 'kikeadmin') {
            modoAdminActivo = true;
            cargarCitas();
        } else {
            alert('Clave incorrecta');
        }
    };

    formulario.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombre = document.getElementById('nombre').value;
        const fecha = document.getElementById('fecha').value;
        const hora = document.getElementById('hora').value;

        const res = await fetch('/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: nombre, date: fecha, time: hora })
        });

        const data = await res.json();
        if (data.error) {
            alert(data.error);
        } else {
            cargarCitas();
        }
    });

    async function cargarCitas() {
        const res = await fetch('/appointments');
        const citas = await res.json();
        listaCitas.innerHTML = '';
        citas.forEach(cita => {
            const li = document.createElement('li');
            li.textContent = `${cita.name} - ${cita.date} - ${cita.time}`;
            if (modoAdminActivo) {
                const btn = document.createElement('button');
                btn.textContent = 'Eliminar';
                btn.onclick = async () => {
                    await fetch(`/appointments/${cita.id}`, { method: 'DELETE' });
                    cargarCitas();
                };
                li.appendChild(btn);
            }
            listaCitas.appendChild(li);
        });
    }

    cargarCitas();
});
