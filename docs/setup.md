# BuildLog 개발 환경 안내

## 1. 문서 목적

이 문서는 BuildLog 개발에 사용할 도구, 버전, 개발 주소와 환경 변수 기준을 기록합니다. Phase 0에서 결정한 내용이며 실제 패키지 설치와 프로젝트 생성은 Phase 1부터 진행합니다.

## 2. Phase 0 확인 결과

확인 날짜: 2026-10-26

### 로컬 환경

| 항목 | 확인 결과 | 사용 결정 |
| --- | --- | --- |
| Python 기본 버전 | 3.15.1 | 사용하지 않음 |
| Python 추가 버전 | 3.13.14 | 백엔드 개발에 사용 |
| Python 내장 SQLite | 3.50.4 | 자동 테스트 기반으로 사용 |
| Node.js | 24.22.1 LTS | 프론트엔드 개발에 사용 |
| npm | 11.19.1 | 프론트엔드 패키지 관리에 사용 |
| npx | 11.19.1 | 필요한 초기 실행 명령에 사용 |

Python 3.13은 `py -3.13`으로 실행합니다. 이 컴퓨터에서는 PowerShell 실행 정책 때문에 `npm.ps1`과 `npx.ps1`이 차단되므로 `npm.cmd`와 `npx.cmd`를 사용합니다. 시스템 실행 정책은 변경하지 않습니다.

## 3. 선택한 주요 기술과 버전 기준

### 프론트엔드

| 항목 | 기준 버전 | 용도 |
| --- | --- | --- |
| React | 19.3.1 | 사용자 화면 |
| React DOM | 19.3.1 | 브라우저 화면 출력 |
| Vite | 8.3.5 | React 개발 서버와 빌드 |
| Vite React 플러그인 | 6.1.2 | React와 Vite 연결 |
| React Router | Phase 1 설치 시 안정 버전 고정 | 화면 이동 |
| Vitest | Phase 1 설치 시 안정 버전 고정 | 프론트엔드 자동 테스트 |
| Testing Library | Phase 1 설치 시 안정 버전 고정 | 사용자 행동 중심 화면 테스트 |

프로젝트는 React와 JavaScript로 작성합니다. TypeScript는 현재 범위에 추가하지 않습니다.

### 백엔드

| 항목 | 기준 버전 | 용도 |
| --- | --- | --- |
| Python | 3.13.14 | 백엔드 실행 |
| FastAPI | 0.162.0 | API 서버 |
| SQLAlchemy | 2.1.6 | PostgreSQL·SQLite3 공통 데이터 접근 |
| Alembic | 1.20.1 | 데이터 구조 변경 관리 |
| Psycopg | 3.3.6 | Supabase PostgreSQL 연결 |
| pydantic-settings | 2.16.1 | 환경 변수 읽기와 검사 |
| PyJWT | 2.15.1 | 로그인 토큰 생성과 확인 |
| pwdlib | 0.3.1 | Argon2 방식 비밀번호 처리 |
| pytest | Phase 1 설치 시 안정 버전 고정 | 백엔드 자동 테스트 |
| HTTPX | Phase 1 설치 시 안정 버전 고정 | FastAPI API 테스트 |

FastAPI 공식 보안 안내에 맞춰 비밀번호는 Argon2로 처리하고 인증 토큰은 PyJWT를 사용합니다. 토큰을 브라우저에 전달하고 보관하는 세부 방식은 인증 기능을 만드는 Phase 3에서 배포 주소와 함께 안전하게 확정합니다.

### 데이터베이스

- 실제 서비스: Supabase PostgreSQL
- 자동 테스트: SQLite3
- ORM: SQLAlchemy 2 계열
- 마이그레이션: Alembic
- PostgreSQL 드라이버: Psycopg 3
- SQLite3는 Python 3.13에 포함된 모듈을 사용합니다.
- 자동 테스트는 Supabase에 접속하지 않습니다.
- PostgreSQL에만 있는 기능에 의존하지 않고 두 데이터베이스에서 같은 모델과 기능 규칙을 사용합니다.

### 현재 수업 단계의 로컬 DB 대체

Supabase 수업을 진행하기 전까지는 실제 서비스 DB 연결을 사용하지 않습니다. 로컬 개발 서버는 `database/buildlog.sqlite3`에 저장하고, 자동 테스트는 별도의 SQLite3 데이터베이스를 사용합니다. Supabase 연결 문자열은 아직 필요하지 않으며 Phase 14에서 설정합니다.

## 4. 개발 주소

| 구분 | 주소 |
| --- | --- |
| React 개발 서버 | `http://localhost:5173` |
| FastAPI 개발 서버 | `http://localhost:8000` |
| API 기본 주소 | `http://localhost:8000/api/v1` |
| 상태 확인 API | `http://localhost:8000/api/v1/health` |
| API 문서 | `http://localhost:8000/docs` |

개발 환경에서 FastAPI가 허용할 프론트엔드 주소는 `http://localhost:5173` 하나로 시작합니다. 배포 주소는 Phase 14에서 실제 프론트엔드 주소로 바꿉니다.

## 5. 환경 변수 이름

### 백엔드

`backend/.env`에서 사용할 항목입니다.

| 이름 | 용도 | 비밀 여부 |
| --- | --- | --- |
| `APP_ENV` | `development`, `test`, `production` 환경 구분 | 아니요 |
| `DATABASE_URL` | Supabase PostgreSQL 연결 주소 | 예 |
| `TEST_DATABASE_URL` | SQLite3 테스트 연결 주소 | 아니요 |
| `AUTH_SECRET_KEY` | 인증 토큰 서명 | 예 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | 로그인 토큰 유효 시간 | 아니요 |
| `FRONTEND_ORIGIN` | FastAPI가 허용할 React 주소 | 아니요 |

기본값이 가능한 항목은 코드의 안전한 개발 기본값을 사용할 수 있지만, `DATABASE_URL`과 `AUTH_SECRET_KEY`의 실제 값은 `.env` 또는 배포 환경 변수에만 둡니다.

### 프론트엔드

`frontend/.env`에서 사용할 항목입니다.

| 이름 | 용도 | 비밀 여부 |
| --- | --- | --- |
| `VITE_API_BASE_URL` | React가 호출할 FastAPI 기본 주소 | 아니요 |

Supabase 연결 정보와 인증 비밀값은 프론트엔드 환경 변수에 넣지 않습니다. React는 Supabase에 직접 접속하지 않고 FastAPI API만 호출합니다.

## 6. 설치와 실행 명령

아래 명령은 프로젝트 최상위 폴더를 기준으로 설명합니다.

### 백엔드 준비

```powershell
cd backend
py -3.13 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

### 백엔드 실행

```powershell
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host localhost --port 8000
```

실행 후 `http://localhost:8000/api/v1/health`에서 상태를 확인할 수 있습니다.

### 백엔드 테스트

```powershell
cd backend
.\.venv\Scripts\python.exe -m pytest
```

### 프론트엔드 준비

```powershell
cd frontend
npm.cmd install
```

### 프론트엔드 실행

```powershell
cd frontend
npm.cmd run dev
```

실행 후 `http://localhost:5173`에서 화면을 확인할 수 있습니다.

### 프론트엔드 검사

```powershell
cd frontend
npm.cmd test
npm.cmd run lint
npm.cmd run build
```

백엔드와 프론트엔드 개발 서버는 각각 별도의 터미널에서 실행합니다.

## 7. 사용자 준비 사항

Phase 0부터 Phase 3까지는 사용자가 입력해야 하는 Supabase 비밀값이 없습니다.

Supabase를 연결하는 Phase 14 전까지는 다음 항목을 준비하지 않아도 됩니다. Phase 14를 시작할 때 준비합니다.

1. Supabase 프로젝트를 만듭니다.
2. Supabase PostgreSQL 연결 문자열을 확인합니다.
3. Phase 14에서 만들어질 배포 환경 변수의 `DATABASE_URL`에 연결 문자열을 직접 입력합니다.

연결 문자열, 데이터베이스 비밀번호, `AUTH_SECRET_KEY`는 채팅이나 문서에 보내지 않습니다. Supabase 프로젝트가 이미 있다면 새로 만들 필요가 없습니다.
