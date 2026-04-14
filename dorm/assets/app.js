import { initializeApp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, setDoc, doc, updateDoc, onSnapshot, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey:            "AIzaSyAs6t5RsKjIr0mJEI6gnk579AIcG-_FJ_I",
  authDomain:        "smartdorm-3ab79.firebaseapp.com",
  projectId:         "smartdorm-3ab79",
  storageBucket:     "smartdorm-3ab79.firebasestorage.app",
  messagingSenderId: "240227925869",
  appId:             "1:240227925869:web:5a71f95a2f18bef1972464"
};

const _app = initializeApp(firebaseConfig);
const auth = getAuth(_app);
const db   = getFirestore(_app);

export { auth, db, signInWithEmailAndPassword, signOut, onAuthStateChanged,
         collection, getDocs, addDoc, setDoc, doc, updateDoc, onSnapshot, serverTimestamp };

export const appState = {
  user: null,
  roomDevices: { light: false, doorLock: true, ac: false, fan: false }
};

export const menuItems = [
  { id: 'dashboard',    label: '首頁 Dashboard', icon: 'house',       href: './dashboard.html'    },
  { id: 'biometric',    label: '門禁生物辨識',   icon: 'fingerprint', href: './biometric.html'    },
  { id: 'room-control', label: '房間控制',       icon: 'lightbulb',   href: './room-control.html' },
  { id: 'energy',       label: '能源監控',       icon: 'activity',    href: './energy.html'       },
  { id: 'package',      label: '包裹管理',       icon: 'package',     href: './package.html'      },
  { id: 'visitor',      label: '訪客管理',       icon: 'users',       href: './visitor.html'      },
  { id: 'maintenance',  label: '維修報修',       icon: 'wrench',      href: './maintenance.html'  },
  { id: 'medical',      label: '醫療緊急通知',   icon: 'heart',       href: './medical.html'      }
];

export const roomScenes = [
  { id: 'morning', name: '晨間模式', icon: 'sun',       description: '開燈、門鎖維持，冷氣關閉。' },
  { id: 'sleep',   name: '睡眠模式', icon: 'moon',      description: '關燈、冷氣開啟、門鎖上鎖。' },
  { id: 'study',   name: '學習模式', icon: 'book-open', description: '燈光全開，冷氣舒適溫度。'   },
  { id: 'relax',   name: '放鬆模式', icon: 'coffee',    description: '燈光柔和，電風扇運轉。'     }
];

export function getStatusBadge(status) {
  const cls = {
    waiting:'bg-blue-100 text-blue-700', picked:'bg-green-100 text-green-700',
    processing:'bg-blue-100 text-blue-700', completed:'bg-green-100 text-green-700',
    cancelled:'bg-gray-100 text-gray-600', approved:'bg-green-100 text-green-700',
    pending:'bg-yellow-100 text-yellow-700', success:'bg-green-100 text-green-700', failed:'bg-red-100 text-red-700'
  };
  const label = {
    waiting:'待領取', picked:'已領取', processing:'處理中', completed:'已完成',
    cancelled:'已取消', approved:'已核准', pending:'待審核', success:'成功', failed:'失敗'
  };
  return `<span class="inline-flex px-3 py-1 rounded-full text-sm font-medium ${cls[status]||'bg-gray-100 text-gray-600'}">${label[status]||status}</span>`;
}

export function getPriorityBadge(p) {
  const cls = { high:'bg-red-100 text-red-700', normal:'bg-blue-100 text-blue-700', low:'bg-gray-100 text-gray-600' };
  const lbl = { high:'高', normal:'一般', low:'低' };
  return `<span class="px-2 py-1 rounded text-xs font-medium ${cls[p]||'bg-gray-100 text-gray-600'}">${lbl[p]||p}</span>`;
}

export function layoutStart(page, title, name='', room='', sid='') {
  const nav = menuItems.map(m => `
    <a href="${m.href}" class="nav-item ${page===m.id?'active':''}">
      <i data-lucide="${m.icon}" style="width:20px;height:20px;flex-shrink:0"></i>
      <span>${m.label}</span>
    </a>`).join('');
  return `
<div style="display:flex;height:100vh;background:#F9FAFB;overflow:hidden">
  <aside style="width:256px;background:white;box-shadow:2px 0 8px rgba(0,0,0,.06);display:flex;flex-direction:column;flex-shrink:0">
    <div style="padding:24px 20px;border-bottom:1px solid #E5E7EB">
      <div style="font-size:18px;font-weight:700;color:#2563EB">🏠 智慧宿舍系統</div>
      <div style="font-size:13px;color:#6B7280;margin-top:4px">${name}${room?'｜'+room:''}</div>
    </div>
    <nav style="flex:1;overflow-y:auto;padding:16px 12px">${nav}</nav>
    <div style="padding:12px;border-top:1px solid #E5E7EB">
      <button id="logoutBtn" style="width:100%;display:flex;align-items:center;gap:10px;padding:12px 16px;color:#DC2626;background:none;border:none;border-radius:8px;cursor:pointer;font-size:14px"
        onmouseover="this.style.background='#FEF2F2'" onmouseout="this.style.background='none'">
        <i data-lucide="log-out" style="width:18px;height:18px"></i> 登出
      </button>
    </div>
  </aside>
  <div style="flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0">
    <header style="background:white;border-bottom:1px solid #E5E7EB;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0">
      <div>
        <div style="font-size:20px;font-weight:600;color:#2563EB">${title}</div>
        <div style="font-size:13px;color:#9CA3AF">Smart Dormitory Management System</div>
      </div>
      <span style="padding:4px 12px;background:#EFF6FF;color:#2563EB;border-radius:9999px;font-size:13px">${sid}</span>
    </header>
    <main style="flex:1;overflow-y:auto">`;
}

export function layoutEnd() { return `</main></div></div>`; }
export function initIcons() { if (window.lucide) lucide.createIcons(); }
export function initLogout() {
  const b = document.getElementById('logoutBtn');
  if (b) b.addEventListener('click', async () => { await signOut(auth); window.location.href='./login.html'; });
}
export function requireAuth(cb) {
  onAuthStateChanged(auth, u => {
    if (!u) { window.location.href='./login.html'; return; }
    appState.user = u; cb(u);
  });
}