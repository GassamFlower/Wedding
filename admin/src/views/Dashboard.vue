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
      <el-col :span="12"><el-card shadow="hover"><div class="stat"><div class="num" style="color:#c19a50">&yen;{{data.monthIncome}}</div><div class="label">本月收入</div></div></el-card></el-col>
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
.num { font-size:32px;font-weight:700;color:#303133 }
.label { font-size:14px;color:#909399;margin-top:4px }

/* ═══════════════════════════════════════════════
   ENHANCED DASHBOARD — Design Canvas Migration
   从设计画布迁移的管理端仪表盘增强样式
   ═══════════════════════════════════════════════ */

/* ---------- 统计卡片增强 ---------- */
:deep(.el-card) {
  background: linear-gradient(135deg, #ffffff 0%, #faf7f0 100%);
  border: 1px solid #f5ebd4;
  box-shadow: 0 4px 8px rgba(58, 40, 15, 0.08);
  transition: all 0.3s ease;
}

:deep(.el-card:hover) {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(58, 40, 15, 0.12);
}

/* ---------- 统计数字增强 ---------- */
.num {
  font-family: 'Playfair Display', Georgia, serif;
  color: #c19a50;
  text-shadow: 0 2px 8px rgba(193, 154, 80, 0.15);
}

/* ---------- 快捷入口按钮增强 ---------- */
:deep(.el-button) {
  background: linear-gradient(135deg, #f5ebd4 0%, #e8d5a8 100%);
  border: 1px solid #d4b87c;
  color: #6f4e1f;
  font-weight: 600;
  transition: all 0.2s ease;
}

:deep(.el-button:hover) {
  background: linear-gradient(135deg, #e8d5a8 0%, #d4b87c 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(193, 154, 80, 0.2);
}

:deep(.el-button:active) {
  transform: scale(0.97);
}

/* ---------- 卡片头部增强 ---------- */
:deep(.el-card__header) {
  background: linear-gradient(135deg, #faf7f0 0%, #f5ebd4 100%);
  border-bottom: 1px solid #e8d5a8;
  font-weight: 700;
  color: #6f4e1f;
}
</style>

