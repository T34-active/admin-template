<template>
  <div class="app-container">
    <collapsePanel v-model="showSearch">
      <div class="p-16">
        <el-form ref="queryRef" :model="queryParams" label-width="auto">
          <el-row :gutter="10">
            <QueryForm :model="queryParams" :items="items" />
          </el-row>
        </el-form>
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['monitor:job:add']"
              type="primary"
              icon="Plus"
              @click="handleAdd"
            >
              新增
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['monitor:job:edit']"
              type="success"
              icon="Edit"
              :disabled="single"
              @click="handleUpdate"
            >
              修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['monitor:job:remove']"
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
              v-hasPermi="['monitor:job:export']"
              type="warning"
              plain
              icon="Download"
              @click="handleExport"
            >
              导出
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['monitor:job:query']"
              type="info"
              icon="Operation"
              @click="handleJobLog"
            >
              日志
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
    </collapsePanel>
    <el-table v-loading="loading" :data="jobList" @selectionChange="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column label="任务编号" width="100" prop="jobId" />
      <el-table-column
        label="任务名称"
        min-width="200"
        prop="jobName"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="任务组名" min-width="100" prop="jobGroup">
        <template #default="scope">
          <dict-tag :options="sys_job_group" :value="scope.row.jobGroup" />
        </template>
      </el-table-column>
      <el-table-column
        label="调用目标字符串"
        min-width="200"
        prop="invokeTarget"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="cron执行表达式"
        min-width="200"
        prop="cronExpression"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="状态">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            active-value="0"
            inactive-value="1"
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        min-width="200"
        class-name="small-padding fixed-width"
        fixed="right"
      >
        <template #default="scope">
          <el-tooltip content="修改" placement="top">
            <el-button
              v-hasPermi="['monitor:job:edit']"
              link
              type="primary"
              icon="Edit"
              @click="handleUpdate(scope.row)"
            />
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button
              v-hasPermi="['monitor:job:remove']"
              link
              type="primary"
              icon="Delete"
              @click="handleDelete(scope.row)"
            />
          </el-tooltip>
          <el-tooltip content="执行一次" placement="top">
            <el-button
              v-hasPermi="['monitor:job:changeStatus']"
              link
              type="primary"
              icon="CaretRight"
              @click="handleRun(scope.row)"
            />
          </el-tooltip>
          <el-tooltip content="任务详细" placement="top">
            <el-button
              v-hasPermi="['monitor:job:query']"
              link
              type="primary"
              icon="View"
              @click="handleView(scope.row)"
            />
          </el-tooltip>
          <el-tooltip content="调度日志" placement="top">
            <el-button
              v-hasPermi="['monitor:job:query']"
              link
              type="primary"
              icon="Operation"
              @click="handleJobLog(scope.row)"
            />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <BottomFixed>
      <div class="flex justify-end items-center p-16">
        <pagination
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          :total="total"
          @pagination="getList"
        />
      </div>
    </BottomFixed>

    <!-- 添加或修改定时任务对话框 -->
    <el-dialog
      v-model="open"
      :title="title"
      width="800px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form ref="jobRef" :model="form" :rules="rules" label-width="auto">
        <el-row>
          <el-col :span="12">
            <el-form-item label="任务名称" prop="jobName">
              <el-input v-model="form.jobName" placeholder="请输入任务名称" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务分组" prop="jobGroup">
              <el-select v-model="form.jobGroup" placeholder="请选择任务分组" clearable>
                <el-option
                  v-for="dict in sys_job_group"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item prop="invokeTarget">
              <template #label>
                <span>
                  调用方法
                  <el-tooltip placement="top">
                    <template #content>
                      <div>
                        Bean调用示例：ryTask.ryParams('ry')
                        <br />
                        Class类调用示例：com.ruoyi.quartz.task.RyTask.ryParams('ry')
                        <br />
                        参数说明：支持字符串，布尔类型，长整型，浮点型，整型
                      </div>
                    </template>
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                </span>
              </template>
              <el-input v-model="form.invokeTarget" placeholder="请输入调用目标字符串" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="cron表达式" prop="cronExpression">
              <el-input v-model="form.cronExpression" placeholder="请输入cron执行表达式">
                <template #append>
                  <el-button type="primary" @click="handleShowCron">
                    生成表达式
                    <i class="el-icon-time el-icon--right" />
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="执行策略" prop="misfirePolicy">
              <el-radio-group v-model="form.misfirePolicy">
                <el-radio-button value="1">立即执行</el-radio-button>
                <el-radio-button value="2">执行一次</el-radio-button>
                <el-radio-button value="3">放弃执行</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否并发" prop="concurrent">
              <el-radio-group v-model="form.concurrent">
                <el-radio-button value="0">允许</el-radio-button>
                <el-radio-button value="1">禁止</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in sys_job_status" :key="dict.value" :value="dict.value">
                  {{ dict.label }}
                </el-radio>
              </el-radio-group>
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
    <el-dialog
      v-model="openCron"
      title="Cron表达式生成器"
      append-to-body
      destroy-on-close
      :close-on-click-modal="false"
    >
      <crontab
        ref="crontabRef"
        :expression="expression"
        @hide="openCron = false"
        @fill="crontabFill"
      ></crontab>
    </el-dialog>
    <!-- 任务日志详细 -->
    <el-dialog
      v-model="openView"
      title="任务详细"
      width="700px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form :model="form" label-width="auto">
        <el-row>
          <el-col :span="12">
            <el-form-item label="任务编号">{{ form.jobId }}</el-form-item>
            <el-form-item label="任务名称">{{ form.jobName }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务分组">{{ jobGroupFormat(form) }}</el-form-item>
            <el-form-item label="创建时间">{{ form.createTime }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="cron表达式">{{ form.cronExpression }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="下次执行时间">{{ parseTime(form.nextValidTime) }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="调用目标方法">{{ form.invokeTarget }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务状态">
              <div v-if="form.status === 0">正常</div>
              <div v-else-if="form.status === 1">失败</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否并发">
              <div v-if="form.concurrent === 0">允许</div>
              <div v-else-if="form.concurrent === 1">禁止</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="执行策略">
              <div v-if="form.misfirePolicy === 0">默认策略</div>
              <div v-else-if="form.misfirePolicy === 1">立即执行</div>
              <div v-else-if="form.misfirePolicy === 2">执行一次</div>
              <div v-else-if="form.misfirePolicy === 3">放弃执行</div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="openView = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {
  listJob,
  getJob,
  delJob,
  addJob,
  updateJob,
  runJob,
  changeJobStatus,
} from '@/api/monitor/job'
import { parseTime } from '@/utils/ruoyi'

import Crontab from '@/components/Crontab/index.vue'
import type { FormInstance, FormRules } from 'element-plus'

import type { QueryItemConfig } from '@/components/QueryForm/index.vue'

const router = useRouter()
const { proxy } = getCurrentInstance()
const { sys_job_group, sys_job_status } = proxy.useDict('sys_job_group', 'sys_job_status')

const jobList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref<number[]>([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')
const openView = ref(false)
const openCron = ref(false)
const expression = ref('')
const jobRef = ref<FormInstance>(null)
const data = reactive({
  form: {
    jobId: undefined,
    jobName: undefined,
    jobGroup: undefined,
    invokeTarget: undefined,
    cronExpression: undefined,
    createTime: undefined,
    nextValidTime: undefined,
    misfirePolicy: 1,
    concurrent: 1,
    status: 0,
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    jobName: undefined,
    jobGroup: undefined,
    status: undefined,
  },
  rules: {
    jobName: createRules('任务名称不能为空'),
    invokeTarget: createRules('调用目标字符串不能为空'),
    cronExpression: createRules('cron执行表达式不能为空'),
  } as FormRules,
})

const { queryParams, form, rules } = toRefs(data)

const items = ref<QueryItemConfig[]>([
  {
    label: '任务名称',
    prop: 'jobName',
    type: 'input',
    placeholder: '请输入任务名称',
  },
  {
    label: '任务组名',
    prop: 'jobGroup',
    type: 'select',
    placeholder: '请选择任务组名',
    dict: sys_job_group,
  },
  {
    label: '任务状态',
    prop: 'status',
    type: 'radio',
    placeholder: '请选择任务状态',
    dict: sys_job_status,
  },
])

/** 查询定时任务列表 */
async function getList() {
  loading.value = true
  const response = await listJob(queryParams.value)
  jobList.value = response.rows
  total.value = response.total
  loading.value = false
}

/** 任务组名字典翻译 */
function jobGroupFormat(row) {
  return proxy.selectDictLabel(sys_job_group.value, row.jobGroup)
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 表单重置 */
function reset() {
  form.value = {
    jobId: undefined,
    jobName: undefined,
    jobGroup: undefined,
    invokeTarget: undefined,
    cronExpression: undefined,
    createTime: undefined,
    nextValidTime: undefined,
    misfirePolicy: 1,
    concurrent: 1,
    status: 0,
  }
  proxy.resetForm('jobRef')
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.jobId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

// 任务状态修改
function handleStatusChange(row) {
  const text = row.status === '0' ? '启用' : '停用'
  proxy.$modal
    .confirm('确认要"' + text + '""' + row.jobName + '"任务吗？')
    .then(function () {
      return changeJobStatus(row.jobId, row.status)
    })
    .then(() => {
      proxy.$modal.msgSuccess(text + '成功')
    })
    .catch(function () {
      row.status = row.status === '0' ? '1' : '0'
    })
}

/* 立即执行一次 */
function handleRun(row) {
  proxy.$modal
    .confirm('确认要立即执行一次"' + row.jobName + '"任务吗？')
    .then(function () {
      return runJob(row.jobId, row.jobGroup)
    })
    .then(() => {
      proxy.$modal.msgSuccess('执行成功')
    })
  //   .catch(() => {});
}

/** 任务详细信息 */
async function handleView(row) {
  const response = await getJob(row.jobId)
  form.value = response.data
  openView.value = true
}

/** cron表达式按钮操作 */
function handleShowCron() {
  expression.value = form.value.cronExpression
  openCron.value = true
}

/** 确定后回传值 */
function crontabFill(value: any) {
  form.value.cronExpression = value
}

/** 任务日志列表查询 */
function handleJobLog(row) {
  const jobId = row.jobId || 0
  router.push('/monitor/job-log/index/' + jobId)
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加任务'
}

/** 修改按钮操作 */
async function handleUpdate(row) {
  reset()
  const jobId = row.jobId || ids.value
  const response = await getJob(jobId)
  form.value = response.data
  open.value = true
  title.value = '修改任务'
}

/** 提交按钮 */
async function submitForm() {
  const valid = await jobRef.value.validate()
  if (!valid) return
  if (form.value.jobId !== undefined) {
    await updateJob(form.value)
    proxy.$modal.msgSuccess('修改成功')
  } else {
    await addJob(form.value)
    proxy.$modal.msgSuccess('新增成功')
  }
  open.value = false
  await getList()
}

/** 删除按钮操作 */
function handleDelete(row) {
  const jobIds = row.jobId || ids.value
  proxy.$modal
    .confirm('是否确认删除定时任务编号为"' + jobIds + '"的数据项？')
    .then(function () {
      return delJob(jobIds)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download(
    'monitor/job/export',
    {
      ...queryParams.value,
    },
    `job_${new Date().getTime()}.xlsx`,
  )
}

onMounted(async () => {
  await getList()
})
</script>
