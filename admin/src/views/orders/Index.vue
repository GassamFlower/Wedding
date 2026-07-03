<template>
  <div>
    <h2 style="margin-bottom:16px">订单管理</h2>
    <el-table :data="list" v-loading="loading" border stripe style="width:100%">
      <el-table-column prop="clientName" label="新人" width="150" />
      <el-table-column :formatter="(r)=>formatDate(r.weddingDate)" label="婚礼日期" width="110" />
      <el-table-column prop="style" label="风格" width="80" />
      <el-table-column prop="venue" label="场地" width="120" />
      <el-table-column :formatter="(r)=>'¥'+Number(r.budget||0).toLocaleString()" label="预算" width="100" align="right" />
      <el-table-column :formatter="(r)=>'¥'+Number(r.paid||0).toLocaleString()" label="已付" width="100" align="right" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{row}"><el-tag :type="statusType(row.status)" size="small">{{row.status}}</el-tag></template>
      </el-table-column>
      <el-table-column :formatter="(r)=>r.progress+'%'" label="进度" width="70" />
      <el-table-column :formatter="(r)=>formatDate(r.createdAt)" label="创建时间" width="120" />
    </el-table>
    <el-pagination v-if="total>pageSize" v-model:current-page="page" :total="total" :page-size="pageSize" layout="prev,pager,next" style="margin-top:16px;justify-content:center" @current-change="load" />
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'; import { callAdmin } from '@/api/cloud'; import { formatDate } from '@/utils/helpers'
const list = ref([]); const loading = ref(false); const page = ref(1); const pageSize = ref(20); const total = ref(0)
function statusType(s) { if (!s) return 'info'; if (s.includes('完成')) return 'success'; if (s.includes('待')) return 'warning'; return 'primary' }
async function load() { loading.value = true; try { const r = await callAdmin('orders:list', { page: page.value, pageSize }); list.value = r.list; total.value = r.total } catch(e){} finally { loading.value = false } }
onMounted(() => load())
</script>
<style scoped>
/* 订单页 — 通用表格样式已由 table-styles.css 提供 */
</style>
