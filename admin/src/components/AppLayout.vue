<template>
  <el-container style="min-height:100vh">
    <el-aside :width="collapse ? '64px' : '220px'" style="background:#1a1a2e;transition:width 0.3s">
      <div class="logo" :style="{ padding: collapse ? '12px 8px' : '16px' }">
        <span v-if="!collapse" style="color:#c19a50;font-size:18px;font-weight:700">大喜·管理</span>
        <span v-else style="color:#c19a50;font-size:20px">⬡</span>
      </div>
      <el-menu :default-active="route.path" router :collapse="collapse" style="border-right:none;background:transparent">
        <el-menu-item index="/"><el-icon><DataBoard /></el-icon><span>仪表盘</span></el-menu-item>
        <el-menu-item index="/cases"><el-icon><Picture /></el-icon><span>案例管理</span></el-menu-item>
        <el-menu-item index="/articles"><el-icon><Document /></el-icon><span>文章管理</span></el-menu-item>
        <el-menu-item index="/images"><el-icon><Collection /></el-icon><span>图库管理</span></el-menu-item>
        <el-menu-item index="/orders"><el-icon><List /></el-icon><span>订单管理</span></el-menu-item>
        <el-menu-item index="/clients"><el-icon><User /></el-icon><span>客户管理</span></el-menu-item>
        <el-menu-item index="/hotels"><el-icon><HomeFilled /></el-icon><span>酒店管理</span></el-menu-item>
        <el-menu-item index="/props"><el-icon><Box /></el-icon><span>道具管理</span></el-menu-item>
        <el-menu-item index="/contracts"><el-icon><Tickets /></el-icon><span>合同管理</span></el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header style="background:#fff;border-bottom:1px solid #eee;display:flex;align-items:center;justify-content:space-between;padding:0 20px;height:50px">
        <el-button :icon="collapse ? 'Expand' : 'Fold'" text @click="collapse=!collapse" />
        <div><el-tag type="warning" size="small">管理后台</el-tag><el-button text type="danger" size="small" @click="logout" style="margin-left:12px">退出</el-button></div>
      </el-header>
      <el-main style="background:#f5f5f5;padding:16px"><router-view /></el-main>
    </el-container>
  </el-container>
</template>
<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
const route = useRoute(); const router = useRouter(); const auth = useAuthStore()
const collapse = ref(false)
function logout() { auth.logout(); router.push('/login') }
</script>
<style scoped>
.el-aside { overflow:hidden }
.el-menu { --el-menu-bg-color:transparent;--el-menu-text-color:rgba(255,255,255,0.75);--el-menu-active-color:#c19a50;--el-menu-hover-bg-color:rgba(201,169,110,0.15) }
.el-menu-item.is-active { background:rgba(201,169,110,0.2)!important }
.logo { text-align:center;border-bottom:1px solid rgba(255,255,255,0.08) }

/* ═══════════════════════════════════════════════
   ENHANCED APP LAYOUT — Design Canvas Migration
   从设计画布迁移的管理端布局增强样式
   ═══════════════════════════════════════════════ */

/* ---------- 侧边栏增强 ---------- */
.el-aside {
  background: linear-gradient(180deg, #1a1a2e 0%, #2d2d44 100%);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

/* ---------- Logo增强 ---------- */
.logo {
  background: linear-gradient(135deg, rgba(193, 154, 80, 0.1) 0%, rgba(193, 154, 80, 0.05) 100%);
  border-bottom: 1px solid rgba(193, 154, 80, 0.2);
}

.logo span {
  text-shadow: 0 2px 8px rgba(193, 154, 80, 0.3);
}

/* ---------- 菜单项增强 ---------- */
.el-menu-item {
  transition: all 0.2s ease;
  border-radius: 8px;
  margin: 4px 8px;
}

.el-menu-item:hover {
  background: rgba(193, 154, 80, 0.15) !important;
  transform: translateX(4px);
}

.el-menu-item.is-active {
  background: linear-gradient(135deg, rgba(193, 154, 80, 0.2) 0%, rgba(193, 154, 80, 0.1) 100%) !important;
  box-shadow: 0 2px 8px rgba(193, 154, 80, 0.2);
  font-weight: 700;
}

/* ---------- 顶部导航增强 ---------- */
.el-header {
  background: linear-gradient(135deg, #ffffff 0%, #faf7f0 100%);
  border-bottom: 1px solid #e8d5a8;
  box-shadow: 0 2px 8px rgba(58, 40, 15, 0.05);
}

/* ---------- 主内容区增强 ---------- */
.el-main {
  background: linear-gradient(135deg, #f5f5f5 0%, #faf7f0 100%);
  position: relative;
}

.el-main::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(ellipse at 20% 30%, rgba(212, 165, 150, 0.03) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 70%, rgba(193, 154, 80, 0.02) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

/* ---------- 标签增强 ---------- */
:deep(.el-tag) {
  background: linear-gradient(135deg, #f5ebd4 0%, #e8d5a8 100%);
  border: 1px solid #d4b87c;
  color: #6f4e1f;
  font-weight: 600;
}
</style>
