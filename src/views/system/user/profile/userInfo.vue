<template>
  <el-form ref="userRef" :model="user" :rules="rules" label-width="auto">
    <el-form-item label="用户昵称" prop="nickName">
      <el-input v-model="user.nickName" maxlength="30" />
    </el-form-item>
    <el-form-item label="手机号码" prop="phonenumber">
      <el-input v-model="user.phonenumber" maxlength="11" />
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="user.email" maxlength="50" />
    </el-form-item>
    <el-form-item label="性别">
      <el-radio-group v-model="user.sex">
        <el-radio value="0">男</el-radio>
        <el-radio value="1">女</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submit">保存</el-button>
      <el-button type="danger" @click="close">关闭</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { updateUserProfile } from '@/api/system/user'
import type { FormInstance, FormRules } from 'element-plus'
import { createRules } from '@/utils'

const userRef = ref<FormInstance>(null)
const props = defineProps({
  user: {
    type: Object as () => any,
  },
})

const { proxy } = getCurrentInstance()

const rules = ref<FormRules>({
  nickName: createRules('用户昵称不能为空'),
  email: [
    { required: true, message: '邮箱地址不能为空', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] },
  ],
  phonenumber: [
    { required: true, message: '手机号码不能为空', trigger: 'blur' },
    { pattern: /^1[3456789][0-9]\d{8}$/, message: '请输入正确的手机号码', trigger: 'blur' },
  ],
})

/** 提交按钮 */
async function submit() {
  const valid = await userRef.value.validate()
  if (!valid) return
  await updateUserProfile(props.user)
  proxy.$modal.msgSuccess('修改成功')
}

/** 关闭按钮 */
function close() {
  proxy.$tab.closePage()
}
</script>
