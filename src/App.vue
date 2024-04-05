<template>
  <div>
    <vxe-table
        border
        show-overflow
        ref="xTable"
        :column-config="{resizable: true}"
        :loading="loading"
        :data="tableData"
        :edit-config="{trigger: 'manual', mode: 'row'}">
      <vxe-column type="seq" width="60"></vxe-column>
      <vxe-column field="columnName" title="字段名" :edit-render="{}">
        <template #edit="{ row }: { row:RowVO}">
          <vxe-input v-model="row.columnName" type="text"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="columnType" title="字段类型" :edit-render="{}">
        <template #edit="{ row }: { row:RowVO}">
          <vxe-input v-model="row.columnType" type="text" placeholder="请输入字段类型"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="isPrimaryKey" title="是否主键" :edit-render="{}">
        <template #default="{ row } : { row:RowVO}">
          <span>{{ formatBoolean(row.isPrimaryKey) }}</span>
        </template>
        <template #edit="{ row } : { row:RowVO}">
          <vxe-select v-model="row.isPrimaryKey" transfer>
            <vxe-option v-for="item in booleanList" :key="item.value" :value="item.value" :label="item.label"></vxe-option>
          </vxe-select>
        </template>
      </vxe-column>
      <vxe-column field="isAutoIncrement" title="是否自增id" :edit-render="{}">
        <template #edit="{ row }: { row:RowVO}">
          <vxe-input v-model="row.isAutoIncrement" type="text" placeholder="请输入是否主键"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="length" title="长度" :edit-render="{}">
        <template #edit="{ row }: { row:RowVO}">
          <vxe-input v-model="row.length" type="text" placeholder="请输入长度"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="nullable" title="是否为空" :edit-render="{}">
        <template #edit="{ row }: { row:RowVO}">
          <vxe-input v-model="row.nullable" type="text" placeholder="是否为空"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="remarks" title="备注" :edit-render="{}">
        <template #edit="{ row }: { row:RowVO}">
          <vxe-input v-model="row.remarks" type="text" placeholder="备注"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="defaultValue" title="默认值" :edit-render="{}">
        <template #edit="{ row }: { row:RowVO}">
          <vxe-input v-model="row.defaultValue" type="text" placeholder="默认值"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column title="操作" width="160">
        <template #default="{ row }">
          <template v-if="isActiveStatus(row)">
            <vxe-button @click="saveRowEvent(row)">保存</vxe-button>
            <vxe-button @click="cancelRowEvent(row)">取消</vxe-button>
          </template>
          <template v-else>
            <vxe-button @click="editRowEvent(row)">编辑</vxe-button>
          </template>
        </template>
      </vxe-column>
    </vxe-table>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { VXETable, VxeTableInstance } from 'vxe-table'

interface RowVO {
  id: number
  columnName: string
  columnType: string
  isPrimaryKey: string
  isAutoIncrement: string
  length: number
  nullable: string
  remarks: string
  defaultValue: string
}

const xTable = ref<VxeTableInstance<RowVO>>()

const loading = ref(false)
const tableData = ref<RowVO[]>([
  { id: 10003, columnName: 'Test3', columnType: 'T3', isPrimaryKey: '是',     isAutoIncrement: '0', length: 1, nullable: '11', remarks: '11',  defaultValue: '123'},
  { id: 10002, columnName: 'Test2', columnType: 'T2', isPrimaryKey: '否', isAutoIncrement: '1', length: 2, nullable: '11', remarks: '11',  defaultValue: '123'},
  { id: 10004, columnName: 'Test4', columnType: 'T4', isPrimaryKey: '是', isAutoIncrement: '1', length: 1, nullable: '11', remarks: '11',  defaultValue: '123'},
  { id: 10001, columnName: 'Test1', columnType: 'T1', isPrimaryKey: '是', isAutoIncrement: '0', length: 3, nullable: '11', remarks: '11', defaultValue: '123' }
])
const booleanList = ref([
  { label: '', value: '' },
  { label: '是', value: '1' },
  { label: '否', value: '0' }
])

const formatBoolean = (value: string) => {
  if (value === '是') {
    return '是'
  }
  if (value === '否') {
    return '否'
  }
  return ''
}

const isActiveStatus = (row: RowVO) => {
  const $table = xTable.value
  if ($table) {
    return $table.isEditByRow(row)
  }
}

const editRowEvent = (row: RowVO) => {
  const $table = xTable.value
  if ($table) {
    $table.setEditRow(row)
  }
}

const saveRowEvent = (row: RowVO) => {
  const $table = xTable.value
  if ($table) {
    $table.clearEdit().then(() => {
      loading.value = true
      setTimeout(() => {
        loading.value = false
        console.log(row)
        VXETable.modal.message({ content: `保存成功！name=${row.columnName}`, status: 'success' })
      }, 300)
    })
  }
}

const cancelRowEvent = (row: RowVO) => {
  const $table = xTable.value
  if ($table) {
    $table.clearEdit().then(() => {
      // 还原行数据
      $table.revertData(row)
    })
  }
}
</script>
