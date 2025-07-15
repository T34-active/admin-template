<template>
  <el-card>
    <el-tabs v-model="activeName">
      <el-tab-pane label="基本信息" name="basic">
        <basic-info-form ref="basicInfo" :info="info" />
      </el-tab-pane>
      <el-tab-pane label="字段信息" name="columnInfo">
        <el-table ref="dragTable" :data="columns" row-key="columnId">
          <el-table-column label="序号" type="index" min-width="55" />
          <el-table-column
            label="字段列名"
            prop="columnName"
            min-width="150px"
            align="center"
            :show-overflow-tooltip="true"
          />
          <el-table-column label="字段描述" min-width="150px" align="center">
            <template #default="scope">
              <el-input v-model="scope.row.columnComment" />
            </template>
          </el-table-column>
          <el-table-column
            label="物理类型"
            prop="columnType"
            min-width="150px"
            align="center"
            :show-overflow-tooltip="true"
          />
          <el-table-column label="Java类型" min-width="150px" align="center">
            <template #default="scope">
              <el-select v-model="scope.row.javaType">
                <el-option
                  v-for="item in javaTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="java属性" min-width="150px" align="center">
            <template #default="scope">
              <el-input v-model="scope.row.javaField" />
            </template>
          </el-table-column>
          <el-table-column label="插入" min-width="55px" align="center">
            <template #default="scope">
              <el-checkbox true-value="1" false-value="0" v-model="scope.row.isInsert" />
            </template>
          </el-table-column>
          <el-table-column label="编辑" min-width="55px" align="center">
            <template #default="scope">
              <el-checkbox true-value="1" false-value="0" v-model="scope.row.isEdit" />
            </template>
          </el-table-column>
          <el-table-column label="列表" min-width="55px" align="center">
            <template #default="scope">
              <el-checkbox true-value="1" false-value="0" v-model="scope.row.isList" />
            </template>
          </el-table-column>
          <el-table-column label="查询" min-width="55px" align="center">
            <template #default="scope">
              <el-checkbox true-value="1" false-value="0" v-model="scope.row.isQuery" />
            </template>
          </el-table-column>
          <el-table-column label="查询方式" min-width="150px" align="center">
            <template #default="scope">
              <el-select v-model="scope.row.queryType">
                <el-option
                  v-for="item in queryTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="必填" min-width="55px" align="center">
            <template #default="scope">
              <el-checkbox true-value="1" false-value="0" v-model="scope.row.isRequired" />
            </template>
          </el-table-column>
          <el-table-column label="显示类型" min-width="150px" align="center">
            <template #default="scope">
              <el-select v-model="scope.row.htmlType">
                <el-option
                  v-for="item in htmlTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="字典类型" min-width="150px" align="center">
            <template #default="scope">
              <el-select v-model="scope.row.dictType" clearable filterable placeholder="请选择">
                <el-option
                  v-for="dict in dictOptions"
                  :key="dict.dictType"
                  :label="dict.dictName"
                  :value="dict.dictType"
                >
                  <div class="flex items-center justify-between">
                    <span>{{ dict.dictName }}</span>
                    <span class="text-[#8492a6] text-sm">
                      {{ dict.dictType }}
                    </span>
                  </div>
                </el-option>
              </el-select>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="生成信息" name="genInfo">
        <gen-info-form ref="genInfo" :info="info" :tables="tables" />
      </el-tab-pane>
    </el-tabs>
    <BottomFixed>
      <div class="flex items-center justify-center p-16">
        <el-popconfirm title="是否保存" placement="top-start" @confirm="submitForm">
          <template #reference>
            <el-button type="primary">提交</el-button>
          </template>
        </el-popconfirm>
        <el-button plain @click="close()">返回</el-button>
      </div>
    </BottomFixed>
  </el-card>
</template>

<script setup lang="ts">
import { getGenTable, updateGenTable } from '@/api/tool/gen'
import { optionselect } from '@/api/system/dict/type'
import basicInfoForm from './basicInfoForm.vue'
import genInfoForm from './genInfoForm.vue'
import { htmlTypeOptions, javaTypeOptions, queryTypeOptions } from '@/utils/column'

const route = useRoute()
const { proxy } = getCurrentInstance()

const activeName = ref('columnInfo')
const tables = ref([])
const columns = ref([])
const dictOptions = ref([])
const info = ref({})

/** 提交按钮 */
async function submitForm() {
  const basicForm = proxy.$refs.basicInfo.$refs.basicInfoForm
  const genForm = proxy.$refs.genInfo.$refs.genInfoForm
  try {
    // 并行校验表单
    const results = await Promise.all([basicForm, genForm].map(getFormPromise))
    const validateResult = results.every(Boolean)
    if (!validateResult) {
      proxy.$modal.msgError('表单校验未通过，请重新检查提交内容')
      return
    }
    const genTable = {
      ...info.value,
      columns: columns.value,
      params: {
        treeCode: info.value.treeCode,
        treeName: info.value.treeName,
        treeParentCode: info.value.treeParentCode,
        parentMenuId: info.value.parentMenuId,
      },
    }

    const res = await updateGenTable(genTable)
    proxy.$modal.msgSuccess(res.msg)
    if (res.code === 200) {
      close()
    }
  } catch (err) {
    // 捕获表单校验或接口异常
    proxy.$modal.msgError('操作失败，请重试')
    // 可选：console.error(err)
  }
}

function getFormPromise(form) {
  return new Promise((resolve) => {
    form.validate((res) => {
      resolve(res)
    })
  })
}

function close() {
  const obj = { path: '/tool/gen', query: { t: Date.now(), pageNum: route.query.pageNum } }
  proxy.$tab.closeOpenPage(obj)
}

onMounted(async () => {
  const { tableId } = route.params
  if (!tableId) return
  try {
    await fetchTableDetail(tableId)
    await fetchDictOptions()
  } catch (error) {
    console.error('加载数据失败：', error)
  }
})

// 获取表详细信息
async function fetchTableDetail(tableId: string) {
  const res = await getGenTable(tableId)
  columns.value = res.data.rows
  info.value = res.data.info
  tables.value = res.data.tables
}

// 获取字典下拉列表
async function fetchDictOptions() {
  const res = await optionselect()
  dictOptions.value = res.data
}
</script>
