const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Parse JSON bodies
app.use(bodyParser.json());

// MySQL Connection Configuration
// Central Website - Read
const connection = mysql.createConnection({
    host: 'ccscloud.dlsu.edu.ph',
    port:'20006',
    user: 'username',
    password: 'password',
    database: 'Luzon'
});

// Connect to MySQL
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Set Handlebars as the view engine
app.engine('hbs', exphbs.create({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views')
}).engine);

app.set('view engine', 'hbs');

// Set the path to the views folder
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Define routes
app.get('/', (req, res) => {
    // Query your database to fetch the first 50 appointments
    connection.query('SELECT * FROM DenormalizedAppointments LIMIT 50', (err, results) => {
        if (err) {
            console.error('Error fetching appointments:', err);
            res.status(500).send('Error fetching appointments');
            return;
        }
        
        // Render the main.hbs view with appointments data
        res.render('main', { appointments: results });
    });
});

// Route to get distinct values for a filter
app.get('/getDistinctValues', (req, res) => {
    const filter = req.query.filter;
    //console.log("Filter: " +filter);
    const sql = `SELECT DISTINCT ${filter} FROM DenormalizedAppointments LIMIT 50`;
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching distinct values:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        const values = results.map(result => result[filter]);
        res.json(values);
    });
});

// Route to filter appointments
app.get('/filterAppointments', (req, res) => {
    const filter = req.query.filter;
    const value = req.query.value;
    const sql = `SELECT * FROM DenormalizedAppointments WHERE ${filter} = ? LIMIT 50`;
    connection.query(sql, [value], (err, results) => {
        if (err) {
            console.error('Error fetching filtered appointments:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(results);
    });
});

// // Endpoint to check if pxid exists
// app.get('/checkPxid', (req, res) => {
//     const pxid = req.query.pxid.toUpperCase(); // Convert to uppercase

//     // Query to check if pxid exists
//     const query = `SELECT COUNT(*) AS count FROM DenormalizedAppointments WHERE pxid = ?`;
//     connection.query(query, [pxid], (error, results) => {
//         if (error) {
//             console.error('Error checking pxid:', error);
//             res.status(500).json({ error: 'Internal server error' });
//             return;
//         }

//         // Check if pxid exists
//         const pxidExists = results[0].count > 0;
//         res.json({ exists: pxidExists });
//     });
// });

// // Endpoint to check if clinicid exists
// app.get('/checkClinicid', (req, res) => {
//     const clinicid = req.query.clinicid.toUpperCase(); // Convert to uppercase

//     // Query to check if clinicid exists
//     const query = `SELECT COUNT(*) AS count FROM DenormalizedAppointments WHERE clinicid = ?`;
//     connection.query(query, [clinicid], (error, results) => {
//         if (error) {
//             console.error('Error checking clinicid:', error);
//             res.status(500).json({ error: 'Internal server error' });
//             return;
//         }

//         // Check if clinicid exists
//         const clinicidExists = results[0].count > 0;
//         res.json({ exists: clinicidExists });
//     });
// });
// // Endpoint to check if clinicid exists
// app.get('/checkDoctorid', (req, res) => {
//     const doctorid = req.query.doctorid.toUpperCase(); // Convert to uppercase

//     // Query to check if clinicid exists
//     const query = `SELECT COUNT(*) AS count FROM DenormalizedAppointments WHERE doctorid = ?`;
//     connection.query(query, [doctorid], (error, results) => {
//         if (error) {
//             console.error('Error checking clinicid:', error);
//             res.status(500).json({ error: 'Internal server error' });
//             return;
//         }

//         // Check if clinicid exists
//         const doctoridExists = results[0].count > 0;
//         res.json({ exists: doctoridExists });
//     });
// });

// Endpoint to check if apptid exists
app.get('/checkApptid', (req, res) => {
    //console.log("in /checkApptid");
    const apptid = req.query.apptid.toUpperCase(); // Convert to uppercase

    // Query to check if apptid exists
    const query = `SELECT COUNT(*) AS count FROM DenormalizedAppointments WHERE apptid = ?`;
    connection.query(query, [apptid], (error, results) => {
        if (error) {
            console.error('Error checking apptid:', error);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        // Check if apptid exists
        const apptidExists = results[0].count > 0;
        res.json({ exists: apptidExists });
    });
});

// Endpoint to add appointment data to the database
app.post('/addAppointment', async (req, res) => {
    const { add_pxid, add_clinicid, add_doctorid, add_status, add_QueueDate, add_app_type, add_is_Virtual } = req.body;

    try {
        // Generate apptid
        const apptid = await generateApptId();
        //console.log("Apptid:" + apptid);

        // Insert the appointment data into the database
        const query = 'INSERT INTO DenormalizedAppointments (pxid, clinicid, doctorid, apptid, status, QueueDate, StartTime, EndTime, app_type, is_virtual) VALUES (?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?)';
        const values = [add_pxid, add_clinicid, add_doctorid, apptid, add_status, add_QueueDate, add_app_type, add_is_Virtual];
        //console.log('Values before adding: ' + values);
        connection.query(query, values, (error, results) => {
            if (error) {
                console.error('Error adding appointment:', error);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }

            // Respond with success message or inserted ID
            res.json({ success: true, insertedId: results.insertId });
        });
    } catch (error) {
        console.error('Error generating apptid:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to add appointment data to the database
app.post('/updateAppointment', async (req, res) => {
    const { update_apptid, update_status, update_StartTime, update_EndTime, update_app_type, update_is_Virtual } = req.body;

    try {
        // Check if update_EndTime or update_StartTime are empty, use NULL instead
        const values = [update_status, update_StartTime || null, update_EndTime || null, update_app_type, update_is_Virtual, update_apptid];
        console.log('Values before adding: ' + values);

        // Update the appointment data in the database
        const query = 'UPDATE DenormalizedAppointments SET status = ?, StartTime = ?, EndTime = ?, app_type = ?, is_Virtual = ? WHERE apptid = ?';
        connection.query(query, values, (error, results) => {
            if (error) {
                console.error('Error updating appointment:', error);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }

            // Respond with success message or updated ID
            res.json({ success: true, updatedId: update_apptid });
        });
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to add appointment data to the database
app.post('/deleteAppointment', async (req, res) => {
    const { delete_apptid } = req.body;

    try {
        values = delete_apptid;
        // Update the appointment data in the database
        const query = 'DELETE FROM DenormalizedAppointments WHERE apptid = ?';
        connection.query(query, values, (error, results) => {
            if (error) {
                console.error('Error updating appointment:', error);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }

            // Respond with success message or updated ID
            res.json({ success: true});
        });
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to retrieve appointment data based on apptid
app.get('/getAppointmentData', (req, res) => {
    //console.log("in /getAppointmentData");
    const { apptid } = req.query;

    // Query to retrieve appointment data based on apptid
    const query = 'SELECT * FROM DenormalizedAppointments WHERE apptid = ?';
    connection.query(query, [apptid], (error, results) => {
        if (error) {
            console.error('Error fetching appointment data:', error);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        // Log the received apptid and results for debugging
        //console.log('Received apptid:', apptid);
        //console.log('Query results:', results);

        // If appointment data is found, send it in the response
        if (results.length > 0) {
            const appointmentData = results[0];
            //console.log("appointmentData: ", appointmentData);
            res.json(appointmentData);
        } else {
            //console.log("Appointment data not found");
            res.status(404).json({ error: 'Appointment data not found' });
        }
    });
});

// Endpoint to generate report
app.get('/generateReport', (req, res) => {
    const { type } = req.query;
    //console.log("In generate report: " + type);
    let sqlQuery = '';

    // Determine SQL query based on report type
    if (type === 'total_app_type') {
        sqlQuery = `SELECT app_type, COUNT(*) AS total_count FROM DenormalizedAppointments GROUP BY app_type ORDER BY total_count DESC`;
    } else if (type === 'clinic_performance') {
        sqlQuery = `SELECT clinicid, COUNT(*) AS total_count FROM DenormalizedAppointments GROUP BY clinicid ORDER BY total_count DESC`;
    } else {
        return res.status(400).json({ error: 'Invalid report type' });
    }

    // Execute SQL query to fetch report data
    connection.query(sqlQuery, (error, results) => {
        if (error) {
            console.error('Error generating report:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }

        // Send report data in the response
        res.json(results);
    });
});



// Function to generate apptid with the specified pattern
function generateApptId() {
    return new Promise((resolve, reject) => {
        const prefix = '000CAFE';
        const hexRegex = /[0-9A-F]+/g;

        // Find the biggest apptid with the specified pattern
        const query = 'SELECT MAX(apptid) AS maxApptid FROM DenormalizedAppointments WHERE apptid LIKE ?';
        const pattern = prefix + '%';

        connection.query(query, [pattern], (error, results) => {
            if (error) {
                console.error('Error fetching max apptid:', error);
                reject(error); // Reject the Promise on error
                return;
            }

            let nextHexValue = '00'; // Default value if no existing apptid found
            let newApptId = prefix + nextHexValue;
            if (results[0].maxApptid) {
                // Extract the hex part from the max apptid
                const match = results[0].maxApptid.match(hexRegex);
                if (match) {
                    // Increment the hex part by 1
                    const maxHex = match[0]; // Use the first match
                    const newHexValue = (parseInt(maxHex, 16) + 1).toString(16).toUpperCase().padStart(2, '0');
                    nextHexValue = newHexValue;
                    newApptId = '000'+nextHexValue;
                }
            }
            // Construct the new apptid
            //console.log('newApptId = ' + newApptId);
            resolve(newApptId); // Resolve the Promise with the new apptid
        });
    });
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
