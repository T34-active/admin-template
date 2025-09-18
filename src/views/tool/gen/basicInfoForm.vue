<template>
  <el-form ref="basicInfoForm" :model="info" :rules="rules" label-width="auto">
    <el-row :gutter="10">
      <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
        <el-form-item label="表名称" prop="tableName">
          <el-input placeholder="请输入仓库名称" v-model="info.tableName" />
        </el-form-item>
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
        <el-form-item label="表描述" prop="tableComment">
          <el-input placeholder="请输入表名称" v-model="info.tableComment" />
        </el-form-item>
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
        <el-form-item label="实体类名称" prop="className">
          <el-input placeholder="请输入实体类名称" v-model="info.className" />
        </el-form-item>
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
        <el-form-item label="作者" prop="functionAuthor">
          <el-input placeholder="请输入作者" v-model="info.functionAuthor" />
        </el-form-item>
      </el-col>
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" placeholder="请输入备注" :rows="3" v-model="info.remark" />
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script setup lang="ts">
import { createRules } from '@/utils'

defineProps({
  info: {
    type: Object,
    default: null,
  },
})

// 表单校验
const rules = ref({
  tableName: createRules('请输入表名称'),
  tableComment: createRules('请输入表描述'),
  className: createRules('请输入实体类名称'),
  functionAuthor: createRules('请输入作者'),
})
</script>
