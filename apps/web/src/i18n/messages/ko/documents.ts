import type { Messages } from "../en";

const documents: Messages["documents"] = {
  backToFiles: "내 파일로 돌아가기",
  changed: "변경: ",
  changedAt: (when) => `변경: ${when}`,
  changedSr: ", 변경: ",
  changedSuffix: (when) => ` · 변경: ${when}`,
  checkingConnection: "Google Drive 연결을 확인하는 중",
  chooseFile: "파일을 선택하시면 여기에 미리보기가 나타납니다.",
  connect: "Google Drive 연결",
  connectHint: "파일을 여기서 보시려면 Google Drive를 연결해 주세요.",
  connectPracticeHint:
    "예시 파일로 연습하시려면 연습용 Google Drive를 연결해 주세요.",
  connected: (account) =>
    `연결됨: Google Drive${account ? ` (${account})` : ""}. 수정하거나 공유하시려면 Google Drive에서 파일을 열어 주세요.`,
  embedHint:
    "Google에서 직접 보여드리는 미리보기입니다. 로그인 안내가 나오면 연결하신 Google 계정을 사용하시거나 Google Drive에서 파일을 열어 주세요.",
  empty: "Google Drive에 아직 파일이 없습니다.",
  fileCountAll: (count) =>
    count === 1 ? "파일은 이 1개뿐입니다." : `전체 파일 ${count}개입니다.`,
  filesFound: "찾은 파일",
  find: "이름으로 파일 찾기",
  folderNoPreview:
    "여기서는 폴더를 미리 볼 수 없습니다. 안의 내용을 보시려면 Google Drive에서 열어 주세요.",
  kinds: {
    Document: "문서",
    File: "파일",
    Folder: "폴더",
    PDF: "PDF",
    Picture: "사진",
    Slides: "프레젠테이션",
    Spreadsheet: "스프레드시트",
  },
  loadingFiles: "Drive 파일을 불러오는 중",
  loadingMore: "파일을 더 불러오는 중",
  moreFailed: "다음 파일들을 불러오지 못했습니다.",
  noLink:
    "Google Drive에서 이 파일의 링크를 제공하지 않았습니다. Google Drive를 열어 파일 이름으로 검색해 주세요.",
  noMatch: (search) => `이름에 “${search}”이 포함된 파일이 없습니다.`,
  openInDrive: "Google Drive에서 열기",
  opened: (name) => `열림: ${name}`,
  opensNewTab: "(새 탭에서 열림)",
  practiceConnected:
    "예시 파일과 연습 모드에서 저장하신 메모를 사용하는 연습용 Drive입니다. 실제 Google 계정에서 가져온 내용은 없습니다.",
  practiceNoLink:
    "연습용 파일은 LifeLink 안에만 있으므로 Google Drive에서 열 수 없습니다. 실제 Drive를 연결하시면 이 버튼으로 해당 파일을 여실 수 있습니다.",
  previewOf: (name) => `Google Drive의 ${name} 미리보기`,
  previewPrefix: "미리보기: ",
  reconnect: "Google Drive 다시 연결",
  searching: "검색 중…",
  sort: "정렬",
  sorts: {
    folders_first: "폴더 먼저",
    name_asc: "이름 오름차순",
    name_desc: "이름 내림차순",
    oldest: "오래된 순",
    recent: "최근 변경순",
  },
  title: "문서",
  whatItSays: (name) => `${name}의 내용`,
  yourDrive: "내 Google Drive",
  yourDriveFiles: "내 Drive 파일",
  yourFiles: "내 파일",
};

export { documents };
