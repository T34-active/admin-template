<script setup lang="ts">
import { getToken } from '@/utils/auth'
import {
  changeUserStatus,
  listUser,
  resetUserPwd,
  delUser,
  getUser,
  updateUser,
  addUser,
  deptTreeSelect,
} from '@/api/system/user'

import { ElTree, type FormInstance, type FormRules } from 'element-plus'
import { createRules } from '@/utils'

import { validatePhone } from '@/utils/validate'
import QueryForm, { type QueryItemConfig } from '@/components/QueryForm/index.vue'

const router = useRouter()
const { proxy } = getCurrentInstance()

const { sys_normal_disable, sys_user_sex } = proxy.useDict('sys_normal_disable', 'sys_user_sex')
const deptTreeRef = ref<InstanceType<typeof ElTree>>()
const userRef = ref<FormInstance>(null)
const userList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref<number[]>([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')
const deptName = ref('')
const deptOptions = ref(undefined)
const initPassword = ref(undefined)
const postOptions = ref([])
const roleOptions = ref([])
/** 用户导入参数 */
const upload = reactive({
  // 是否显示弹出层（用户导入）
  open: false,
  // 弹出层标题（用户导入）
  title: '',
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的用户数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: { Authorization: 'Bearer ' + getToken() },
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_URL + '/system/user/importData',
})

const items = ref<QueryItemConfig[]>([
  {
    label: '用户名称',
    prop: 'userName',
    type: 'input',
    placeholder: '请输入用户名称',
  },
  {
    label: '手机号码',
    prop: 'phonenumber',
    type: 'input',
    placeholder: '请输入手机号码',
  },
  {
    label: '状态',
    prop: 'status',
    type: 'radio',
    dict: sys_normal_disable,
  },
  {
    label: '创建时间',
    prop: 'dateRange',
    type: 'daterange',
    startPlaceholder: '开始时间',
    endPlaceholder: '结束时间',
  },
])

const data = reactive({
  form: {
    userId: undefined,
    deptId: undefined,
    userName: undefined,
    nickName: undefined,
    password: undefined,
    phonenumber: undefined,
    email: undefined,
    sex: undefined,
    status: '0',
    remark: undefined,
    postIds: [],
    roleIds: [],
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userName: undefined,
    phonenumber: undefined,
    status: undefined,
    deptId: undefined,
    dateRange: [undefined, undefined] as [Date | string | undefined, Date | string | undefined],
  },
  rules: {
    userName: [
      { required: true, message: '用户名称不能为空', trigger: 'blur' },
      { min: 2, max: 20, message: '用户名称长度必须介于 2 和 20 之间', trigger: 'blur' },
    ],
    nickName: createRules('用户昵称不能为空'),
    password: [
      { required: true, message: '用户密码不能为空', trigger: 'blur' },
      { min: 5, max: 20, message: '用户密码长度必须介于 5 和 20 之间', trigger: 'blur' },
    ],
    email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }],
    phonenumber: [{ required: true, validator: validatePhone, trigger: 'blur' }],
  } as FormRules,
})

const { queryParams, form, rules } = toRefs(data)

/** 通过条件过滤节点  */
const filterNode = (value, data) => {
  if (!value) return true
  return data.label.indexOf(value) !== -1
}
/** 根据名称筛选部门树 */
watch(deptName, (val) => {
  deptTreeRef.value.filter(val)
})
/** 查询部门下拉树结构 */
async function getDeptTree() {
  const response = await deptTreeSelect()
  deptOptions.value = response.data
}
/** 查询用户列表 */
async function getList() {
  loading.value = true
  const safeRange: [Date | string | undefined, Date | string | undefined] =
    Array.isArray(queryParams.value.dateRange) && queryParams.value.dateRange.length === 2
      ? [queryParams.value.dateRange[0], queryParams.value.dateRange[1]]
      : [undefined, undefined]
  const response = await listUser(proxy.addDateRange(queryParams.value, safeRange))
  loading.value = false
  userList.value = response.rows
  total.value = response.total
}
/** 节点单击事件 */
function handleNodeClick(data) {
  queryParams.value.deptId = data.id
  handleQuery()
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}
/** 重置按钮操作 */
function resetQuery() {
  queryParams.value.dateRange = [null, null]
  proxy.resetForm('queryRef')
  queryParams.value.deptId = undefined
  deptTreeRef.value.setCurrentKey(null)
  handleQuery()
}
/** 删除按钮操作 */
function handleDelete(row) {
  const userIds = row.userId || ids.value
  proxy.$modal
    .confirm('是否确认删除用户编号为"' + userIds + '"的数据项？')
    .then(function () {
      return delUser(userIds)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch((e) => {
      console.log(e)
    })
}
/** 导出按钮操作 */
function handleExport() {
  proxy.download(
    'system/user/export',
    {
      ...queryParams.value,
    },
    `user_${new Date().getTime()}.xlsx`,
  )
}
/** 用户状态修改 */
function handleStatusChange(row) {
  const text = row.status === '0' ? '启用' : '停用'
  proxy.$modal
    .confirm('确认要"' + text + '""' + row.userName + '"用户吗？')
    .then(function () {
      return changeUserStatus(row.userId, row.status)
    })
    .then(() => {
      proxy.$modal.msgSuccess(text + '成功')
    })
    .catch(function () {
      row.status = row.status === '0' ? '1' : '0'
    })
}
/** 跳转角色分配 */
function handleAuthRole(row) {
  const userId = row.userId
  router.push('/system/user-auth/role/' + userId)
}
/** 重置密码按钮操作 */
function handleResetPwd(row) {
  proxy
    .$prompt('请输入"' + row.userName + '"的新密码', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      closeOnClickModal: false,
      inputPattern: /^.{5,20}$/,
      inputErrorMessage: '用户密码长度必须介于 5 和 20 之间',
    })
    .then(({ value }: any) => {
      resetUserPwd(row.userId, value).then((response) => {
        proxy.$modal.msgSuccess('修改成功，新密码是：' + value)
      })
    })
    .catch((e) => {
      console.log(e)
    })
}
/** 选择条数 */
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.userId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
/** 导入按钮操作 */
function handleImport() {
  upload.title = '用户导入'
  upload.open = true
}
/** 下载模板操作 */
function importTemplate() {
  proxy.download('system/user/importTemplate', {}, `user_template_${new Date().getTime()}.xlsx`)
}
/** 文件上传中处理 */
function handleFileUploadProgress() {
  upload.isUploading = true
}
/** 文件上传成功处理 */
async function handleFileSuccess(response, file, fileList) {
  upload.open = false
  upload.isUploading = false
  proxy.$refs.uploadRef.handleRemove(file)
  proxy.$modal.alert(
    "<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" +
      response.msg +
      '</div>',
    '导入结果',
    { dangerouslyUseHTMLString: true },
  )
  await getList()
}
/** 提交上传文件 */
function submitFileForm() {
  proxy.$refs.uploadRef.submit()
}
/** 重置操作表单 */
function reset() {
  form.value = {
    userId: undefined,
    deptId: undefined,
    userName: undefined,
    nickName: undefined,
    password: undefined,
    phonenumber: undefined,
    email: undefined,
    sex: undefined,
    status: '0',
    remark: undefined,
    postIds: [],
    roleIds: [],
  }
  proxy.resetForm('userRef')
}
/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}
/** 新增按钮操作 */
async function handleAdd() {
  reset()
  const response = await getUser('')
  postOptions.value = response.posts
  roleOptions.value = response.roles
  open.value = true
  title.value = '添加用户'
  form.value.password = initPassword.value
}
/** 修改按钮操作 */
async function handleUpdate(row) {
  reset()
  const userId = row.userId || ids.value
  const response = await getUser(userId)
  form.value = response.data
  postOptions.value = response.posts
  roleOptions.value = response.roles
  form.value.postIds = response.postIds
  form.value.roleIds = response.roleIds
  open.value = true
  title.value = '修改用户'
  form.value.password = ''
}
/** 提交按钮 */
async function submitForm() {
  try {
    const valid = await userRef.value.validate()
    if (!valid) return
    const isEdit = form.value.userId > 0
    const action = isEdit ? updateUser : addUser
    const successMsg = isEdit ? '修改成功' : '新增成功'
    await action(form.value)
    proxy.$modal.msgSuccess(successMsg)
    open.value = false
    await getList()
  } catch (error) {
    console.error('提交失败：', error)
  }
}
onMounted(async () => {
  await getDeptTree()
  await getList()
})
</script>
<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--部门数据-->
      <el-col :span="4" :xs="24" :sm="6" :md="6" :lg="4" :xl="4">
        <div class="head-container mb-2">
          <el-input
            v-model="deptName"
            placeholder="请输入部门名称"
            clearable
            prefix-icon="Search"
          />
        </div>
        <div class="head-container">
          <el-tree
            ref="deptTreeRef"
            :data="deptOptions"
            :props="{ label: 'label', children: 'children' }"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            node-key="id"
            highlight-current
            default-expand-all
            @nodeClick="handleNodeClick"
          />
        </div>
      </el-col>
      <!--用户数据-->
      <el-col :span="20" :xs="24" :sm="18" :md="18" :lg="20" :xl="20">
        <CollapsePanel v-model="showSearch">
          <div class="p-16">
            <el-form ref="queryRef" :model="queryParams" label-width="auto">
              <el-row :gutter="20">
                <QueryForm :model="queryParams" :items="items" @change="handleQuery" />
              </el-row>
            </el-form>
            <el-row :gutter="10">
              <el-col :span="1.5">
                <el-button
                  v-hasPermi="['system:user:add']"
                  type="primary"
                  plain
                  icon="Plus"
                  @click="handleAdd"
                >
                  新增
                </el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button
                  v-hasPermi="['system:user:edit']"
                  type="success"
                  plain
                  icon="Edit"
                  :disabled="single"
                  @click="handleUpdate"
                >
                  修改
                </el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button
                  v-hasPermi="['system:user:remove']"
                  type="danger"
                  plain
                  icon="Delete"
                  :disabled="multiple"
                  @click="handleDelete"
                >
                  删除
                </el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button
                  v-hasPermi="['system:user:import']"
                  type="info"
                  plain
                  icon="Upload"
                  @click="handleImport"
                >
                  导入
                </el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button
                  v-hasPermi="['system:user:export']"
                  type="warning"
                  plain
                  icon="Download"
                  @click="handleExport"
                >
                  导出
                </el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              </el-col>
            </el-row>
          </div>
        </CollapsePanel>
        <el-table v-loading="loading" :data="userList" @selectionChange="handleSelectionChange">
          <el-table-column type="selection" width="50" />
          <el-table-column key="userId" label="用户编号" prop="userId" />
          <el-table-column
            key="userName"
            label="用户名称"
            prop="userName"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            key="nickName"
            label="用户昵称"
            prop="nickName"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            key="deptName"
            label="部门"
            prop="dept.deptName"
            :show-overflow-tooltip="true"
          />
          <el-table-column key="phonenumber" label="手机号码" prop="phonenumber" width="120" />
          <el-table-column key="status" label="状态" min-width="80">
            <template #default="scope">
              <el-switch
                v-model="scope.row.status"
                active-value="0"
                inactive-value="1"
                @change="handleStatusChange(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="创建时间" prop="createTime" min-width="160" />
          <el-table-column
            label="操作"
            min-width="150"
            class-name="small-padding fixed-width"
            fixed="right"
          >
            <template #default="scope">
              <el-tooltip v-if="scope.row.userId !== 1" content="修改" placement="top">
                <el-button
                  v-hasPermi="['system:user:edit']"
                  link
                  type="primary"
                  icon="Edit"
                  @click="handleUpdate(scope.row)"
                />
              </el-tooltip>
              <el-tooltip v-if="scope.row.userId !== 1" content="删除" placement="top">
                <el-button
                  v-hasPermi="['system:user:remove']"
                  link
                  type="primary"
                  icon="Delete"
                  @click="handleDelete(scope.row)"
                />
              </el-tooltip>
              <el-tooltip v-if="scope.row.userId !== 1" content="重置密码" placement="top">
                <el-button
                  v-hasPermi="['system:user:resetPwd']"
                  link
                  type="primary"
                  icon="Key"
                  @click="handleResetPwd(scope.row)"
                />
              </el-tooltip>
              <el-tooltip v-if="scope.row.userId !== 1" content="分配角色" placement="top">
                <el-button
                  v-hasPermi="['system:user:edit']"
                  link
                  type="primary"
                  icon="CircleCheck"
                  @click="handleAuthRole(scope.row)"
                />
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
        <BottomFixed>
          <div class="flex items-center justify-end p-16">
            <pagination
              :total="total"
              v-model:page="queryParams.pageNum"
              v-model:limit="queryParams.pageSize"
              @pagination="getList"
            />
          </div>
        </BottomFixed>
      </el-col>
    </el-row>
    <!-- 添加或修改用户配置对话框 -->
    <el-dialog
      v-model="open"
      :title="title"
      width="650px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form ref="userRef" :model="form" :rules="rules" label-width="auto">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="归属部门" prop="deptId">
              <el-tree-select
                v-model="form.deptId"
                :data="deptOptions"
                :props="{ value: 'id', label: 'label', children: 'children' }"
                value-key="id"
                placeholder="请选择归属部门"
                check-strictly
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户昵称" prop="nickName">
              <el-input v-model="form.nickName" placeholder="请输入用户昵称" maxlength="30" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="手机号码" prop="phonenumber">
              <el-input
                v-model="form.phonenumber"
                placeholder="请输入手机号码"
                maxlength="11"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.userId === undefined" label="用户名称" prop="userName">
              <el-input v-model="form.userName" placeholder="请输入用户名称" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.userId === undefined" label="用户密码" prop="password">
              <el-input
                v-model="form.password"
                placeholder="请输入用户密码"
                type="password"
                maxlength="20"
                show-password
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户性别">
              <el-select v-model="form.sex" placeholder="请选择">
                <el-option
                  v-for="dict in sys_user_sex"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">
                  {{ dict.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="岗位">
              <el-select v-model="form.postIds" multiple placeholder="请选择岗位">
                <el-option
                  v-for="item in postOptions"
                  :key="item.postId"
                  :label="item.postName"
                  :value="item.postId"
                  :disabled="item.status === 1"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色">
              <el-select v-model="form.roleIds" multiple placeholder="请选择角色">
                <el-option
                  v-for="item in roleOptions"
                  :key="item.roleId"
                  :label="item.roleName"
                  :value="item.roleId"
                  :disabled="item.status === 1"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 用户导入对话框 -->
    <el-dialog
      v-model="upload.open"
      :title="upload.title"
      width="400px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-upload
        ref="uploadRef"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <el-icon class="el-icon--upload">
          <upload-filled />
        </el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或
          <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip text-center">
            <div class="el-upload__tip">
              <el-checkbox v-model="upload.updateSupport" />
              是否更新已经存在的用户数据
            </div>
            <span>仅允许导入xls、xlsx格式文件。</span>
            <el-link
              type="primary"
              underline="always"
              style="font-size: 12px; vertical-align: baseline"
              @click="importTemplate"
            >
              下载模板
            </el-link>
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitFileForm">确 定</el-button>
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
