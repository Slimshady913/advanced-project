import axios from 'axios';

// Axios 인스턴스 생성
const instance = axios.create({
  baseURL: 'http://localhost:8000/api/', // 개발 시 로컬 서버 주소, 배포 시 변경 필요
  withCredentials: true, // 쿠키 기반 인증을 위해 요청에 쿠키 포함
});

// 응답 인터셉터 설정: 인증 실패 시 토큰 재발급 시도 또는 로그아웃 처리
instance.interceptors.response.use(
  (response) => response, // 정상 응답은 그대로 반환
  async (error) => {
    const originalRequest = error.config;

    // 401 Unauthorized 오류 발생 시, 토큰 재발급을 시도
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // 서버에 Refresh 토큰을 담은 요청을 보내 Access 토큰 재발급 시도
        await instance.post('/users/token/refresh/');
        // 토큰 재발급 성공 시 원래 요청을 재시도
        return instance(originalRequest);
      } catch {
        // Refresh 토큰도 만료된 경우: 로그인 만료로 간주하고 에러 반환
        return Promise.reject(error);
      }
    }

    // 기타 오류는 그대로 전달
    return Promise.reject(error);
  }
);

export default instance;