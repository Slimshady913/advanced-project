# Node.js 공식 이미지를 베이스로 사용
FROM node:16

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json을 먼저 복사
COPY package*.json ./

# npm 의존성 설치
RUN npm install

# 나머지 소스 코드 복사
COPY . .

# React 개발 서버를 3000번 포트에서 실행
EXPOSE 3000

# React 앱 실행 명령
CMD ["npm", "start"]