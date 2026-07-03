<template>
  <div>
    <h2 style="margin-bottom:16px">合同管理</h2>
    <el-table :data="list" v-loading="loading" border stripe style="width:100%">
      <el-table-column prop="services" label="服务内容" width="160" />
      <el-table-column prop="client" label="客户" width="120" />
      <el-table-column :formatter="(r)=>formatDate(r.orderDate)" label="婚礼日期" width="110" />
      <el-table-column :formatter="(r)=>'¥'+Number(r.totalAmount||0).toLocaleString()" label="总金额" width="100" align="right" />
      <el-table-column :formatter="(r)=>'¥'+Number(r.paidAmount||0).toLocaleString()" label="已收" width="100" align="right" />
      <el-table-column :formatter="(r)=>'¥'+Number(r.balanceAmount||0).toLocaleString()" label="待收" width="100" align="right" />
      <el-table-column prop="paymentStatus" label="支付状态" width="90"><template #default="{row}"><el-tag :type="row.paymentStatus==='已结清'?'success':'warning'" size="small">{{row.paymentStatus}}</el-tag></template></el-table-column>
      <el-table-column :formatter="(r)=>formatDate(r.createdAt)" label="创建时间" width="120" />
    </el-table>
    <el-pagination v-if="total>pageSize" v-model:current-page="page" :total="total" :page-size="pageSize" layout="prev,pager,next" style="margin-top:16px;justify-content:center" @current-change="load" />
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'; import { callAdmin } from '@/api/cloud'; import { formatDate } from '@/utils/helpers'
const list = ref([]); const loading = ref(false); const page = ref(1); const pageSize = ref(20); const total = ref(0)
async function load() { loading.value = true; try { const r = await callAdmin('contracts:list', { page: page.value, pageSize }); list.value = r.list; total.value = r.total } catch(e){} finally { loading.value = false } }
onMounted(() => load())
</script>
<style scoped>
/* 合同页 — 通用表格样式已由 table-styles.css 提供 */
</style>
