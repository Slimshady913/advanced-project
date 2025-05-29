import axios from 'axios';

// ✅ Axios 인스턴스 생성
const instance = axios.create({
  baseURL: 'http://localhost:8000/api/', // 배포 시 변경 필요
  withCredentials: true, // ✅ 쿠키 전송 허용 (가장 중요!)
});

// ✅ 응답 인터셉터: 401 → 자동 토큰 갱신 또는 로그아웃 처리
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await instance.post('/users/token/refresh/');
        return instance(originalRequest);
      } catch {
        // ✅ 리디렉션 제거: 단순히 인증 실패 처리만 하고 끝냄
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;