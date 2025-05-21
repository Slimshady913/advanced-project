export function validatePostInput({ title, content }) {
  if (!title.trim() || !content.trim())
    return '제목과 내용을 모두 입력해주세요.';
  if (title.trim().length < 2)
    return '제목은 최소 2자 이상 입력해주세요.';
  if (title.trim().length > 100)
    return '제목은 최대 100자까지 입력 가능합니다.';
  if (content.trim().length < 5)
    return '내용은 최소 5자 이상 입력해주세요.';
  if (content.trim().length > 2000)
    return '내용은 최대 2000자까지 입력 가능합니다.';
  // (선택) 간단한 XSS 방어: <script> 포함 방지
  if (/<script.*?>/i.test(title + content))
    return '스크립트 태그는 사용할 수 없습니다.';
  return null;
}