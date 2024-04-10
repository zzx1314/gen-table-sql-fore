<template>
  <div>
    <vxe-toolbar>
      <template #buttons>
        <vxe-button status="primary" @click="insertEvent(-1)">新增一行</vxe-button>
        <vxe-button status="primary" @click="removeSelectRowEvent">删除选中</vxe-button>
        <vxe-button status="primary" @click="setDb()">设置数据库</vxe-button>
        <vxe-button type="text" icon="vxe-icon-bell-fill" :status="dbStatus" class="tip"></vxe-button>
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
          @keydown="handleKeyDown"
          @current-change="currentChangeEvent"
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
  <div>
    <vxe-modal v-model="showEdit" title="设置数据库" width="800" min-width="600" min-height="300"  resize destroy-on-close>
      <template #default>
        <vxe-form :data="formData" :rules="formRules" title-align="right" title-width="100" @submit="submitEvent">
          <vxe-form-item field="driver" title="driver" :span="12" :item-render="{}">
            <template #default="{ data }">
              <vxe-input v-model="data.driver" placeholder="请输入驱动名称"></vxe-input>
            </template>
          </vxe-form-item>
          <vxe-form-item field="url" title="url"  :span="12" :item-render="{}">
            <template #default="{ data }">
              <vxe-input v-model="data.url" placeholder="请输入url"></vxe-input>
            </template>
          </vxe-form-item>
          <vxe-form-item field="userName" title="userName" :span="12"  :item-render="{}">
            <template #default="{ data }">
              <vxe-input v-model="data.userName" placeholder="请输入用户名"></vxe-input>
            </template>
          </vxe-form-item>
          <vxe-form-item field="password" title="password"  :span="12" :item-render="{}">
            <template #default="{ data }">
              <vxe-input v-model="data.password" placeholder="请输入密码"></vxe-input>
            </template>
          </vxe-form-item>
          <vxe-form-item field="tableName" title="tableName"  :span="12" :item-render="{}">
            <template #default="{ data }">
              <vxe-input v-model="data.tableName" placeholder="请输入表名称"></vxe-input>
            </template>
          </vxe-form-item>
          <vxe-form-item field="tableComment" title="tableComment"  :span="12" :item-render="{}">
            <template #default="{ data }">
              <vxe-input v-model="data.tableComment" placeholder="请输入表备注"></vxe-input>
            </template>
          </vxe-form-item>
          <vxe-form-item align="center" title-align="left" :span="24">
            <template #default>
              <vxe-button type="submit">提交</vxe-button>
              <vxe-button type="reset">重置</vxe-button>
            </template>
          </vxe-form-item>
        </vxe-form>
      </template>
    </vxe-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref,onMounted, onUpdated,reactive } from 'vue'
import { VXETable} from 'vxe-table'
import type { VxeTableInstance } from 'vxe-table';
import type { VxeTableEvents, VxeFormPropTypes} from 'vxe-table';
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

interface httpResult {
  status: number,
  msg: string,
  data: any
}

const formData = reactive({
  driver: '',
  url: '',
  userName: '',
  password: '',
  tableName: '',
  tableComment: ''
})

const formRules = reactive<VxeFormPropTypes.Rules>({
  driver: [
    { required: true, content: '请输入驱动名称' },
  ],
  url: [
    { required: true, content: '请输入数据库url' }
  ],
  userName: [
    { required: true, content: '请输入数据库用户名' }
  ],
  password: [
    { required: true, content: '请输入数据库密码' }
  ],
  tableName: [
    { required: true, content: '请输入表名称' }
  ],
})

const xTable = ref<VxeTableInstance<RowVO>>()
const dbStatus = ref('danger')
const loading = ref(false)
const showEdit = ref(false)
const tableData = ref<RowVO[]>([
  { id: 10003, columnName: 'id', columnType: 'int', isPrimaryKey: '1', isAutoIncrement: '1', length: 11, nullable: '0', remarks: 'id',  defaultValue: ''},
  { id: 10002, columnName: 'username', columnType: 'varchar', isPrimaryKey: '0', isAutoIncrement: '0', length: 255, nullable: '0', remarks: '用户名',  defaultValue: ''},
  { id: 10004, columnName: 'password', columnType: 'varchar', isPrimaryKey: '0', isAutoIncrement: '0', length: 255, nullable: '0', remarks: '密码',  defaultValue: ''},
  { id: 10001, columnName: 'org_id', columnType: 'int', isPrimaryKey: '0', isAutoIncrement: '0', length: 14, nullable: '0', remarks: '组织ID', defaultValue: '' }
])
const booleanList = ref([
  { label: '', value: '' },
  { label: '是', value: '1' },
  { label: '否', value: '0' }
])


const sql = ref(`DROP TABLE IF EXISTS \`sys_user\`;
CREATE TABLE \`sys_user\`
(
    \`id\` int(11)  NOT NULL  AUTO_INCREMENT PRIMARY KEY COMMENT 'id'
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '用户表' ROW_FORMAT = Dynamic;`)

const selectRow = ref(0)

const currentChangeEvent: VxeTableEvents.CurrentChange<RowVO> = ({ rowIndex }) => {
  console.log(`行选中事件 ${rowIndex}`)
  selectRow.value = rowIndex
}

const submitEvent = () => {
  const $table = xTable.value
  if ($table) {
    showEdit.value = false
    dbStatus.value = "success"
    console.log(formData)
    sendPostRequest('/api/testConnection', formData).then(one =>{
      if (one.status == 200){
        VXETable.modal.message({ content: '连接成功！', status: 'success' })
      } else {
        VXETable.modal.message({ content: '设置成功', status: 'error' })
      }
    })
  }
}

const sendPostRequest = async (url: string, data: any): Promise<httpResult> => {
  const headers = {
    'Content-Type': 'application/json', // 或其他适用的 Content-Type，如 'application/x-www-form-urlencoded'
  };
  const options = {
    method: 'POST',
    headers,
    body: JSON.stringify(data), // 如果 Content-Type 为 'application/json'
    // body: new URLSearchParams(data), // 如果 Content-Type 为 'application/x-www-form-urlencoded'
  };
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error('Network response was not ok');
    const responseData = await response.json(); // 如果响应数据是 JSON 格式
    // const responseData = await response.text(); // 如果响应数据是文本或其他格式
    console.log('Response data:', responseData.status);
    return responseData;
  } catch (error) {
    console.error('Error sending POST request:', error);
    throw error; // 可选：抛出错误以在上层处理
  }
}

const handleKeyDown = (param: any) => {
  const keyCode = param.$event.keyCode;
  if (keyCode === 38 || keyCode === 40) {
    param.$event.preventDefault(); // 可选：阻止默认行为，如光标移动等
    if (keyCode === 38) {
      console.log('向上移动');
      if (selectRow.value > 0){
        let temp = tableData.value[selectRow.value]
        let crow = selectRow.value - 1
        // 元素交换位置
        tableData.value[selectRow.value] = tableData.value[crow]
        tableData.value[crow] = temp
        param.$table.loadData(tableData.value)

        param.$table.setCurrentRow(tableData.value[crow])
        selectRow.value = crow
      }
    } else {
      console.log('向下移动');
      if (selectRow.value < tableData.value.length - 1){
        let temp = tableData.value[selectRow.value]
        let crow = selectRow.value + 1
        // 元素交换位置
        tableData.value[selectRow.value] = tableData.value[crow]
        tableData.value[crow] = temp
        param.$table.loadData(tableData.value)

        param.$table.setCurrentRow(tableData.value[crow])
        selectRow.value = crow
      }
    }
  }
}

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

const removeSelectRowEvent = () => {
  const $table = xTable.value
  if ($table) {
    $table.removeCheckboxRow()
  }
}

const setDb = () => {
  showEdit.value = true
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
  overflow: auto;
}

.tip{
  font-size: 25px;
}
</style>