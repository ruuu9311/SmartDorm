// assets/app.js

// Firebase CDN 模組載入（請確認版本與你的專案一致）
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// ===== 1. Firebase 初始化 =====
// 請把以下 config 換成你專案的（從 Firebase Console → 專案設定 → Web App 取得）
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ===== 2. 共用工具：登入狀態與使用者 =====

export function getCurrentUser() {
  const raw = localStorage.getItem("currentUser");
  return raw ? JSON.parse(raw) : null;
}

export function setCurrentUser(user) {
  // user: { id, name, room, bed, class, role }
  localStorage.setItem("currentUser", JSON.stringify(user));
  localStorage.setItem("studentId", user.id || "");
  localStorage.setItem("userRole", user.role || "student");
  localStorage.setItem("userId", user.id || "");
  localStorage.setItem("userName", user.name || "");
  localStorage.setItem("userRoom", user.room || "");
  localStorage.setItem("isLoggedIn", "true");
}

export function clearAuth() {
  localStorage.clear();
}

// ===== 3. 學生頁面守門員 =====
// 在學生專用頁面（dashboard、room-control、energy、maintenance 等）一載入就呼叫
export async function requireStudentAuth() {
  const studentId = localStorage.getItem("studentId");
  const cachedUser = getCurrentUser();

  if (!studentId) {
    window.location.href = "./login.html";
    return null;
  }

  // 如果有快取資料而且 id 一致，就直接用
  if (cachedUser && cachedUser.id === studentId) {
    return cachedUser;
  }

  try {
    const userRef = doc(db, "users", studentId);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      clearAuth();
      window.location.href = "./login.html";
      return null;
    }

    const data = snap.data();

    const user = {
      id: studentId,
      name: data.name || "",
      room: data.room || "",
      bed: data.bed || "",
      class: data.class || "",
      role: data.role || "student",
      phone: data.phone || "",
    };

    setCurrentUser(user);
    return user;
  } catch (err) {
    console.error("requireStudentAuth error:", err);
    alert("載入使用者資料失敗，請稍後再試。");
    return null;
  }
}

// ===== 4. 管理員頁面守門員 =====
// 在 admin 開頭呼叫：requireAdminAuth();
export function requireAdminAuth() {
  const role = localStorage.getItem("userRole");
  if (role !== "admin") {
    window.location.href = "./login.html";
    return false;
  }
  return true;
}

// ===== 5. 登出按鈕綁定 =====
// 在有登出按鈕的頁面（學生或管理員）呼叫 initLogout('#logoutBtn');
export function initLogout(selector) {
  const btn = document.querySelector(selector);
  if (!btn) return;
  btn.addEventListener("click", () => {
    clearAuth();
    window.location.href = "./login.html";
  });
}

// ===== 6. 學生資料管理 (給 admin-students.html 用) =====

// 取得所有學生
export async function fetchAllStudents() {
  const colRef = collection(db, "users");
  const q = query(colRef, where("role", "==", "student"), orderBy("id"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// 新增學生（以學號當文件 ID，密碼預設為學號）
export async function createStudent(payload) {
  // payload: { id, name, class, bed, room, phone }
  const id = payload.id;
  const ref = doc(db, "users", id);
  await setDoc(ref, {
    id,
    name: payload.name || "",
    class: payload.class || "",
    bed: payload.bed || "",
    room: payload.room || "",
    phone: payload.phone || "",
    role: "student",
    password: id, // 預設密碼 = 學號
    createdAt: serverTimestamp(),
  });
}

// 更新學生
export async function updateStudent(id, partial) {
  const ref = doc(db, "users", id);
  await updateDoc(ref, partial);
}

// ===== 7. 其他集合的常用操作範例 =====

// 新增一筆維修報修
export async function createMaintenance(studentId, data) {
  // data: { type, description, room }
  const ref = doc(collection(db, "maintenance"));
  await setDoc(ref, {
    studentId,
    ...data,
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

// 新增一筆訪客申請
export async function createVisitor(studentId, data) {
  const ref = doc(collection(db, "visitor"));
  await setDoc(ref, {
    studentId,
    ...data,
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

// 新增一筆醫療求助
export async function createMedical(studentId, data) {
  const ref = doc(collection(db, "medical"));
  await setDoc(ref, {
    studentId,
    ...data,
    status: "open",
    createdAt: serverTimestamp(),
  });
}

// 取得包裹列表
export async function fetchPackagesByStudent(studentId) {
  const colRef = collection(db, "packages");
  const q = query(colRef, where("studentId", "==", studentId), orderBy("arrivalDate", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}