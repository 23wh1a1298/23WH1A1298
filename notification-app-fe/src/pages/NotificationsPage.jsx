import { useState, useEffect } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Divider,
  Pagination,
  Stack,
  Typography,
  Card,
  CardContent,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from "@mui/material";
import { fetchNotificationsApi } from "../api/notifications";

export default function NotificationsPage() {
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [viewedIds, setViewedIds] = useState(() => {
    const saved = localStorage.getItem("viewed_notifications");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchNotificationsApi({ limit, page, type: filter });
        if (isMounted) {
          setNotifications(data?.notifications || []);
        }
      } catch (err) {
        if (isMounted) {
          setError("Unable to sync notifications with the server.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadNotifications();
    return () => { isMounted = false; };
  }, [filter, page, limit]);

  const handleNotificationClick = (id) => {
    if (!viewedIds.includes(id)) {
      const updated = [...viewedIds, id];
      setViewedIds(updated);
      localStorage.setItem("viewed_notifications", JSON.stringify(updated));
    }
  };

  const getBadgeColor = (type) => {
    if (type === "Placement") return "success";
    if (type === "Result") return "secondary";
    return "info";
  };

  const totalPages = Math.ceil(notifications.length / limit) || 1;

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", px: 2, py: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Campus Notifications
        </Typography>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ marginBottom: 3, maxWidth: 200 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Filter Category</InputLabel>
          <Select
            value={filter}
            label="Filter Category"
            onChange={(e) => { setFilter(e.target.value); setPage(1); }}
          >
            <MenuItem value="All">All Items</MenuItem>
            <MenuItem value="Event">Events</MenuItem>
            <MenuItem value="Result">Results</MenuItem>
            <MenuItem value="Placement">Placements</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      {!loading && !error && notifications.length === 0 && (
        <Alert severity="info">No recent updates match your filter criteria.</Alert>
      )}

      {!loading && !error && notifications.length > 0 && (
        <Stack spacing={1.5}>
          {notifications.map((item) => {
            const isRead = viewedIds.includes(item.ID);
            return (
              <Card
                key={item.ID}
                variant="outlined"
                onClick={() => handleNotificationClick(item.ID)}
                sx={{
                  backgroundColor: isRead ? "#fafafa" : "#ffffff",
                  borderLeft: isRead ? "4px solid #dcdde1" : "4px solid #1976d2",
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "#f5f5f5" },
                }}
              >
                <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Chip label={item.Type} size="small" color={getBadgeColor(item.Type)} />
                    <Typography variant="caption" color="textSecondary">{item.Timestamp}</Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: isRead ? 400 : 600, color: isRead ? "text.secondary" : "text.primary" }}
                  >
                    {item.Message}
                  </Typography>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}

      {!loading && notifications.length > 0 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  );
}