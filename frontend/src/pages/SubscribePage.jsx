import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import './SubscribePage.css';

/**
 * SubscribePage: 회원가입 후 구독 OTT 선택 페이지
 * - 사용자는 구독 중인 OTT를 선택할 수 있음
 * - 저장 후 메인 페이지로 이동
 */
const SubscribePage = () => {
  const [ottList, setOttList] = useState([]);
  const [selectedOtts, setSelectedOtts] = useState([]);
  const navigate = useNavigate();

  // OTT 목록 불러오기
  useEffect(() => {
    axios.get('/ott/')
      .then(res => setOttList(res.data))
      .catch(err => console.error('OTT 목록 불러오기 실패:', err));
  }, []);

  // 선택된 OTT 토글 (체크박스)
  const toggleOtt = (id) => {
    setSelectedOtts(prev =>
      prev.includes(id) ? prev.filter(ottId => ottId !== id) : [...prev, id]
    );
  };

  // 저장 요청 → 메인페이지 이동
  const handleSubmit = async () => {
    try {
      await axios.post('/users/subscribe/', { ott_ids: selectedOtts });
      navigate('/');
    } catch (err) {
      alert('구독 설정에 실패했습니다.');
    }
  };

  // 렌더링
  return (
    <div className="subscribe-page">
      <div className="subscribe-background">
        <div className="subscribe-center-area">
          <div className="subscribe-box">
            <h2>구독 중인 OTT를 선택해주세요</h2>
            <p className="desc">
              구독 중인 OTT가 없다면 선택하지 않고 &lsquo;저장하기&rsquo;를 눌러도 됩니다.
            </p>
            <div className="ott-list">
              {ottList.map(ott => (
                <label key={ott.id} className={`ott-item${selectedOtts.includes(ott.id) ? ' selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={selectedOtts.includes(ott.id)}
                    onChange={() => toggleOtt(ott.id)}
                  />
                  <img src={ott.logo_url} alt={ott.name} />
                  <span>{ott.name}</span>
                </label>
              ))}
            </div>
            <button onClick={handleSubmit} className="save-btn">저장하기</button>
          </div>
        </div>
      </div>
      </div>
    );
  };
  
  export default SubscribePage;