<template>
  <el-form ref="pwdRef" :model="user" :rules="rules" label-width="auto">
    <el-form-item label="旧密码" prop="oldPassword">
      <el-input
        v-model="user.oldPassword"
        placeholder="请输入旧密码"
        type="password"
        show-password
        clearable
      />
    </el-form-item>
    <el-form-item label="新密码" prop="newPassword">
      <el-input
        v-model="user.newPassword"
        placeholder="请输入新密码"
        type="password"
        show-password
        clearable
      />
    </el-form-item>
    <el-form-item label="确认密码" prop="confirmPassword">
      <el-input
        v-model="user.confirmPassword"
        placeholder="请确认新密码"
        type="password"
        show-password
        clearable
      />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submit">保存</el-button>
      <el-button type="danger" @click="close">关闭</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { updateUserPwd } from '@/api/system/user'
import type { FormInstance, FormRules } from 'element-plus'

const { proxy } = getCurrentInstance()
const pwdRef = ref<FormInstance>(null)
const user = reactive({
  oldPassword: undefined,
  newPassword: undefined,
  confirmPassword: undefined,
})

const equalToPassword = (rule, value, callback) => {
  if (user.newPassword !== value) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}
const rules = ref<FormRules>({
  oldPassword: createRules('旧密码不能为空'),
  newPassword: [
    { required: true, message: '新密码不能为空', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '确认密码不能为空', trigger: 'blur' },
    { required: true, validator: equalToPassword, trigger: 'blur' },
  ],
})

/** 提交按钮 */
async function submit() {
  const valid = await pwdRef.value.validate()
  if (!valid) return
  await updateUserPwd(user.oldPassword, user.newPassword)
  proxy.$modal.msgSuccess('修改成功')
}
/** 关闭按钮 */
function close() {
  proxy.$tab.closePage()
}
</script>
