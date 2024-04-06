<template>
  <div>
    <vxe-toolbar>
      <template #buttons>
        <vxe-button @click="insertEvent(-1)">在最后行插入</vxe-button>
      </template>
    </vxe-toolbar>
  </div>
  <div class="container">
    <div class="table">
      <vxe-table
          border
          show-overflow
          keep-source
          ref="xTable"
          :row-config="{isCurrent: true, isHover: true}"
          :column-config="{resizable: true}"
          :loading="loading"
          :data="tableData"
          :edit-config="{trigger: 'manual', mode: 'row', showStatus: true}">
        <vxe-column type="checkbox" width="60"></vxe-column>
        <vxe-column type="seq" width="50"></vxe-column>
        <vxe-column field="columnName" title="字段名" :edit-render="{}">
          <template #edit="{ row }: { row:RowVO}">
            <vxe-input v-model="row.columnName" type="text"></vxe-input>
          </template>
        </vxe-column>
        <vxe-column field="columnType" title="类型" :edit-render="{}">
          <template #edit="{ row }: { row:RowVO}">
            <vxe-input v-model="row.columnType" type="text" placeholder="请输入字段类型"></vxe-input>
          </template>
        </vxe-column>
        <vxe-column field="isPrimaryKey" title="主键" :edit-render="{}">
          <template #default="{ row } : { row:RowVO}">
            <span>{{ formatBoolean(row.isPrimaryKey) }}</span>
          </template>
          <template #edit="{ row } : { row:RowVO}">
            <vxe-select v-model="row.isPrimaryKey" transfer>
              <vxe-option v-for="item in booleanList" :key="item.value" :value="item.value" :label="item.label"></vxe-option>
            </vxe-select>
          </template>
        </vxe-column>
        <vxe-column field="isAutoIncrement" title="自增id" :edit-render="{}">
          <template #default="{ row } : { row:RowVO}">
            <span>{{ formatBoolean(row.isAutoIncrement) }}</span>
          </template>
          <template #edit="{ row } : { row:RowVO}">
            <vxe-select v-model="row.isAutoIncrement" transfer>
              <vxe-option v-for="item in booleanList" :key="item.value" :value="item.value" :label="item.label"></vxe-option>
            </vxe-select>
          </template>
        </vxe-column>
        <vxe-column field="length" title="长度" :edit-render="{}">
          <template #edit="{ row }: { row:RowVO}">
            <vxe-input v-model="row.length" type="text" placeholder="请输入长度"></vxe-input>
          </template>
        </vxe-column>
        <vxe-column field="nullable" title="是否为空" :edit-render="{}">
          <template #default="{ row } : { row:RowVO}">
            <span>{{ formatBoolean(row.nullable) }}</span>
          </template>
          <template #edit="{ row } : { row:RowVO}">
            <vxe-select v-model="row.nullable" transfer>
              <vxe-option v-for="item in booleanList" :key="item.value" :value="item.value" :label="item.label"></vxe-option>
            </vxe-select>
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
    <div class="sql">
      <pre><code class="language-sql line-numbers">{{sql}}</code></pre>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref,onMounted, onUpdated } from 'vue'
import { VXETable, VxeTableInstance } from 'vxe-table'
import Prism from "prismjs";

onUpdated(() => {
  Prism.highlightAll(); //修改内容后重新渲染
});

onMounted(() => {
  Prism.highlightAll(); //切换菜单重新渲染
})

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
  { id: 10003, columnName: 'Test3', columnType: 'T3', isPrimaryKey: '1', isAutoIncrement: '1', length: 1, nullable: '1', remarks: '11',  defaultValue: '123'},
  { id: 10002, columnName: 'Test2', columnType: 'T2', isPrimaryKey: '0', isAutoIncrement: '1', length: 2, nullable: '1', remarks: '11',  defaultValue: '123'},
  { id: 10004, columnName: 'Test4', columnType: 'T4', isPrimaryKey: '1', isAutoIncrement: '1', length: 1, nullable: '1', remarks: '11',  defaultValue: '123'},
  { id: 10001, columnName: 'Test1', columnType: 'T1', isPrimaryKey: '1', isAutoIncrement: '1', length: 3, nullable: '1', remarks: '11', defaultValue: '123' }
])
const booleanList = ref([
  { label: '', value: '' },
  { label: '是', value: '1' },
  { label: '否', value: '0' }
])

const sql = ref('SELECT * FROM p_sys_user')

const insertEvent = async (row?: RowVO | number) => {
  const $table = xTable.value
  if ($table) {
    const record = {
      id: 10004, columnName: 'Test5', columnType: 'T3', isPrimaryKey: '1', isAutoIncrement: '1', length: 1, nullable: '1', remarks: '11',  defaultValue: '123'
    }
    const { row: newRow } = await $table.insertAt(record, row)
    await $table.setEditCell(newRow, 'columnName')
  }
}

const formatBoolean = (value: string) => {
  if (value === '1') {
    return '是'
  }
  if (value === '0') {
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

<style scoped>
/* 容器 div */
.container {
  display: flex; /* 使用 Flex 布局实现简洁的两列布局 */
  justify-content: space-between; /* 在主轴方向上均匀分配间距，让两个子元素两端对齐 */
  width: 100%; /* 确保容器填满其父元素的宽度 */
}

/* 子 div，每个占 50% 宽度 */
.container > .table {
  flex: 0 0 55%; /* 设置flex-grow(增长比例)、flex-shrink(收缩比例)和flex-basis(基础大小)，确保固定为50%宽度 */
  box-sizing: border-box; /* 包含 padding 和 border 在计算宽度之内，避免因边距或边框导致总宽度超出100% */
}

.container > .sql {
  flex: 0 0 44%; /* 设置flex-grow(增长比例)、flex-shrink(收缩比例)和flex-basis(基础大小)，确保固定为50%宽度 */
  box-sizing: border-box; /* 包含 padding 和 border 在计算宽度之内，避免因边距或边框导致总宽度超出100% */
}
</style>