import { format } from 'date-fns';

export function formatDate(dateString) {
  if (!dateString) return '';
  try {
    // ISO 문자열로 변환(브라우저 환경에 따라 파싱 오류 방지)
    const date = new Date(dateString);
    return format(date, 'yyyy-MM-dd HH:mm');
  } catch {
    return dateString;
  }
}