const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

// 換成你實際的金鑰檔路徑和檔名
const serviceAccount = require("C:/Users/user/Downloads/secrets/serviceAccountKey.json");

// 換成 Firebase Console 中 ruuu9311@gmail.com 的完整 UID
const uid = "flHrEU6vvPZFHpskKAen2YVYXF62";

initializeApp({
  credential: cert(serviceAccount)
});

async function main() {
  await getAuth().setCustomUserClaims(uid, { admin: true });

  const user = await getAuth().getUser(uid);

  console.log("admin claim 設定完成");
  console.log("Email:", user.email);
  console.log("Custom claims:", user.customClaims);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("設定失敗：", error.message);
    process.exit(1);
  });