import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ isLoggedIn, authReady, children }) {
  if (!authReady || isLoggedIn === null) return null; // ✅ 인증 여부 미확정 → 렌더링 보류
  return isLoggedIn ? children : <Navigate to="/auth" replace />;
}

export default PrivateRoute;