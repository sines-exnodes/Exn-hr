/// Format a date string from API format (yyyy-MM-dd) to display format (dd/MM/yyyy).
/// Returns the original string if parsing fails.
String formatDateDisplay(String? dateStr) {
  if (dateStr == null || dateStr.isEmpty) return 'N/A';
  try {
    // Handle ISO datetime strings (e.g. "2026-03-27T08:30:00Z")
    final dt = DateTime.parse(dateStr);
    return '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year}';
  } catch (_) {
    return dateStr;
  }
}

/// Format a datetime string to time only (HH:mm).
String formatTimeDisplay(String? dateTimeStr) {
  if (dateTimeStr == null || dateTimeStr.isEmpty) return '--:--';
  try {
    final dt = DateTime.parse(dateTimeStr).toLocal();
    return '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
  } catch (_) {
    return dateTimeStr;
  }
}
