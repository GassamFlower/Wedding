import { useAuthStore } from "@/stores/auth"

const API_BASE = "https://cloud1-d3gt5vpbuf8acec14.service.tcloudbase.com/admin-api"

async function apiCall(data) {
  const res = await fetch(API_BASE, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
  const text = await res.text()
  let d
  try { d = JSON.parse(text) } catch(e) { throw new Error("bad response") }
  if (d.body) { try { return JSON.parse(d.body) } catch(e) { return d } }
  return d
}

export async function login(password) {
  const r = await apiCall({ action: "login", password })
  if (r.code === 0) { localStorage.setItem("admin_secret", password); return r.data }
  throw new Error(r.msg || "\u767b\u5f55\u5931\u8d25")
}

export async function checkIsAdmin() {
  const s = localStorage.getItem("admin_secret")
  if (!s) return false
  const r = await apiCall({ action: "checkIsAdmin", secret: s })
  return !!(r.data && r.data.isAdmin)
}

export async function callAdmin(action, payload = {}) {
  const s = localStorage.getItem("admin_secret")
  if (!s) { useAuthStore().setAdmin(false); throw new Error("\u672a\u767b\u5f55") }
  const r = await apiCall({ action, secret: s, ...payload })
  if (r.code === 0) return r.data
  if (r.code === 403) { useAuthStore().setAdmin(false); throw new Error(r.msg) }
  throw new Error(r.msg || "\u64cd\u4f5c\u5931\u8d25")
}
