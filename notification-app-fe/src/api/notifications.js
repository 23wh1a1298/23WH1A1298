import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";
const LOG_API_URL = "http://4.224.186.213/evaluation-service/logs";

const YOUR_CLIENT_ID = "024dad31-e741-48f9-84a2-7f35bde7f010";
const YOUR_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiIyM3doMWExMjk4QGJ2cml0aHlkZXJhYmFkLmVkdS5pbiIsImV4cCI6MTg4MjM3NTU1MSwiaWF0IjoxNzgyMzc0NjUxLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiZGUyZTI2NGEtZTM2Zi00ZjgzLWFhOTMtOTQyODRjMjc4NDU3IiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiZ3VydSBtZWdoYW5hIHJhY2hha29uZHUiLCJzdWIiOiIwMjRkYWQzMS1lNzQxLTQ4ZjktODRhMi03ZjM1YmRlN2YwMTAifSwiZW1haWwiOiIyM3doMWExMjk4QGJ2cml0aHlkZXJhYmFkLmVkdS5pbiIsIm5hbWUiOiJndXJ1IG1lZ2hhbmEgcmFjaGFrb25kdSIsInJvbGxObyI6IjIzd2gxYTEyOTgiLCJhY2Nlc3NDb2RlIjoiYWhYanZwIiwiY2xpZW50SUQiOiIwMjRkYWQzMS1lNzQxLTQ4ZjktODRhMi03ZjM1YmRlN2YwMTAiLCJjbGllbnRTZWNyZXQiOiJjSnRDZ2hlSGFmSFJuVHdjIn0.esnWvb7Rd3MOsTVGI2iKLnKKQRQQFBxY2dWA4dusF7k";

// Helper function to send frontend logs
const sendFrontendLog = async (level, packageName, message) => {
  try {
    await axios.post(LOG_API_URL, {
      stack: "frontend",
      level: level,
      package: packageName,
      message: message
    });
  } catch (err) {
    console.error("Failed to push frontend log:", err);
  }
};

export const fetchNotificationsApi = async (filters) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/notifications`, {
      params: filters,
      headers: {
        "X-Client-ID": YOUR_CLIENT_ID,
        "Authorization": `Bearer ${YOUR_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      }
    });
    
    // Log successful layout load
    await sendFrontendLog("info", "api", "Frontend requested and retrieved notifications data successfully");
    return response.data;
  } catch (error) {
    console.error("API Fetch Error:", error);
    
    // Log error to assessment server
    await sendFrontendLog("error", "api", `Frontend sync failure: ${error.message}`);
    throw error;
  }
};