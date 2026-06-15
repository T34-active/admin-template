<template>
  <div class="login-page" :class="{ 'is-dark': settingsStore.isDark }">
    <div class="login-bg" />
    <div class="login-grid" />
    <div class="login-orb login-orb-primary" />
    <div class="login-orb login-orb-secondary" />

    <button class="theme-switch" type="button" aria-label="切换主题" @click="toggleTheme">
      <svg-icon v-if="settingsStore.isDark" icon-class="sunny" />
      <svg-icon v-else icon-class="moon" />
    </button>

    <main class="login-shell">
      <section class="login-hero">
        <div class="brand-mark">
          <img src="@/assets/logo/logo.png" :alt="title" />
          <span>{{ title }}</span>
        </div>

        <h1>{{ title }}</h1>
        <p class="hero-desc">
          基于 Vue3 + Element Plus 构建的通用后台管理模板，提供用户、角色、菜单、字典等基础能力，开箱即用。
        </p>

        <div class="hero-tags">
          <span>用户权限管理</span>
          <span>菜单动态配置</span>
          <span>系统参数设置</span>
        </div>

        <div class="feature-list">
          <div class="feature-card">
            <span class="feature-icon"><svg-icon icon-class="user" /></span>
            <div>
              <strong>用户与角色</strong>
              <p>支持用户、部门、岗位与角色的灵活配置，满足多层级组织架构需求。</p>
            </div>
          </div>
          <div class="feature-card">
            <span class="feature-icon"><svg-icon icon-class="monitor" /></span>
            <div>
              <strong>数据可视化</strong>
              <p>内置常用管理页面与组件，快速搭建业务后台与数据展示界面。</p>
            </div>
          </div>
          <div class="feature-card">
            <span class="feature-icon"><svg-icon icon-class="lock" /></span>
            <div>
              <strong>安全可靠</strong>
              <p>集成权限校验、操作日志与登录认证，保障系统访问与数据安全。</p>
            </div>
          </div>
        </div>
      </section>

      <section class="login-panel">
        <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
          <div class="form-header">
            <img src="@/assets/logo/logo.png" :alt="title" />
            <div>
              <h2>欢迎回来</h2>
              <p>请登录您的账号继续访问系统</p>
            </div>
          </div>

          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              type="text"
              size="large"
              auto-complete="off"
              placeholder="请输入账号"
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
              placeholder="请输入密码"
              clearable
              show-password
              @keyup.enter="handleLogin"
            >
              <template #prefix>
                <svg-icon icon-class="password" class="el-input__icon input-icon" />
              </template>
            </el-input>
          </el-form-item>

          <el-form-item v-if="captchaEnabled" prop="code">
            <div class="captcha-row">
              <el-input
                v-model="loginForm.code"
                size="large"
                auto-complete="off"
                placeholder="请输入验证码"
                @keyup.enter="handleLogin"
              >
                <template #prefix>
                  <svg-icon icon-class="validCode" class="el-input__icon input-icon" />
                </template>
              </el-input>
              <button class="login-code" type="button" title="点击刷新验证码" @click="getCode">
                <img :src="codeUrl" class="login-code-img" :alt="codeUrl" />
              </button>
            </div>
          </el-form-item>

          <div class="form-options">
            <el-checkbox v-model="loginForm.rememberMe">记住密码</el-checkbox>
            <span>安全登录 · 数据加密传输</span>
          </div>

          <el-button
            :loading="loading"
            size="large"
            type="primary"
            class="login-button"
            @click.prevent="handleLogin"
          >
            {{ !loading ? '立即登录' : '登录中...' }}
          </el-button>
        </el-form>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { getCodeImg } from '@/api/login'
import Cookies from 'js-cookie'
import { encrypt, decrypt } from '@/utils/jsencrypt'
import useUserStore from '@/store/modules/user'
import useSettingsStore from '@/store/modules/settings'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { createRules } from '@/utils'
const { proxy } = getCurrentInstance()
const userStore = useUserStore()
const settingsStore = useSettingsStore()
const router = useRouter()

function toggleTheme() {
  settingsStore.toggleTheme()
}
const loginForm = ref({
  username: null,
  password: null,
  rememberMe: false,
  code: null,
  uuid: null,
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
const redirect = ref(undefined)
const loginRef = ref<FormInstance>()

async function handleLogin() {
  const valid = await proxy.$refs.loginRef.validate()
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

  try {
    await userStore.login(loginForm.value)
    await router.push({ path: redirect.value || '/' })
  } catch (e) {
    loading.value = false
    // 重新获取验证码
    if (captchaEnabled.value) {
      await getCode()
    }
  }
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
    code: null,
    uuid: null,
  }
}

onMounted(async () => {
  await Promise.all([getCode(), getCookie()])
})
</script>

<style lang="scss" scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  color: #111827;
  background:
    radial-gradient(circle at 20% 20%, rgba(64, 158, 255, 0.24), transparent 30%),
    radial-gradient(circle at 80% 20%, rgba(103, 194, 58, 0.2), transparent 26%),
    linear-gradient(135deg, #eef5ff 0%, #f7fbff 45%, #eef7f4 100%);

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url('@/assets/images/login-background.png');
    background-size: cover;
    background-position: center;
    opacity: 0.08;
    pointer-events: none;
  }
}

.login-page.is-dark {
  color: #f8fafc;
  background:
    radial-gradient(circle at 20% 20%, rgba(37, 99, 235, 0.2), transparent 32%),
    radial-gradient(circle at 80% 12%, rgba(20, 184, 166, 0.12), transparent 28%),
    linear-gradient(135deg, #050816 0%, #0f172a 48%, #111827 100%);

  &::after {
    opacity: 0.06;
  }
}

.login-bg,
.login-grid,
.login-orb {
  position: absolute;
  pointer-events: none;
}

.login-bg {
  inset: 24px;
  border: 1px solid rgba(255, 255, 255, 0.48);
  border-radius: 36px;
  background: rgba(255, 255, 255, 0.24);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.login-page.is-dark .login-bg {
  border-color: rgba(148, 163, 184, 0.12);
  background: rgba(2, 6, 23, 0.28);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.login-grid {
  inset: 0;
  opacity: 0.4;
  background-image:
    linear-gradient(rgba(64, 158, 255, 0.12) 1px, transparent 1px),
    linear-gradient(90deg, rgba(64, 158, 255, 0.12) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: linear-gradient(to bottom, transparent, #000 18%, #000 72%, transparent);
}

.login-page.is-dark .login-grid {
  opacity: 0.22;
  background-image:
    linear-gradient(rgba(96, 165, 250, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(96, 165, 250, 0.08) 1px, transparent 1px);
}

.login-orb {
  width: 280px;
  height: 280px;
  border-radius: 999px;
  filter: blur(12px);
}

.login-orb-primary {
  left: 7%;
  bottom: 8%;
  background: rgba(64, 158, 255, 0.16);
}

.login-orb-secondary {
  top: 8%;
  right: 10%;
  background: rgba(103, 194, 58, 0.14);
}

.login-page.is-dark .login-orb-primary {
  background: rgba(37, 99, 235, 0.12);
}

.login-page.is-dark .login-orb-secondary {
  background: rgba(20, 184, 166, 0.08);
}

.theme-switch {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 3;
  width: 44px;
  height: 44px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #334155;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.12);
  backdrop-filter: blur(16px);
  transition:
    transform 0.2s ease,
    background 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.92);
  }
}

.login-page.is-dark .theme-switch {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(15, 23, 42, 0.72);

  &:hover {
    background: rgba(30, 41, 59, 0.9);
  }
}

.login-shell {
  position: relative;
  z-index: 2;
  width: min(1180px, 100%);
  min-height: 640px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 430px;
  gap: 42px;
  align-items: center;
}

.login-hero {
  padding: 36px 20px;
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border: 1px solid rgba(64, 158, 255, 0.18);
  border-radius: 999px;
  color: #1d4ed8;
  background: rgba(255, 255, 255, 0.54);
  backdrop-filter: blur(16px);

  img {
    width: 34px;
    height: 34px;
  }

  span {
    font-size: 14px;
    font-weight: 600;
  }
}

.login-page.is-dark .brand-mark {
  color: #bfdbfe;
  border-color: rgba(147, 197, 253, 0.18);
  background: rgba(15, 23, 42, 0.54);
}

.login-hero h1 {
  max-width: 620px;
  margin: 34px 0 18px;
  font-size: clamp(42px, 5vw, 68px);
  line-height: 1.08;
  font-weight: 800;
  letter-spacing: -2px;
}

.hero-desc {
  max-width: 580px;
  margin: 0;
  color: #475569;
  font-size: 17px;
  line-height: 1.9;
}

.login-page.is-dark .hero-desc {
  color: #cbd5e1;
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 28px 0 34px;

  span {
    padding: 8px 12px;
    border-radius: 999px;
    color: #2563eb;
    font-size: 13px;
    background: rgba(255, 255, 255, 0.56);
    border: 1px solid rgba(37, 99, 235, 0.12);
  }
}

.login-page.is-dark .hero-tags span {
  color: #bfdbfe;
  background: rgba(15, 23, 42, 0.58);
  border-color: rgba(147, 197, 253, 0.12);
}

.feature-list {
  display: grid;
  gap: 14px;
  max-width: 590px;
}

.feature-card {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, 0.56);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.58);
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(18px);

  strong {
    display: block;
    margin-bottom: 6px;
    color: #0f172a;
    font-size: 15px;
  }

  p {
    margin: 0;
    color: #64748b;
    font-size: 13px;
    line-height: 1.7;
  }
}

.login-page.is-dark .feature-card {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(15, 23, 42, 0.52);

  strong {
    color: #f8fafc;
  }

  p {
    color: #94a3b8;
  }
}

.feature-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
  background: rgba(37, 99, 235, 0.1);
}

.login-panel {
  width: 100%;
}

.login-form {
  position: relative;
  width: 100%;
  padding: 42px;
  border: 1px solid rgba(255, 255, 255, 0.66);
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.18);
  backdrop-filter: blur(22px);

  :deep(.el-input) {
    height: 46px;
  }

  :deep(.el-input__wrapper) {
    border-radius: 14px;
    background: rgba(248, 250, 252, 0.88);
    box-shadow: 0 0 0 1px rgba(148, 163, 184, 0.18) inset;
  }

  :deep(.el-input__inner) {
    height: 46px;
  }

  .input-icon {
    width: 15px;
    height: 46px;
    margin-left: 0;
  }
}

.login-page.is-dark .login-form {
  border-color: rgba(148, 163, 184, 0.14);
  background: rgba(15, 23, 42, 0.82);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.42);

  :deep(.el-input__wrapper) {
    background: rgba(2, 6, 23, 0.58);
    box-shadow:
      0 0 0 1px rgba(148, 163, 184, 0.22) inset,
      0 10px 24px rgba(0, 0, 0, 0.16);
  }

  :deep(.el-input__wrapper.is-focus) {
    box-shadow:
      0 0 0 1px rgba(96, 165, 250, 0.85) inset,
      0 0 0 3px rgba(59, 130, 246, 0.16);
  }

  :deep(.el-input__inner) {
    color: #f8fafc;
  }

  :deep(.el-input__inner::placeholder) {
    color: #64748b;
  }

  :deep(.el-input__prefix),
  :deep(.el-input__suffix),
  :deep(.el-input__icon) {
    color: #94a3b8;
  }

  :deep(.el-checkbox__label) {
    color: #cbd5e1;
  }

  :deep(.el-checkbox__inner) {
    border-color: rgba(148, 163, 184, 0.5);
    background: rgba(2, 6, 23, 0.45);
  }

  :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary);
  }
}

.form-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;

  img {
    width: 60px;
    height: 60px;
    border-radius: 18px;
    box-shadow: 0 12px 30px rgba(64, 158, 255, 0.18);
  }

  h2 {
    margin: 0 0 6px;
    color: #0f172a;
    font-size: 28px;
    font-weight: 750;
  }

  p {
    margin: 0;
    color: #64748b;
    font-size: 14px;
  }
}

.login-page.is-dark .form-header {
  h2 {
    color: #f8fafc;
  }

  p {
    color: #94a3b8;
  }
}

.captcha-row {
  display: grid;
  width: 100%;
  grid-template-columns: minmax(0, 1fr) 128px;
  gap: 12px;
  align-items: center;
}

.login-code {
  height: 46px;
  padding: 0;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 14px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.76);
}

.login-page.is-dark .login-code {
  border-color: rgba(148, 163, 184, 0.24);
  background: rgba(2, 6, 23, 0.56);
}

.login-code-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: -2px 0 24px;
  color: #64748b;
  font-size: 13px;
}

.login-page.is-dark .form-options {
  color: #94a3b8;
}

.login-button {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 650;
  letter-spacing: 2px;
  background: linear-gradient(135deg, #1677ff, #35b6ff);
  box-shadow: 0 16px 34px rgba(22, 119, 255, 0.28);
}

@media (max-width: 1024px) {
  .login-page {
    padding: 36px;
  }

  .login-shell {
    grid-template-columns: minmax(0, 0.9fr) 410px;
    gap: 28px;
  }

  .feature-card {
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .login-page {
    padding: 28px 18px;
  }

  .login-bg {
    inset: 12px;
    border-radius: 24px;
  }

  .login-shell {
    min-height: auto;
    display: flex;
    justify-content: center;
  }

  .login-hero {
    display: none;
  }

  .login-panel {
    width: min(100%, 420px);
  }
}

@media (max-width: 480px) {
  .theme-switch {
    top: 16px;
    right: 16px;
  }

  .login-form {
    padding: 30px 22px;
    border-radius: 24px;
  }

  .form-header {
    align-items: flex-start;
    margin-bottom: 26px;

    img {
      width: 52px;
      height: 52px;
    }

    h2 {
      font-size: 24px;
    }
  }

  .captcha-row {
    grid-template-columns: 1fr;
  }

  .login-code {
    width: 100%;
  }

  .form-options {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
