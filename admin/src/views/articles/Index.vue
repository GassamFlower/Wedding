<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <h2 style="margin:0">文章管理</h2>
      <el-button type="primary" @click="router.push('/articles/new')">+ 写文章</el-button>
    </div>
    <el-table :data="list" v-loading="loading" border stripe style="width:100%">
      <el-table-column prop="title" label="标题" min-width="200" />
      <el-table-column label="封面" width="70">
        <template #default="{row}"><el-image v-if="row.coverImage" :src="row.coverImage" style="width:40px;height:40px;object-fit:cover;border-radius:4px" /></template>
      </el-table-column>
      <el-table-column prop="author" label="作者" width="80" />
      <el-table-column label="发布" width="60"><template #default="{row}"><el-tag :type="row.published?'success':'info'" size="small">{{row.published?'已发布':'草稿'}}</el-tag></template></el-table-column>
      <el-table-column :formatter="(r)=>formatDate(r.createdAt)" label="创建时间" width="120" />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{row}">
          <el-button size="small" @click="router.push('/articles/'+row._id)">编辑</el-button>
          <el-popconfirm title="确认删除？" @confirm="remove(row._id)"><el-button size="small" type="danger">删除</el-button></el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-if="total>pageSize" v-model:current-page="page" :total="total" :page-size="pageSize" layout="prev,pager,next" style="margin-top:16px;justify-content:center" @current-change="load" />
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'; import { useRouter } from 'vue-router'; import { callAdmin } from '@/api/cloud'; import { formatDate } from '@/utils/helpers'
const router = useRouter(); const list = ref([]); const loading = ref(false); const page = ref(1); const pageSize = ref(20); const total = ref(0)
async function load() { loading.value = true; try { const r = await callAdmin('articles:list', { page: page.value, pageSize }); list.value = r.list; total.value = r.total } catch(e){} finally { loading.value = false } }
async function remove(id) { try { await callAdmin('articles:remove', { id }); load() } catch(e){} }
onMounted(() => load())
</script>
<style scoped>
/* 文章页 — 通用表格样式已由 table-styles.css 提供 */
</style>
