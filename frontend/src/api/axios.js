import axios from 'axios';

// 🔧 Axios 인스턴스 생성 (기본 baseURL 설정)
const instance = axios.create({
  baseURL: 'http://localhost:8000/api/', // 배포 시 변경 필요
});

// 🔐 요청 인터셉터: access 토큰을 Authorization 헤더에 추가
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');    // key 수정!
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔄 응답 인터셉터: access 만료 시 refresh로 갱신 시도
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // access가 만료, 아직 재시도 X
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh');   // key 수정!
        if (!refreshToken) throw new Error('No refresh token');

        // refresh로 새 access 요청
        const res = await axios.post('http://localhost:8000/api/token/refresh/', {
          refresh: refreshToken,
        });

        // 새 access 저장
        localStorage.setItem('access', res.data.access);        // key 수정!
        originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
        return instance(originalRequest);
      } catch (refreshError) {
        // refresh 실패 시 로그아웃 및 로그인 페이지로 이동
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('username');
        window.location.href = '/auth';
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
