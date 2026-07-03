<template>
  <div>
    <h2 style="margin-bottom:16px">客户管理</h2>
    <el-table :data="list" v-loading="loading" border stripe style="width:100%">
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column prop="phone" label="手机号" width="130" />
      <el-table-column prop="wechat" label="微信" width="130" />
      <el-table-column prop="remark" label="备注" min-width="200" />
      <el-table-column prop="tags" label="标签" width="150"><template #default="{row}"><el-tag v-for="t in (row.tags||[])" :key="t" size="small" style="margin:1px">{{t}}</el-tag></template></el-table-column>
      <el-table-column :formatter="(r)=>formatDate(r.createdAt)" label="创建时间" width="120" />
    </el-table>
    <el-pagination v-if="total>pageSize" v-model:current-page="page" :total="total" :page-size="pageSize" layout="prev,pager,next" style="margin-top:16px;justify-content:center" @current-change="load" />
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'; import { callAdmin } from '@/api/cloud'; import { formatDate } from '@/utils/helpers'
const list = ref([]); const loading = ref(false); const page = ref(1); const pageSize = ref(20); const total = ref(0)
async function load() { loading.value = true; try { const r = await callAdmin('clients:list', { page: page.value, pageSize }); list.value = r.list; total.value = r.total } catch(e){} finally { loading.value = false } }
onMounted(() => load())
</script>
<style scoped>
/* 客户页 — 通用表格样式已由 table-styles.css 提供 */
</style>
