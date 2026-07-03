<template>
  <div>
    <h2 style="margin-bottom:16px">{{ isEdit ? '编辑案例' : '新建案例' }}</h2>
    <el-form :model="form" label-width="100px" style="max-width:800px">
      <el-form-item label="案例标题"><el-input v-model="form.caseTitle" placeholder="如：新中式·水墨山水婚礼" /></el-form-item>
      <el-form-item label="新人姓名"><el-input v-model="form.clientName" placeholder="如：张先生 & 李女士" /></el-form-item>
      <el-row :gutter="16">
        <el-col :span="8"><el-form-item label="婚礼风格"><el-select v-model="form.style" style="width:100%"><el-option v-for="s in ['新中式','韩式','森系','欧式','复古','极简','梦幻','其他']" :key="s" :label="s" :value="s" /></el-select></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="场地类型"><el-select v-model="form.venueType" style="width:100%"><el-option v-for="s in ['室内','户外','草坪','宴会厅','其他']" :key="s" :label="s" :value="s" /></el-select></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="婚礼场地"><el-input v-model="form.venue" /></el-form-item></el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="8"><el-form-item label="预算(元)"><el-input-number v-model="form.budget" :min="0" :step="1000" style="width:100%" /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="推荐案例"><el-switch v-model="form.isFeatured" /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="排序权重"><el-input-number v-model="form.sortOrder" :min="0" style="width:100%" /></el-form-item></el-col>
      </el-row>
      <el-form-item label="案例描述"><el-input v-model="form.description" type="textarea" :rows="3" /></el-form-item>
      <el-form-item label="设计说明"><el-input v-model="form.caseDesignNotes" type="textarea" :rows="3" /></el-form-item>
      <el-form-item label="客户评价"><el-input v-model="form.clientReview" type="textarea" :rows="2" /></el-form-item>
      <el-form-item label="客户评分"><el-rate v-model="form.clientRating" :max="5" /></el-form-item>
      <el-form-item label="案例图片">
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px">
          <div v-for="(img, i) in form.caseImages" :key="i" class="img-thumb">
            <el-image :src="img" style="width:100%;height:100%;object-fit:cover" />
            <el-button size="small" circle style="position:absolute;top:2px;right:2px;padding:2px;min-height:auto" type="danger" @click="form.caseImages.splice(i,1)">✕</el-button>
          </div>
          <label class="upload-btn">
            + 添加图片
            <input type="file" accept="image/*" multiple style="display:none" @change="addImages" />
          </label>
        </div>
      </el-form-item>
      <el-form-item><el-button type="primary" :loading="saving" @click="save">{{ saving ? '保存中...' : '保存' }}</el-button><el-button @click="router.back()">取消</el-button></el-form-item>
    </el-form>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'; import { useRoute, useRouter } from 'vue-router'; import { ElMessage } from 'element-plus'; import { callAdmin } from '@/api/cloud'
const route = useRoute(); const router = useRouter()
const isEdit = computed(() => !!route.params.id)
const saving = ref(false)
const form = ref({ caseTitle:'', clientName:'', style:'', venueType:'', venue:'', budget:0, description:'', caseImages:[], caseDesignNotes:'', clientReview:'', clientRating:0, isFeatured:false, sortOrder:0 })

onMounted(async () => {
  if (isEdit.value) {
    try { const r = await callAdmin('cases:get', { id: route.params.id }); if (r) form.value = { ...form.value, ...r } } catch(e) { router.push('/cases') }
  }
})

async function save() {
  // 表单验证
  if (!form.value.caseTitle.trim()) {
    ElMessage.warning('请输入案例标题')
    return
  }
  if (!form.value.clientName.trim()) {
    ElMessage.warning('请输入新人姓名')
    return
  }
  if (!form.value.style) {
    ElMessage.warning('请选择婚礼风格')
    return
  }
  if (form.value.budget < 0) {
    ElMessage.warning('预算不能为负数')
    return
  }

  saving.value = true
  try {
    if (isEdit.value) form.value._id = route.params.id
    await callAdmin('cases:save', { data: form.value })
    ElMessage.success(isEdit.value ? '编辑成功' : '创建成功')
    router.push('/cases')
  } catch(e) {
    ElMessage.error(e.message || '保存失败')
  } finally { 
    saving.value = false 
  }
}

function addImages(e) {
  const files = Array.from(e.target.files || [])
  files.forEach(file => {
    const reader = new FileReader()
    reader.onload = (ev) => { form.value.caseImages.push(ev.target.result) }
    reader.readAsDataURL(file)
  })
  e.target.value = ''
}
</script>
<style scoped>
/* 案例表单页 — 通用表单样式已由 table-styles.css 提供 */
.img-thumb {
  position: relative;
  width: 120px;
  height: 120px;
  border: 1px solid var(--gold-100);
  border-radius: var(--radius-sm);
  overflow: hidden;
}
.upload-btn {
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: var(--gradient-input);
  border: 2px dashed var(--gold-300);
  border-radius: var(--radius-sm);
  color: var(--info);
  transition: all 0.2s ease;
}
.upload-btn:hover {
  border-color: var(--admin-accent);
  background: linear-gradient(135deg, var(--gold-100) 0%, var(--gold-200) 100%);
  transform: translateY(-2px);
  box-shadow: var(--shadow-gold);
}
</style>
