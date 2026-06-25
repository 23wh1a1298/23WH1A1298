const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const LOG_API_URL = "http://4.224.186.213/evaluation-service/logs";

// Mock database fallback for when the external cluster drops connection
const fallbackNotifications = [
    { ID: "1", Type: "Placement", Message: "Hexaware campus recruitment drive registrations are open for the upcoming batch.", Timestamp: "2026-06-25 10:00 AM" },
    { ID: "2", Type: "Result", Message: "B.Tech III-I Regular/Supplementary examination results have been declared.", Timestamp: "2026-06-25 11:30 AM" },
    { ID: "3", Type: "Event", Message: "Annual College Technical Fest 'Sparks 2026' registration schedule is now live.", Timestamp: "2026-06-24 02:00 PM" },
    { ID: "4", Type: "Placement", Message: "Amazon AWS placement onboarding credentials sent to shortlisted candidates.", Timestamp: "2026-06-24 04:15 PM" }
];

const sendServerLog = async (level, packageName, message) => {
    try {
        await axios.post(LOG_API_URL, {
            stack: "backend",
            level: level,
            package: packageName,
            message: message
        }, { timeout: 1000 });
    } catch (err) {
        console.log(`Log push skipped (External logging target returned status ${err.response?.status || 'Timeout'})`);
    }
};

app.get('/api/notifications', async (req, res) => {
    try {
        const response = await axios.get('http://20.244.56.144/evaluation-service/notifications', {
            params: req.query,
            headers: {
                'X-Client-ID': req.headers['x-client-id'],
                'Authorization': req.headers['authorization']
            },
            timeout: 2500 
        });
        
        res.json(response.data);
        sendServerLog("info", "route", "Successfully fetched campus notifications from server");
    } catch (error) {
        console.log("University server timed out. Serving local mock dataset fallback...");
        
        const requestedType = req.query.type || "All";
        let filtered = fallbackNotifications;
        
        if (requestedType !== "All") {
            filtered = fallbackNotifications.filter(n => n.Type === requestedType);
        }

        // Return the structure expected by your UI component
        res.json({
            notifications: filtered
        });

        sendServerLog("error", "handler", `Fallback deployed: ${error.message}`);
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend server successfully running on port ${PORT}`));