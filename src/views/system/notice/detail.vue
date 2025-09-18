<script setup lang="ts">
import { createRules } from '@/utils'
import type { FormInstance } from 'element-plus'
import { useRoute } from 'vue-router'
import { addNotice, getNotice, updateNotice } from '@/api/system/notice'
const { proxy } = getCurrentInstance()
const { sys_notice_type } = proxy.useDict('sys_notice_type')

const noticeRef = ref<FormInstance>(null)
const route = useRoute()
const form = ref({
  noticeId: undefined,
  noticeTitle: undefined,
  noticeType: undefined,
  noticeContent: undefined,
  status: '0',
})
const rules = ref({
  noticeTitle: createRules('公告标题不能为空'),
  noticeType: createRules('公告类型不能为空'),
})

/** 提交按钮 */
async function submitForm() {
  const valid = await noticeRef.value.validate()
  if (!valid) return
  if (form.value.noticeId !== undefined) {
    await updateNotice(form.value)
    proxy.$modal.msgSuccess('修改成功')
  } else {
    await addNotice(form.value)
    proxy.$modal.msgSuccess('新增成功')
  }
  await handleClose()
}

/** 返回按钮操作 */
async function handleClose() {
  const obj = { path: '/system/notice' }
  await proxy.$tab.closeOpenPage(obj)
}

// 表单重置
async function reset() {
  form.value = {
    noticeId: undefined,
    noticeTitle: undefined,
    noticeType: undefined,
    noticeContent: undefined,
    status: '0',
  }
  proxy.resetForm('detailsRef')
}

onMounted(async () => {
  await reset()
  if (route.query.noticeId) {
    const response = await getNotice(route.query.noticeId)
    form.value = response.data
  }
})
</script>

<template>
  <div class="app-container">
    <el-form ref="noticeRef" :model="form" :rules="rules" label-width="auto">
      <el-row :gutter="10">
        <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
          <el-form-item label="公告标题" prop="noticeTitle">
            <el-input v-model="form.noticeTitle" placeholder="请输入公告标题" clearable />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
          <el-form-item label="公告类型" prop="noticeType">
            <el-select v-model="form.noticeType" placeholder="请选择公告类型">
              <el-option
                v-for="dict in sys_notice_type"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
          <el-form-item label="正文内容" prop="content">
            <div class="pb-10">
              <el-alert
                title="富文本中的图片在官网上会自动换行独立显示。"
                type="success"
                effect="dark"
                :closable="false"
              />
            </div>
            <editor v-model="form.noticeContent" :min-height="192" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <BottomFixed>
      <div class="flex items-center justify-center p-16">
        <el-popconfirm class="box-item" title="是否提交？" placement="top" @confirm="submitForm">
          <template #reference>
            <el-button type="primary">确 定</el-button>
          </template>
        </el-popconfirm>
        <el-button @click="handleClose">返 回</el-button>
      </div>
    </BottomFixed>
  </div>
</template>
