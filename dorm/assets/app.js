// assets/app.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getAuth
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  getFirestore,
  collection, getDocs,
  doc, getDoc,
  addDoc, updateDoc, deleteDoc,
  query, where, orderBy, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// ── Firebase 設定 ────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyAs6t5RsKjIr0mJEI6gnk579AIcG-_FJ_I",
  authDomain: "smartdorm-3ab79.firebaseapp.com",
  projectId: "smartdorm-3ab79",
  storageBucket: "smartdorm-3ab79.firebasestorage.app",
  messagingSenderId: "240227925869",
  appId: "1:240227925869:web:5a71f95a2f18bef1972464"
};

const _app = initializeApp(firebaseConfig);
export const auth = getAuth(_app);
export const db   = getFirestore(_app);

// ── Re-export 常用 Firestore 函式 ────────────────────────────────────────────
export {
  collection, getDocs,
  doc, getDoc,
  addDoc, updateDoc, deleteDoc,
  query, where, orderBy, onSnapshot
};

// ── 安全版 getDocs：出錯時回傳 { docs: [], forEach: ()=>{} }，不會崩潰 ──────
export async function safeGetDocs(ref) {
  try {
    return await getDocs(ref);
  } catch (err) {
    console.warn('[safeGetDocs] 查詢失敗:', err.code || err.message);
    return { docs: [], forEach: () => {}, empty: true };
  }
}

// ── 安全版 getDoc：出錯時回傳 { exists: ()=>false, data: ()=>({}) } ─────────
export async function safeGetDoc(ref) {
  try {
    return await getDoc(ref);
  } catch (err) {
    console.warn('[safeGetDoc] 查詢失敗:', err.code || err.message);
    return { exists: () => false, data: () => ({}) };
  }
}

// ── requireAuth：改用 localStorage，不再依賴 Firebase Auth ──────────────────
export function requireAuth(callback) {
  const studentId  = localStorage.getItem('studentId');
  const cachedUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

  if (!studentId) {
    window.location.href = './login.html';
    return;
  }

  // 與原本 Firebase user 物件相容，讓各頁面的 user.uid / user.email 不壞掉
  const user = {
    uid:         studentId,
    email:       cachedUser?.name || studentId,
    displayName: cachedUser?.name || '',
    studentId:   studentId,
    name:        cachedUser?.name  || '',
    room:        cachedUser?.room  || '—',
    bed:         cachedUser?.bed   || '',
    class:       cachedUser?.class || ''
  };

  // 支援 async callback，並攔截所有未捕獲的錯誤
  Promise.resolve(callback(user)).catch(err => {
    console.error('[requireAuth] 頁面載入錯誤:', err);
    // 發生嚴重錯誤時，顯示錯誤訊息，不要讓頁面永遠停在「載入中」
    const page = document.getElementById('page');
    if (page && page.textContent.includes('載入中')) {
      page.innerHTML = `
        <div class="flex items-center justify-center min-h-screen flex-col gap-4 text-gray-500">
          <p class="text-lg font-medium">頁面載入失敗</p>
          <p class="text-sm text-gray-400">${err.message || '請檢查 Firestore 規則或網路連線'}</p>
          <a href="./dashboard.html"
             class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            回到首頁
          </a>
        </div>`;
    }
  });
}

// ── layoutStart：產生 Sidebar + Header 開頭 HTML ─────────────────────────────
export function layoutStart(activePage, pageTitle, name, room, sid) {
  const navItems = [
    { id: 'dashboard',    href: './dashboard.html',    icon: 'layout-dashboard', label: '首頁 Dashboard' },
    { id: 'room-control', href: './room-control.html', icon: 'home',             label: '房間控制'       },
    { id: 'energy',       href: './energy.html',       icon: 'zap',              label: '能源監控'       },
    { id: 'package',      href: './package.html',      icon: 'package',          label: '包裹管理'       },
    { id: 'maintenance',  href: './maintenance.html',  icon: 'wrench',           label: '維修報修'       },
    { id: 'visitor',      href: './visitor.html',      icon: 'users',            label: '訪客管理'       },
    { id: 'medical',      href: './medical.html',      icon: 'heart-pulse',      label: '緊急通知'       },
  ];

  const navHTML = navItems.map(item => {
    const isActive = item.id === activePage;
    const cls = isActive
      ? 'flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-50 text-blue-600 text-sm font-medium'
      : 'flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 text-sm transition-colors';
    return `<a href="${item.href}" class="${cls}">
      <i data-lucide="${item.icon}" class="w-4 h-4"></i> ${item.label}
    </a>`;
  }).join('');

  return `
    <div class="flex min-h-screen">
      <aside class="w-64 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 left-0 z-10">
        <div class="p-6 border-b border-gray-100">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <i data-lucide="house" class="w-5 h-5 text-white"></i>
            </div>
            <div>
              <p class="font-semibold text-gray-900 text-sm">智慧宿舍系統</p>
              <p class="text-xs text-gray-400">Smart Dorm</p>
            </div>
          </div>
        </div>
        <nav class="flex-1 p-4 space-y-1 overflow-y-auto">${navHTML}</nav>
        <div class="p-4 border-t border-gray-100">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <i data-lucide="user" class="w-4 h-4 text-blue-600"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">${name || '使用者'}</p>
              <p class="text-xs text-gray-400 truncate">${room || '—'}</p>
            </div>
          </div>
          <button id="logoutBtn"
            class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500
                   hover:bg-red-50 hover:text-red-600 text-sm transition-colors">
            <i data-lucide="log-out" class="w-4 h-4"></i> 登出
          </button>
        </div>
      </aside>
      <div class="flex-1 flex flex-col ml-64 min-h-screen">
        <header class="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <h1 class="text-xl font-semibold text-gray-900">${pageTitle}</h1>
          <p class="text-sm text-gray-400">${room || '—'}｜${sid || ''}</p>
        </header>
        <main class="flex-1">
  `;
}

// ── layoutEnd：關閉 layoutStart 的 HTML ──────────────────────────────────────
export function layoutEnd() {
  return `
        </main>
      </div>
    </div>
  `;
}

// ── initIcons：初始化 Lucide 圖示 ────────────────────────────────────────────
export function initIcons() {
  if (window.lucide) window.lucide.createIcons();
}

// ── initLogout：綁定登出按鈕 ─────────────────────────────────────────────────
export function initLogout() {
  const btn = document.getElementById('logoutBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    localStorage.removeItem('studentId');
    localStorage.removeItem('currentUser');
    window.location.href = './login.html';
  });
}