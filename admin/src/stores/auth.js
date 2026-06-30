import { defineStore } from "pinia"
import { ref, computed } from "vue"

export const useAuthStore = defineStore("auth", () => {
  const isAdmin = ref(localStorage.getItem("admin_status") === "true")

  function setAdmin(v) {
    isAdmin.value = v
    localStorage.setItem("admin_status", String(v))
  }

  function clearAdmin() {
    isAdmin.value = false
    localStorage.removeItem("admin_status")
    localStorage.removeItem("admin_secret")
  }

  function logout() {
    clearAdmin()
  }

  return { isAdmin, isLoggedIn: isAdmin, setAdmin, clearAdmin, logout }
})
