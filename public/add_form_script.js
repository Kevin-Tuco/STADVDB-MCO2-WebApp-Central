//form_script.js

/* ---- ADD FORM ---- */
// Select the input fields
const pxidInput = document.getElementById('add_pxid');
const clinicidInput = document.getElementById('add_clinicid');
const doctoridInput = document.getElementById('add_doctorid');
const submitButton = document.querySelector('.submit-add');

// Add event listeners to pxid and clinicid inputs
// pxidInput.addEventListener('input', checkPxid);
// clinicidInput.addEventListener('input', checkClinicid);
// doctoridInput.addEventListener('input', checkDoctorid);
// Function to check if pxid exists
// function checkPxid() {
//     console.log("In CheckPxid");
//     const pxidValue = pxidInput.value.toUpperCase();

//     // Clear the error message if the input is empty
//     if (!pxidValue) {
//         const errorDiv = document.querySelector('.add_pxid-error');
//         errorDiv.textContent = '';
//         return;
//     }
//     // Call an API endpoint to check if pxid exists in the database
//     fetch(`/checkPxid?pxid=${pxidValue}`)
//         .then(response => response.json())
//         .then(data => {
//             if (!data.exists) {
//                 disableSubmitButton();
//                 const errorDiv = document.querySelector('.add_pxid-error');
//                 errorDiv.textContent = 'pxid not found';
//             } else {
//                 enableSubmitButton();
//                 const errorDiv = document.querySelector('.add_pxid-error');
//                 errorDiv.textContent = '';
//             }
//         })
//         .catch(error => {
//             console.error('Error checking pxid:', error);
//         });
// }

// // Function to check if clinicid exists
// function checkClinicid() {
//     console.log("In CheckClinicId");
//     const clinicidValue = clinicidInput.value.toUpperCase();
//     // Clear the error message if the input is empty
//     if (!clinicidValue) {
//         const errorDiv = document.querySelector('.add_clinicid-error');
//         errorDiv.textContent = '';
//         return;
//     }

//     // Call an API endpoint to check if clinicid exists in the database
//     fetch(`/checkClinicid?clinicid=${clinicidValue}`)
//         .then(response => response.json())
//         .then(data => {
//             if (!data.exists) {
//                 disableSubmitButton();
//                 const errorDiv = document.querySelector('.add_clinicid-error');
//                 errorDiv.textContent = 'clinicid not found';
//             } else {
//                 enableSubmitButton();
//                 const errorDiv = document.querySelector('.add_clinicid-error');
//                 errorDiv.textContent = '';
//             }
//         })
//         .catch(error => {
//             console.error('Error checking clinicid:', error);
//         });
// }

// // Function to check if doctorid exists
// function checkDoctorid() {
//     const doctoridValue = doctoridInput.value.toUpperCase();
//     // Clear the error message if the input is empty
//     if (!doctoridValue) {
//         const errorDiv = document.querySelector('.add_doctorid-error');
//         errorDiv.textContent = '';
//         return;
//     }

//     // Call an API endpoint to check if pxid exists in the database
//     fetch(`/checkDoctorid?doctorid=${doctoridValue}`)
//         .then(response => response.json())
//         .then(data => {
//             if (!data.exists) {
//                 disableSubmitButton();
//                 const errorDiv = document.querySelector('.add_doctorid-error');
//                 errorDiv.textContent = 'doctorid not found';
//             } else {
//                 enableSubmitButton();
//                 const errorDiv = document.querySelector('.add_doctorid-error');
//                 errorDiv.textContent = '';
//             }
//         })
//         .catch(error => {
//             console.error('Error checking doctorid:', error);
//         });
// }

// Function to disable the submit button
function disableSubmitButton() {
    submitButton.disabled = true;
}

// Function to enable the submit button
function enableSubmitButton() {
    submitButton.disabled = false;
}

// Handle form submission
const form = document.getElementById('add-appointment-form');
const submitMessage = document.querySelector('.add-submit-message');

form.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    const formData = new FormData(form);
    const appointmentData = Object.fromEntries(formData.entries());

    // Make a POST request to send the form data to the server
    fetch('/addAppointment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Handle successful form submission
        console.log('Form submission successful:', data);
        form.reset(); // Clear the form
        submitMessage.textContent = 'Appointment added successfully!';
    })
    .catch(error => {
        // Handle errors
        console.error('Error submitting form:', error);
        submitMessage.textContent = 'Error adding appointment. Please try again.';
    });
});
