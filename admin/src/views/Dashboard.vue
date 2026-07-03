<template>
  <div>
    <h2 style="margin-bottom:16px">仪表盘</h2>
    <el-row :gutter="16" style="margin-bottom:16px">
      <el-col :span="6"><el-card shadow="hover"><div class="stat"><div class="num">{{data.totalOrders}}</div><div class="label">总订单</div></div></el-card></el-col>
      <el-col :span="6"><el-card shadow="hover"><div class="stat"><div class="num">{{data.monthOrders}}</div><div class="label">本月新增</div></div></el-card></el-col>
      <el-col :span="6"><el-card shadow="hover"><div class="stat"><div class="num">{{data.totalLeads}}</div><div class="label">咨询线索</div></div></el-card></el-col>
      <el-col :span="6"><el-card shadow="hover"><div class="stat"><div class="num">{{data.pendingTodos}}</div><div class="label">待办事项</div></div></el-card></el-col>
    </el-row>
    <el-row :gutter="16">
      <el-col :span="12"><el-card shadow="hover"><div class="stat"><div class="num" :style="{ color: 'var(--admin-accent)' }">&yen;{{data.monthIncome}}</div><div class="label">本月收入</div></div></el-card></el-col>
      <el-col :span="12"><el-card shadow="hover"><div class="stat"><div class="num">{{data.totalOrders}}</div><div class="label">管理项目数</div></div></el-card></el-col>
    </el-row>
    <el-card style="margin-top:16px" shadow="hover">
      <template #header><span>快捷入口</span></template>
      <el-row :gutter="16">
        <el-col :span="6" v-for="item in shortcuts" :key="item.path">
          <el-button style="width:100%;margin-bottom:12px" @click="router.push(item.path)">{{item.label}}</el-button>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { callAdmin } from '@/api/cloud'
const router = useRouter()
const data = ref({ totalOrders:0, monthOrders:0, monthIncome:0, totalLeads:0, pendingTodos:0 })
const shortcuts = [ { path:'/cases/new', label:'➕ 新建案例' }, { path:'/articles/new', label:'📝 写文章' }, { path:'/images', label:'🖼 上传图片' }, { path:'/orders', label:'📋 查看订单' } ]

onMounted(async () => {
  try {
    data.value = await callAdmin('dashboard') || data.value
  } catch(e) { /* 路由守卫已处理鉴权 */ }
})
</script>
<style scoped>
.stat { text-align:center;padding:8px }
.num { font-size:32px;font-weight:700;color:var(--primary) }
.label { font-size:14px;color:var(--text-secondary);margin-top:4px }

/* ═══════════════════════════════════════════════
   ENHANCED DASHBOARD — Design Canvas Migration
   从设计画布迁移的管理端仪表盘增强样式
   ═══════════════════════════════════════════════ */

/* ---------- 统计卡片增强 ---------- */
:deep(.el-card) {
  background: var(--gradient-card);
  border: 1px solid var(--gold-100);
  box-shadow: var(--shadow-card);
  transition: all 0.3s ease;
}

:deep(.el-card:hover) {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}

/* ---------- 统计数字增强 ---------- */
.num {
  font-family: 'Playfair Display', Georgia, serif;
  color: var(--admin-accent);
  text-shadow: 0 2px 8px rgba(193, 154, 80, 0.15);
}

/* ---------- 快捷入口按钮增强 ---------- */
:deep(.el-button) {
  background: var(--gradient-gold);
  border: 1px solid var(--gold-300);
  color: var(--gold-700);
  font-weight: 600;
  transition: all 0.2s ease;
}

:deep(.el-button:hover) {
  background: var(--gradient-gold);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(193, 154, 80, 0.2);
}

:deep(.el-button:active) {
  transform: scale(0.97);
}

/* ---------- 卡片头部增强 ---------- */
:deep(.el-card__header) {
  background: var(--gradient-card);
  border-bottom: 1px solid var(--gold-200);
  font-weight: 700;
  color: var(--gold-700);
}
</style>

