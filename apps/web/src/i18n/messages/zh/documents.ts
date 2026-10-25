import type { Messages } from "../en";

const documents: Messages["documents"] = {
  backToFiles: "返回您的文件",
  changed: "修改时间：",
  changedAt: (when: string) => `修改时间：${when}`,
  changedSr: "，修改时间：",
  changedSuffix: (when: string) => ` · 修改时间：${when}`,
  checkingConnection: "正在检查您的 Google Drive 连接",
  chooseFile: "请选择文件，在这里查看预览。",
  connect: "连接 Google Drive",
  connectHint: "连接 Google Drive 后，即可在这里查看您的文件。",
  connectPracticeHint: "连接练习版 Google Drive，用示例文件试一试。",
  connected: (account: string | null) =>
    `已连接：Google Drive${account ? `（${account}）` : ""}。如需更改或分享文件，请在 Google Drive 中打开。`,
  embedHint:
    "此预览由 Google 直接显示。如果提示您登录，请使用已连接的 Google 账号，或在 Google Drive 中打开文件。",
  empty: "您的 Google Drive 中尚无文件。",
  fileCountAll: (count: number) => `已显示全部 ${count} 个文件。`,
  filesFound: "找到的文件",
  find: "按名称查找文件",
  folderNoPreview:
    "这里无法预览文件夹。请在 Google Drive 中打开，查看其中的内容。",
  kinds: {
    Document: "文档",
    File: "文件",
    Folder: "文件夹",
    PDF: "PDF",
    Picture: "图片",
    Slides: "幻灯片",
    Spreadsheet: "电子表格",
  },
  loadingFiles: "正在加载您的 Drive 文件",
  loadingMore: "正在加载更多文件",
  moreFailed: "无法加载下一批文件。",
  noLink: "Google Drive 未提供此文件的链接。请打开 Google Drive，按名称搜索。",
  noMatch: (search: string) => `没有文件名包含“${search}”。`,
  openInDrive: "在 Google Drive 中打开",
  opened: (name: string) => `已打开：${name}`,
  opensNewTab: "（在新标签页中打开）",
  practiceConnected:
    "练习版 Drive 中包含示例文件，以及您在练习模式下保存的笔记。这里的内容都不来自真实的 Google 账号。",
  practiceNoLink:
    "练习文件只保存在 LifeLink 中，因此无法在 Google Drive 中打开。连接真实的 Drive 后，此按钮会在那里打开文件。",
  previewOf: (name: string) => `Google Drive 中 ${name} 的预览`,
  previewPrefix: "预览：",
  reconnect: "重新连接 Google Drive",
  searching: "正在搜索…",
  sort: "排序",
  sorts: {
    folders_first: "文件夹优先",
    name_asc: "名称，A 到 Z",
    name_desc: "名称，Z 到 A",
    oldest: "最早的优先",
    recent: "最近修改",
  },
  title: "文档",
  whatItSays: (name: string) => `${name} 的内容`,
  yourDrive: "您的 Google Drive",
  yourDriveFiles: "您的 Drive 文件",
  yourFiles: "您的文件",
};

export { documents };
