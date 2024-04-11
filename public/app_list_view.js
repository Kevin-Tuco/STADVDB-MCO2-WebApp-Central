// table_script.js

const filterDropdown = document.getElementById('filter');
const filterValuesDropdown = document.getElementById('filter-values');
const filterValuesSelect = document.getElementById('filter-value');

filterDropdown.addEventListener('change', (event) => {
    const selectedFilter = event.target.value;
    if (selectedFilter === '') {
        filterValuesDropdown.style.display = 'none';
    } else {
        filterValuesDropdown.style.display = 'block';
        // Clear previous options
        while (filterValuesSelect.firstChild) {
            filterValuesSelect.removeChild(filterValuesSelect.firstChild);
        }
        // Fetch distinct values for the selected filter
        fetch(`/getDistinctValues?filter=${selectedFilter}`)
            .then(response => response.json())
            .then(data => {
                data.forEach(value => {
                    const option = document.createElement('option');
                    option.textContent = value;
                    filterValuesSelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error loading filter values:', error));
    }
});

filterValuesSelect.addEventListener('change', (event) => {
    const selectedValue = event.target.value;
    const selectedFilter = filterDropdown.value;
    // Fetch appointments based on the selected filter and value
    fetch(`/filterAppointments?filter=${selectedFilter}&value=${selectedValue}`)
        .then(response => response.json())
        .then(data => {
            // Clear previous table rows
            const tbody = document.querySelector('#appointments-list tbody');
            tbody.innerHTML = '';
            // Add new rows
            data.forEach(appointment => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${appointment.pxid}</td>
                    <td>${appointment.clinicid}</td>
                    <td>${appointment.doctorid}</td>
                    <td>${appointment.apptid}</td>
                    <td>${appointment.status}</td>
                    <td>${appointment.QueueDate}</td>
                    <td>${appointment.StartTime}</td>
                    <td>${appointment.EndTime}</td>
                    <td>${appointment.app_type}</td>
                    <td>${appointment.is_Virtual}</td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching filtered appointments:', error));
});
