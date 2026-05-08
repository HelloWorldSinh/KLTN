export const formatDateTime = (dateString: string | undefined | null) => {
  if (!dateString) return 'Chưa cập nhật';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch (e) {
    return dateString;
  }
};
