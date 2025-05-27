import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import './ProfilePage.css';
import { ClipLoader } from 'react-spinners';

/**
 * ProfilePage: 사용자 프로필 및 구독 관리 페이지
 * - 닉네임 수정 및 구독 중인 OTT 관리
 */
const ProfilePage = ({ setGlobalUsername }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [subscribedOtts, setSubscribedOtts] = useState([]);
  const [ottList, setOttList] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // 🔄 초기 데이터 로딩: OTT 목록 + 사용자 정보
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ottRes, profileRes] = await Promise.all([
          axios.get('/ott/'),
          axios.get('/users/profile/')
        ]);

        // ottRes.data가 배열인지 확인, 아니라면 .results 또는 [] 사용
        const ottData = Array.isArray(ottRes.data)
          ? ottRes.data
          : Array.isArray(ottRes.data.results)
          ? ottRes.data.results
          : [];

        setOttList(ottData);

        setEmail(profileRes.data.email);
        setUsername(profileRes.data.username);
        setSubscribedOtts(
          Array.isArray(profileRes.data.subscribed_ott)
            ? profileRes.data.subscribed_ott.map((o) => o.id)
            : []
        );

        setIsLoading(false);
      } catch (err) {
        console.error('프로필 정보를 불러오지 못했습니다:', err);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ 구독 OTT 토글
  const toggleOtt = (id) => {
    setSubscribedOtts((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  };

  // 💾 저장 처리
  const handleSave = async () => {
    try {
      await axios.put('/users/update/', { username });
      await axios.post('/users/subscribe/', {
        ott_ids: [...new Set(subscribedOtts)],
      });
      setMessage('저장되었습니다!');

      // 🔄 Header에 닉네임 반영
      if (setGlobalUsername) {
        setGlobalUsername(username);
      }
    } catch {
      setMessage('저장에 실패했습니다.');
    }
  };

  // ⏳ 로딩 중 표시
  if (isLoading) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#141414',
          flexDirection: 'column',
          color: 'white',
        }}
      >
        <ClipLoader color="#e50914" size={60} />
        <p style={{ marginTop: '1rem', fontSize: '1.1rem' }}>
          잠시만 기다려주세요...
        </p>
      </div>
    );
  }

  // ✅ 메인 렌더링
  return (
    <div className="profile-page">
      <div className="profile-container">
        <h2>회원정보</h2>
        <p>
          <strong>이메일:</strong> {email}
        </p>

        <label>닉네임</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} />

        <label>구독 중인 OTT</label>
        <div className="ott-list">
          {Array.isArray(ottList) &&
            ottList.map((ott) => (
              <label key={ott.id} className="ott-item">
                <input
                  type="checkbox"
                  checked={subscribedOtts.includes(ott.id)}
                  onChange={() => toggleOtt(ott.id)}
                />
                <img src={ott.logo_url} alt={ott.name} />
                <span>{ott.name}</span>
              </label>
            ))}
        </div>

        <button onClick={handleSave} className="save-btn">
          저장하기
        </button>
        {message && <p className="save-message">{message}</p>}
      </div>
    </div>
  );
};

export default ProfilePage;