<template>
  <el-form size="small">
    <el-form-item>
      <el-radio v-model="radioValue" :value="1">分钟，允许的通配符[, - * /]</el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :value="2">
        周期从
        <el-input-number v-model="cycle01" :min="0" :max="58" />
        -
        <el-input-number v-model="cycle02" :min="cycle01 + 1" :max="59" />
        分钟
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :value="3">
        从
        <el-input-number v-model="average01" :min="0" :max="58" />
        分钟开始， 每
        <el-input-number v-model="average02" :min="1" :max="59 - average01" />
        分钟执行一次
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :value="4">
        指定
        <el-select
          clearable
          v-model="checkboxList"
          placeholder="可多选"
          multiple
          :multiple-limit="10"
        >
          <el-option v-for="item in 60" :key="item" :label="item - 1" :value="item - 1" />
        </el-select>
      </el-radio>
    </el-form-item>
  </el-form>
</template>
<script setup lang="ts">
const emit = defineEmits(['update'])
const props = defineProps({
  cron: {
    type: Object,
    default: () => ({
      second: '*',
      min: '*',
      hour: '*',
      day: '*',
      month: '*',
      week: '?',
      year: '',
    }),
  },
  check: {
    type: Function,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    default: () => {},
  },
})
const radioValue = ref(1)
const cycle01 = ref(0)
const cycle02 = ref(1)
const average01 = ref(0)
const average02 = ref(1)
const checkboxList = ref<number[]>([])
const checkCopy = ref([0])
const cycleTotal = computed(() => {
  cycle01.value = props.check(cycle01.value, 0, 58)
  cycle02.value = props.check(cycle02.value, cycle01.value + 1, 59)
  return cycle01.value + '-' + cycle02.value
})
const averageTotal = computed(() => {
  average01.value = props.check(average01.value, 0, 58)
  average02.value = props.check(average02.value, 1, 59 - average01.value)
  return average01.value + '/' + average02.value
})
const checkboxString = computed(() => {
  return checkboxList.value.join(',')
})
watch(
  () => props.cron.min,
  (value) => changeRadioValue(value),
)
watch([radioValue, cycleTotal, averageTotal, checkboxString], () => onRadioChange())
function changeRadioValue(value: string) {
  if (value === '*') {
    radioValue.value = 1
  } else if (value.indexOf('-') > -1) {
    const indexArr = value.split('-')
    cycle01.value = Number(indexArr[0])
    cycle02.value = Number(indexArr[1])
    radioValue.value = 2
  } else if (value.indexOf('/') > -1) {
    const indexArr = value.split('/')
    average01.value = Number(indexArr[0])
    average02.value = Number(indexArr[1])
    radioValue.value = 3
  } else {
    checkboxList.value = [...new Set(value.split(',').map((item) => Number(item)))]
    radioValue.value = 4
  }
}
function onRadioChange() {
  switch (radioValue.value) {
    case 1:
      emit('update', 'min', '*', 'min')
      break
    case 2:
      emit('update', 'min', cycleTotal.value, 'min')
      break
    case 3:
      emit('update', 'min', averageTotal.value, 'min')
      break
    case 4:
      if (checkboxList.value.length === 0) {
        checkboxList.value.push(checkCopy.value[0])
      } else {
        checkCopy.value = checkboxList.value
      }
      emit('update', 'min', checkboxString.value, 'min')
      break
  }
}
</script>

<style lang="scss" scoped>
.el-input-number--small,
.el-select,
.el-select--small {
  margin: 0 0.2rem;
}
.el-select,
.el-select--small {
  width: 19.8rem;
}
</style>
