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
  const [ottList, setOttList] = useState([]);          // 항상 배열!
  const [selectedOtts, setSelectedOtts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // OTT 목록 불러오기
  useEffect(() => {
    axios.get('/ott/')
      .then(res => {
        // 배열인지 확인, DRF라면 res.data가 배열이어야 정상!
        let data = res.data;
        if (data && Array.isArray(data)) {
          setOttList(data);
        } else if (data && Array.isArray(data.results)) {
          // 혹시 pagination API라면
          setOttList(data.results);
        } else {
          setOttList([]);   // 잘못된 구조
        }
        setError('');
      })
      .catch(err => {
        setOttList([]);
        setError('OTT 목록 불러오기 실패');
        console.error('OTT 목록 불러오기 실패:', err);
      })
      .finally(() => setLoading(false));
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
            {loading ? (
              <div className="ott-loading">OTT 목록을 불러오는 중...</div>
            ) : error ? (
              <div className="ott-error">{error}</div>
            ) : (
              <div className="ott-list">
                {Array.isArray(ottList) && ottList.length > 0 ? (
                  ottList.map(ott => (
                    <label
                      key={ott.id}
                      className={`ott-item${selectedOtts.includes(ott.id) ? ' selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={selectedOtts.includes(ott.id)}
                        onChange={() => toggleOtt(ott.id)}
                      />
                      <img src={ott.logo_url} alt={ott.name} />
                      <span>{ott.name}</span>
                    </label>
                  ))
                ) : (
                  <div className="ott-empty">등록된 OTT가 없습니다.</div>
                )}
              </div>
            )}
            <button onClick={handleSubmit} className="save-btn">저장하기</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscribePage;