<template>
  <div class="login-bg">
    <el-card style="width:400px;padding:20px" shadow="xl">
      <h2 class="login-title">大喜的日子 · 管理后台</h2>
      <el-form label-position="top">
        <el-form-item label="管理员密钥">
          <el-input v-model="secret" type="password" placeholder="请输入管理密钥" show-password @keyup.enter="handleLogin" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" class="login-btn" @click="handleLogin">{{ loading ? '验证中...' : '登录 / 初始化' }}</el-button>
        </el-form-item>
      </el-form>
      <p class="login-hint">首次登录会自动绑定当前浏览器为管理员</p>
      <div v-if="error" class="login-error">{{ error }}</div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { login } from '@/api/cloud'
import { ElMessage } from 'element-plus'

const router = useRouter()
const auth = useAuthStore()
const secret = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  if (!secret.value) {
    error.value = '请输入密钥'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    await login(secret.value)
    ElMessage.success('登录成功')
    auth.setAdmin(true)
    router.push('/')
  } catch (e) {
    error.value = e.message || '登录失败'
    ElMessage.error('登录失败: ' + e.message)
  } finally {
    loading.value = false
  }
}
</script>
<style scoped>
/* ═══════════════════════════════════════════════
   ENHANCED LOGIN — Design Canvas Migration
   从设计画布迁移的管理端登录页增强样式
   ═══════════════════════════════════════════════ */

/* ---------- 背景增强 ---------- */
.login-bg {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-sidebar);
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
  background: var(--gradient-card);
  border: 1px solid var(--gold-100);
  box-shadow: 0 8px 24px rgba(58, 40, 15, 0.15);
  border-radius: 16px;
  position: relative;
  z-index: 1;
}

/* ---------- 标题增强 ---------- */
.login-title {
  text-align: center;
  margin-bottom: 24px;
  font-family: 'Playfair Display', Georgia, serif;
  color: var(--admin-accent);
  text-shadow: 0 2px 8px rgba(193, 154, 80, 0.2);
  font-weight: 700;
}

/* ---------- 按钮增强 ---------- */
.login-btn {
  width: 100%;
  background: var(--gradient-button);
  border: none;
  box-shadow: 0 4px 12px rgba(193, 154, 80, 0.3);
  font-weight: 600;
  transition: all 0.2s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(193, 154, 80, 0.4);
}

.login-btn:active {
  transform: scale(0.97);
}

/* ---------- 提示文字 ---------- */
.login-hint {
  text-align: center;
  color: var(--text-secondary);
  font-size: 12px;
  margin-top: 12px;
}

/* ---------- 错误提示 ---------- */
.login-error {
  color: var(--error);
  text-align: center;
  margin-top: 12px;
}

/* ---------- 输入框增强 ---------- */
:deep(.el-input__wrapper) {
  background: var(--gradient-input);
  border: 1.5px solid var(--gold-200);
  box-shadow: none;
  transition: all 0.2s ease;
}

:deep(.el-input__wrapper:focus-within) {
  border-color: var(--admin-accent);
  background: var(--white);
  box-shadow: 0 0 0 3px rgba(193, 154, 80, 0.1);
}
</style>

