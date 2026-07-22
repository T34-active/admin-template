<template>
  <div
    class="relative min-h-screen overflow-hidden center p-48 text-[#111827] max-lg:p-36 max-md:px-18 max-md:py-28 dark:text-[#f8fafc] bg-[radial-gradient(circle_at_20%_20%,rgba(64,158,255,0.24),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(103,194,58,0.2),transparent_26%),linear-gradient(135deg,#eef5ff_0%,#f7fbff_45%,#eef7f4_100%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.2),transparent_32%),radial-gradient(circle_at_80%_12%,rgba(20,184,166,0.12),transparent_28%),linear-gradient(135deg,#050816_0%,#0f172a_48%,#111827_100%)]"
  >
    <div
      class="login-bg-image absolute inset-0 bg-cover bg-center opacity-8 pointer-events-none dark:opacity-6"
    />
    <div
      class="absolute inset-24 border border-white/48 rounded-[36px] bg-white/24 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] pointer-events-none max-md:inset-12 max-md:rounded-3xl dark:border-slate-400/12 dark:bg-slate-950/28 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
    />
    <div
      class="absolute inset-0 opacity-40 pointer-events-none dark:opacity-22 [background-image:linear-gradient(rgba(64,158,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(64,158,255,0.12)_1px,transparent_1px)] [background-size:42px_42px] [mask-image:linear-gradient(to_bottom,transparent,#000_18%,#000_72%,transparent)] dark:[background-image:linear-gradient(rgba(96,165,250,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(96,165,250,0.08)_1px,transparent_1px)]"
    />
    <div
      class="absolute w-280 h-280 rounded-full blur-[12px] pointer-events-none left-[7%] bottom-[8%] bg-[rgba(64,158,255,0.16)] dark:bg-[rgba(37,99,235,0.12)]"
    />
    <div
      class="absolute w-280 h-280 rounded-full blur-[12px] pointer-events-none top-[8%] right-[10%] bg-[rgba(103,194,58,0.14)] dark:bg-[rgba(20,184,166,0.08)]"
    />

    <button
      class="fixed top-24 right-24 z-3 size-44 border border-white/50 rounded-full center cursor-pointer text-slate-700 bg-white/72 shadow-[0_16px_40px_rgba(15,23,42,0.12)] backdrop-blur-[16px] transition-[transform,background] duration-200 hover:-translate-y-2 hover:bg-white/92 max-[480px]:top-16 max-[480px]:right-16 dark:text-white dark:border-white/12 dark:bg-slate-900/72 dark:hover:bg-slate-800/90"
      aria-label="切换主题"
      @click="toggleTheme"
    >
      <svg-icon v-if="settingsStore.isDark" icon-class="sunny" />
      <svg-icon v-else icon-class="moon" />
    </button>

    <main
      class="relative z-2 w-[min(1180px,100%)] min-h-640 grid grid-cols-[minmax(0,1fr)_430px] gap-42 items-center max-lg:grid-cols-[minmax(0,0.9fr)_410px] max-lg:gap-28 max-md:min-h-[auto] max-md:flex max-md:justify-center"
    >
      <section class="p-[36px_20px] max-md:hidden">
        <div
          class="inline-flex items-center gap-12 py-10 px-16 border border-[rgba(64,158,255,0.18)] rounded-full text-[#1d4ed8] bg-white/54 backdrop-blur-[16px] dark:text-[#bfdbfe] dark:border-[rgba(147,197,253,0.18)] dark:bg-slate-900/54"
        >
          <img class="size-34" src="@/assets/logo/logo.png" :alt="title" />
          <span class="text-14 font-semibold">{{ title }}</span>
        </div>

        <h1
          class="max-w-620 m-[34px_0_18px] text-[clamp(42px,5vw,68px)] leading-[1.08] font-extrabold tracking-[-2px]"
        >
          {{ title }}
        </h1>
        <p class="max-w-580 m-0 text-slate-600 text-17 leading-[1.9] dark:text-slate-300">
          基于 Vue3 + Element Plus 构建的通用后台管理模板，提供用户、角色、菜单、字典等基础能力，开箱即用。
        </p>

        <div class="flex flex-wrap gap-12 my-28 mb-34">
          <span
            v-for="tag in heroTags"
            :key="tag"
            class="py-8 px-12 rounded-full text-[#2563eb] text-13 bg-white/56 border border-[rgba(37,99,235,0.12)] dark:text-[#bfdbfe] dark:bg-slate-900/58 dark:border-[rgba(147,197,253,0.12)]"
          >
            {{ tag }}
          </span>
        </div>

        <div class="grid gap-14 max-w-590">
          <div
            v-for="item in featureList"
            :key="item.title"
            class="flex gap-16 items-start p-18 border border-white/56 rounded-[20px] bg-white/58 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-[18px] max-lg:p-16 dark:border-white/10 dark:bg-slate-900/52"
          >
            <span
              class="size-42 rounded-[14px] center text-[#2563eb] bg-[rgba(37,99,235,0.1)] shrink-0"
            >
              <svg-icon :icon-class="item.icon" />
            </span>
            <div>
              <strong class="block mb-6 text-slate-900 text-15 dark:text-[#f8fafc]">{{
                item.title
              }}</strong>
              <p class="m-0 text-slate-500 text-13 leading-[1.7] dark:text-slate-400">
                {{ item.desc }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="w-full max-md:w-[min(100%,420px)]">
        <el-form
          ref="loginRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form relative w-full p-42 border border-white/66 rounded-[30px] bg-white/78 shadow-[0_30px_80px_rgba(15,23,42,0.18)] backdrop-blur-[22px] max-[480px]:p-[30px_22px] max-[480px]:rounded-3xl dark:border-slate-400/14 dark:bg-slate-900/82 dark:shadow-[0_30px_80px_rgba(0,0,0,0.42)]"
        >
          <div
            class="flex items-center gap-16 mb-32 max-[480px]:items-start max-[480px]:mb-26"
          >
            <img
              class="size-60 rounded-[18px] shadow-[0_12px_30px_rgba(64,158,255,0.18)] max-[480px]:size-52"
              src="@/assets/logo/logo.png"
              :alt="title"
            />
            <div>
              <h2
                class="m-0 mb-6 text-slate-900 text-28 font-bold max-[480px]:text-24 dark:text-[#f8fafc]"
              >
                欢迎回来
              </h2>
              <p class="m-0 text-slate-500 text-14 dark:text-slate-400">
                请登录您的账号继续访问系统
              </p>
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
            <div
              class="grid w-full grid-cols-[minmax(0,1fr)_128px] gap-12 items-center max-[480px]:grid-cols-1"
            >
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
              <button
                class="h-46 p-0 overflow-hidden border border-slate-400/22 rounded-[14px] cursor-pointer bg-white/76 max-[480px]:w-full dark:border-slate-400/24 dark:bg-slate-950/56"
                title="点击刷新验证码"
                @click="getCode"
              >
                <img
                  :src="codeUrl"
                  class="block size-full object-cover"
                  :alt="codeUrl"
                />
              </button>
            </div>
          </el-form-item>

          <div
            class="flex items-center justify-between gap-12 mt-[-2px] mb-24 text-slate-500 text-13 dark:text-slate-400 max-[480px]:items-start max-[480px]:flex-col"
          >
            <el-checkbox v-model="loginForm.rememberMe">记住密码</el-checkbox>
            <span>安全登录 · 数据加密传输</span>
          </div>

          <el-button
            :loading="loading"
            size="large"
            type="primary"
            class="w-full h-48 border-none rounded-[14px] text-16 font-semibold tracking-[2px] bg-[linear-gradient(135deg,#1677ff,#35b6ff)] shadow-[0_16px_34px_rgba(22,119,255,0.28)]"
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

const heroTags = ['用户权限管理', '菜单动态配置', '系统参数设置']
const featureList = [
  {
    icon: 'user',
    title: '用户与角色',
    desc: '支持用户、部门、岗位与角色的灵活配置，满足多层级组织架构需求。',
  },
  {
    icon: 'monitor',
    title: '数据可视化',
    desc: '内置常用管理页面与组件，快速搭建业务后台与数据展示界面。',
  },
  {
    icon: 'lock',
    title: '安全可靠',
    desc: '集成权限校验、操作日志与登录认证，保障系统访问与数据安全。',
  },
]

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

<style scoped>
.login-bg-image {
  background-image: url('@/assets/images/login-background.png');
}

.login-form :deep(.el-input) {
  height: 46px;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 14px;
  background: rgba(248, 250, 252, 0.88);
  box-shadow: 0 0 0 1px rgba(148, 163, 184, 0.18) inset;
}

.login-form :deep(.el-input__inner) {
  height: 46px;
}

.login-form .input-icon {
  width: 15px;
  height: 46px;
  margin-left: 0;
}

:global(html.dark) .login-form :deep(.el-input__wrapper) {
  background: rgba(2, 6, 23, 0.58);
  box-shadow:
    0 0 0 1px rgba(148, 163, 184, 0.22) inset,
    0 10px 24px rgba(0, 0, 0, 0.16);
}

:global(html.dark) .login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow:
    0 0 0 1px rgba(96, 165, 250, 0.85) inset,
    0 0 0 3px rgba(59, 130, 246, 0.16);
}

:global(html.dark) .login-form :deep(.el-input__inner) {
  color: #f8fafc;
}

:global(html.dark) .login-form :deep(.el-input__inner::placeholder) {
  color: #64748b;
}

:global(html.dark) .login-form :deep(.el-input__prefix),
:global(html.dark) .login-form :deep(.el-input__suffix),
:global(html.dark) .login-form :deep(.el-input__icon) {
  color: #94a3b8;
}

:global(html.dark) .login-form :deep(.el-checkbox__label) {
  color: #cbd5e1;
}

:global(html.dark) .login-form :deep(.el-checkbox__inner) {
  border-color: rgba(148, 163, 184, 0.5);
  background: rgba(2, 6, 23, 0.45);
}

:global(html.dark) .login-form :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary);
}
</style>
