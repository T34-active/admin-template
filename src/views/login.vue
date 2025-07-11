<template>
  <div class="login min-h-screen bg-cover flex justify-center items-center">
    <div
      class="container w-full flex items-center lg:justify-end justify-center mx-auto duration-300 transition-all"
    >
      <el-form
        ref="loginRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form bg-white rounded-14 pb-46 px-50 pt-42"
      >
        <img src="@/assets/logo/logo.png" :alt="title" class="mx-auto pb-6px size-100px" />
        <h3 class="text-primaryText text-center text-2xl font-medium pb-31px">
          {{ title }}
        </h3>
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            type="text"
            size="large"
            auto-complete="off"
            placeholder="账号"
            clearable
          >
            <template #prefix>
              <svg-icon icon-class="user" class="el-input__icon input-icon" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            size="large"
            auto-complete="off"
            placeholder="密码"
            @keyup.enter="handleLogin"
            clearable
          >
            <template #prefix>
              <svg-icon icon-class="password" class="el-input__icon input-icon" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item v-if="captchaEnabled" prop="code">
          <div class="flex-1 flex items-center justify-between gap-x-6">
            <div>
              <el-input
                v-model="loginForm.code"
                size="large"
                auto-complete="off"
                placeholder="验证码"
                @keyup.enter="handleLogin"
              >
                <template #prefix>
                  <svg-icon icon-class="validCode" class="el-input__icon input-icon" />
                </template>
              </el-input>
            </div>
            <img
              :src="codeUrl"
              class="h-40 w-100 block bg-#D9EBFA"
              @click="getCode"
              :alt="codeUrl"
            />
          </div>
        </el-form-item>
        <el-form-item style="width: 100%">
          <el-button
            :loading="loading"
            size="large"
            type="primary"
            style="width: 100%"
            @click.prevent="handleLogin"
          >
            <span v-if="!loading">登 录</span>
            <span v-else>登 录 中...</span>
          </el-button>
          <div style="float: right" v-if="register">
            <router-link class="link-type" :to="'/register'">立即注册</router-link>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCodeImg } from '@/api/login'
import Cookies from 'js-cookie'
import { encrypt, decrypt } from '@/utils/jsencrypt'
import useUserStore from '@/store/modules/user'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { createRules } from '@/utils'

const userStore = useUserStore()
const router = useRouter()
const loginForm = ref({
  username: '',
  password: '',
  rememberMe: false,
  code: '',
  uuid: '',
})

const uuid = ref('')

const title = import.meta.env.VITE_APP_TITLE
const loginRules = ref<FormRules>({
  username: createRules('请输入您的账号'),
  password: createRules('请输入您的密码'),
  code: createRules('请输入验证码'),
})

const codeUrl = ref('')
const loading = ref(false)
// 验证码开关
const captchaEnabled = ref(true)
// 注册开关
const register = ref(false)
const redirect = ref(undefined)
const loginRef = ref<FormInstance>()

function handleLogin() {
  loginRef.value?.validate((valid) => {
    if (!valid) return
    loading.value = true
    // 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码
    if (loginForm.value.rememberMe) {
      Cookies.set('username', loginForm.value.username, {
        expires: 30,
      })
      const enPwd = encrypt(loginForm.value.password)
      if (enPwd) {
        Cookies.set('password', enPwd, { expires: 30 })
      }
      if (loginForm.value.rememberMe) {
        Cookies.set('rememberMe', String(loginForm.value.rememberMe), {
          expires: 30,
        })
      }
    } else {
      // 否则移除
      Cookies.remove('username')
      Cookies.remove('password')
      Cookies.remove('rememberMe')
    }
    // 调用action的登录方法
    loginForm.value.uuid = uuid.value
    userStore
      .login(loginForm.value)
      .then(() => {
        router.push({ path: redirect.value || '/' })
      })
      .catch(() => {
        loading.value = false
        // 重新获取验证码
        if (captchaEnabled.value) {
          getCode()
        }
      })
  })
}

async function getCode() {
  const response = await getCodeImg()
  captchaEnabled.value = response.captchaEnabled === undefined ? true : response.captchaEnabled
  if (captchaEnabled.value) {
    codeUrl.value = 'data:image/gif;base64,' + response.img
    uuid.value = response.uuid
  }
}

async function getCookie() {
  const username = Cookies.get('username')
  const password = Cookies.get('password')
  const rememberMe = Cookies.get('rememberMe')
  loginForm.value = {
    username: username === undefined ? loginForm.value.username : username,
    password: password === undefined ? loginForm.value.password : decrypt(password) || '',
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe),
  }
}

onMounted(async () => {
  await getCode()
  await getCookie()
})
</script>

<style lang="scss" scoped>
.login {
  background-image: url('@/assets/images/login-background.png');
}

.login-form {
  .el-input {
    height: 40px;

    input {
      height: 40px;
    }
  }

  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 0;
  }
}

.login-code {
  width: 33%;
  height: 40px;

  img {
    cursor: pointer;
    vertical-align: middle;
  }
}
</style>
