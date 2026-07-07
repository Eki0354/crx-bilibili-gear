import Cookies from "js-cookie";

export const KEY_LAST_VIP_PRIVILEGE = "__last_vip_privilege__";

function getLastTime(type = 1 | 2) {
  const data = JSON.parse(localStorage.getItem(KEY_LAST_VIP_PRIVILEGE) || "{}");
  return parseInt(data[`vip_${type}`] || 0);
}

function setLastTime(type = 1 | 2) {
  const data = JSON.parse(localStorage.getItem(KEY_LAST_VIP_PRIVILEGE) || "{}");
  data[`vip_${type}`] = Date.now();
  localStorage.setItem(KEY_LAST_VIP_PRIVILEGE, JSON.stringify(data));
}

export async function receiveVipPrivilege(type = 1 | 2) {
  const user = (window as any).__BiliUser__?.cache?.data;
  // 非大会员不领取
  if (!user || user.vip.type !== 2) return;

  const last = getLastTime(type);
  const now = Date.now();

  if (now - last < 1000 * 60 * 60 * 24 * 5) return;

  const url = "https://api.bilibili.com/x/vip/privilege/receive";
  const csrf = Cookies.get("bili_jct");

  if (!csrf) return;

  const data = new URLSearchParams();
  data.append("type", type.toString());
  data.append("platform", "web");
  data.append("csrf", csrf);

  try {
    const res = await fetch(url, {
      method: "post",
      body: data.toString(),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      credentials: "include",
    });
    const json = await res.json();

    return json?.code === 0;
  } catch (error) {
    console.log(`领取大会员 ${type} 权益失败：`, error);
    return false;
  } finally {
    setLastTime(type);
  }
}
