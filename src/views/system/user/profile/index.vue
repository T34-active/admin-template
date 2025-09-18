<template>
  <div class="app-container">
    <el-row :gutter="10">
      <el-col :span="6" :xs="24">
        <el-card class="box-card">
          <template #header>
            <div class="clearfix">
              <span>个人信息</span>
            </div>
          </template>
          <div>
            <div class="text-center">
              <userAvatar :user="state.user" />
            </div>
            <ul class="list-group list-group-striped">
              <li class="list-group-item flex items-center justify-between">
                <div class="flex items-center gap-x-2">
                  <svg-icon icon-class="user" />
                  <span>用户名称</span>
                </div>
                <div class="pull-right">{{ state.user.userName }}</div>
              </li>
              <li class="list-group-item flex items-center justify-between">
                <div class="flex items-center gap-x-2">
                  <svg-icon icon-class="phone" />
                  <span>手机号码</span>
                </div>
                <div class="pull-right">{{ state.user.phonenumber }}</div>
              </li>
              <li class="list-group-item flex items-center justify-between">
                <div class="flex items-center gap-x-2">
                  <svg-icon icon-class="email" />
                  <span>用户邮箱</span>
                </div>
                <div class="pull-right">{{ state.user.email }}</div>
              </li>
              <li class="list-group-item flex items-center justify-between">
                <div class="flex items-center gap-x-2">
                  <svg-icon icon-class="tree" />
                  <span>所属部门</span>
                </div>
                <div v-if="state.user.dept" class="pull-right">
                  {{ state.user.dept.deptName }} / {{ state.postGroup }}
                </div>
              </li>
              <li class="list-group-item flex items-center justify-between">
                <div class="flex items-center gap-x-2">
                  <svg-icon icon-class="peoples" />
                  <span>所属角色</span>
                </div>
                <div class="pull-right">{{ state.roleGroup }}</div>
              </li>
              <li class="list-group-item flex items-center justify-between">
                <div class="flex items-center gap-x-2">
                  <svg-icon icon-class="date" />
                  <span>创建日期</span>
                </div>
                <div class="pull-right">{{ state.user.createTime }}</div>
              </li>
            </ul>
          </div>
        </el-card>
      </el-col>
      <el-col :span="18" :xs="24">
        <el-card>
          <template #header>
            <div class="clearfix">
              <span>基本资料</span>
            </div>
          </template>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本资料" name="userinfo">
              <userInfo :user="state.user" />
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="resetPwd">
              <resetPwd />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import userAvatar from './userAvatar.vue'
import userInfo from './userInfo.vue'
import resetPwd from './resetPwd.vue'
import { getUserProfile } from '@/api/system/user'

const activeTab = ref('userinfo')
const state = reactive({
  user: {
    userName: '',
    phonenumber: '',
    email: '',
    dept: {
      deptName: '',
    },
    createTime: '',
  },
  roleGroup: {},
  postGroup: {},
})

async function getUser() {
  const response = await getUserProfile()
  state.user = response.data
  state.roleGroup = response.roleGroup
  state.postGroup = response.postGroup
}
onMounted(async () => {
  await getUser()
})
</script>
