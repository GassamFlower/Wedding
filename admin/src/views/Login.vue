<template>
  <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)">
    <el-card style="width:400px;padding:20px" shadow="xl">
      <h2 style="text-align:center;color:#c19a50;margin-bottom:24px">大喜的日子 · 管理后台</h2>
      <el-form label-position="top">
        <el-form-item label="管理员密码">
          <el-input v-model="password" type="password" placeholder="请输入管理密码" show-password @keyup.enter="handleLogin" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" style="width:100%;background:#c19a50;border-color:#c19a50" @click="handleLogin">{{ loading ? '验证中...' : '登录 / 初始化' }}</el-button>
        </el-form-item>
      </el-form>
      <p style="text-align:center;color:#909399;font-size:12px">首次登录会自动绑定当前浏览器为管理员</p>
      <div v-if="error" style="color:#f56c6c;text-align:center;margin-top:12px">{{ error }}</div>
    </el-card>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { login } from '@/api/cloud'

const router = useRouter()
const auth = useAuthStore()
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  if (!password.value) { error.value = '请输入密码'; return }
  loading.value = true; error.value = ''
  try {
    await login(password.value)
    auth.setAdmin(true)
    router.push('/')
  } catch (e) {
    error.value = e.message || '登录失败'
  } finally { loading.value = false }
}
</script>
<style scoped>
/* ═══════════════════════════════════════════════
   ENHANCED LOGIN — Design Canvas Migration
   从设计画布迁移的管理端登录页增强样式
   ═══════════════════════════════════════════════ */

/* ---------- 背景增强 ---------- */
.login-bg {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  position: relative;
  overflow: hidden;
}

.login-bg::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(ellipse at 20% 30%, rgba(193, 154, 80, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 70%, rgba(193, 154, 80, 0.05) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

/* ---------- 登录卡片增强 ---------- */
:deep(.el-card) {
  background: linear-gradient(135deg, #ffffff 0%, #faf7f0 100%);
  border: 1px solid #f5ebd4;
  box-shadow: 0 8px 24px rgba(58, 40, 15, 0.15);
  border-radius: 16px;
}

/* ---------- 标题增强 ---------- */
h2 {
  font-family: 'Playfair Display', Georgia, serif;
  color: #c19a50;
  text-shadow: 0 2px 8px rgba(193, 154, 80, 0.2);
  font-weight: 700;
}

/* ---------- 按钮增强 ---------- */
:deep(.el-button--primary) {
  background: linear-gradient(135deg, #c19a50 0%, #a67c3c 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(193, 154, 80, 0.3);
  font-weight: 600;
  transition: all 0.2s ease;
}

:deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(193, 154, 80, 0.4);
}

:deep(.el-button--primary:active) {
  transform: scale(0.97);
}

/* ---------- 输入框增强 ---------- */
:deep(.el-input__wrapper) {
  background: linear-gradient(135deg, #faf7f0 0%, #f5ebd4 100%);
  border: 1.5px solid #e8d5a8;
  box-shadow: none;
  transition: all 0.2s ease;
}

:deep(.el-input__wrapper:focus-within) {
  border-color: #c19a50;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(193, 154, 80, 0.1);
}
</style>

