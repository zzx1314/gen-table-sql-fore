<template>
  <div>
    <p style="font-size: large; font-weight: bold">数据库建表工具</p>
    <vxe-toolbar>
      <template #buttons>
        <vxe-button status="primary" @click="insertEvent(-1)" icon="vxe-icon-add">新增一行</vxe-button>
        <vxe-button status="primary" @click="removeSelectRowEvent" icon="vxe-icon-delete-fill">删除选中</vxe-button>
        <vxe-button status="primary" @click="setDb()" icon="vxe-icon-setting">设置数据库</vxe-button>
        <vxe-button status="primary" @click="executeSql()" icon="vxe-icon-flag">执行SQL</vxe-button>
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
          :edit-config="{trigger: 'manual', mode: 'row',  autoClear: false, showStatus: true}">
        <vxe-column type="checkbox" width="60"></vxe-column>
        <vxe-column type="seq" width="50"></vxe-column>
        <vxe-column field="columnName" title="字段名" :edit-render="{}">
          <template #edit="{ row }: { row:RowVO}">
            <vxe-input v-model="row.columnName" type="text"></vxe-input>
          </template>
        </vxe-column>
        <vxe-column field="columnType" title="类型" width="90" :edit-render="{}">
          <template #default="{ row } : { row:RowVO}">
            <span>{{ row.columnType}}</span>
          </template>
          <template #edit="{ row } : { row:RowVO}">
            <vxe-select v-model="row.columnType" transfer @change="columnTypeChange(row)">
              <vxe-option v-for="item in sqlTypeList" :key="item.value" :value="item.value" :label="item.label"></vxe-option>
            </vxe-select>
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
          <template #default="{ row } : { row:RowVO}">
            <span>{{row.metaInfo.length}}</span>
          </template>
          <template #edit="{ row }: { row:RowVO}">
            <vxe-input v-model="row.metaInfo.length" type="number" placeholder="请输入长度"></vxe-input>
          </template>
        </vxe-column>
        <vxe-column field="nullable" title="是否为空" :edit-render="{}">
          <template #default="{ row } : { row:RowVO}">
            <span>{{ formatBoolean(row.metaInfo ? row.metaInfo.nullable : false) }}</span>
          </template>
          <template #edit="{ row } : { row:RowVO}">
            <vxe-select v-model="row.metaInfo.nullable" transfer>
              <vxe-option v-for="item in booleanList" :key="item.value" :value="item.value" :label="item.label"></vxe-option>
            </vxe-select>
          </template>
        </vxe-column>
        <vxe-column field="remarks" title="备注" :edit-render="{}">
          <template #default="{ row } : { row:RowVO}">
            <span>{{row.metaInfo.remarks}}</span>
          </template>
          <template #edit="{ row }: { row:RowVO}">
            <vxe-input @blur="translateRemarks(row)" v-model="row.metaInfo.remarks" type="text" placeholder="备注"></vxe-input>
          </template>
        </vxe-column>
        <vxe-column field="defaultValue" title="默认值" :edit-render="{}">
          <template #default="{ row } : { row:RowVO}">
            <span>{{row.metaInfo.defaultValue}}</span>
          </template>
          <template #edit="{ row }: { row:RowVO}">
            <vxe-input v-model="row.metaInfo.defaultValue" type="text" placeholder="默认值"></vxe-input>
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
          <vxe-form-item title="数据库信息" title-align="left" :title-width="200" :span="24" :title-prefix="{icon: 'vxe-icon-comment'}"></vxe-form-item>
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
          <vxe-form-item title="表信息" title-align="left" :title-width="200" :span="24" :title-prefix="{icon: 'vxe-icon-comment'}"></vxe-form-item>
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
import md5 from 'js-md5';

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
  isPrimaryKey: boolean
  isAutoIncrement: boolean
  metaInfo: {
    length: number
    nullable: boolean
    remarks: string
    defaultValue: object
  }
}
interface TableInfo {
  tableName: string,
  tableFields: Array<RowVO>,
  tableComment: string
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
const tableData = ref<RowVO[]>([])
const booleanList = ref([
  { label: '', value: '' },
  { label: '是', value: true },
  { label: '否', value: false }
])

const sqlTypeList = ref([
  { label: 'VARCHAR', value: 'VARCHAR' },
  { label: 'CHAR', value: 'CHAR' },
  { label: 'TEXT', value: 'TEXT' },
  { label: 'INTEGER', value: 'INTEGER' },
  { label: 'BIGINT', value: 'BIGINT' },
  { label: 'DECIMAL', value: 'DECIMAL' },
  { label: 'FLOAT', value: 'FLOAT' },
  { label: 'DOUBLE', value: 'DOUBLE' },
  { label: 'DATE', value: 'DATE' },
  { label: 'TIME', value: 'TIME' },
  { label: 'DATETIME', value: 'DATETIME' },
  { label: 'TIMESTAMP', value: 'TIMESTAMP' }
])

const columnTypeChange = (row: RowVO) =>{
  console.log("111",row)
  if (row.columnType == 'VARCHAR' || row.columnType == 'CHAR' || row.columnType == 'TEXT'){
    row.metaInfo.length = 255
  } else if (row.columnType == 'INTEGER' || row.columnType == 'BIGINT' || row.columnType == 'DECIMAL' || row.columnType == 'FLOAT' || row.columnType == 'DOUBLE'){
    row.metaInfo.length = 11
  }
}


const sql = ref(``)

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

const sentGetRequest = async (url: string): Promise<httpResult> => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    const responseData = await response.json(); // 如果响应数据是 JSON 格式
    return responseData;
  } catch (error) {
    console.error('Error sending POST request:', error);
    throw error; // 可选：抛出错误以在上层处理
  }
}

const handleKeyDown = (param: any) => {
  const keyCode = param.$event.keyCode;
  if (keyCode === 38 || keyCode === 40) {
    if (tableData.value.length == 0) {
      VXETable.modal.message({ content: '请先保存字段！', status: 'error' })
      return
    }
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
    let metaInfo = {
      length: 0, nullable: false, remarks: '',  defaultValue: ''
    }
    const record = {
       columnName: '', columnType: '', isPrimaryKey: false, isAutoIncrement: false, metaInfo: metaInfo
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
  // 查询一下数据库信息
  sentGetRequest('/api/getDbInfo').then(res =>{
    if (res.status == 200){
      if (res.data) {
        formData.driver = res.data.driver
        formData.url = res.data.url
        formData.userName = res.data.userName
        formData.password = res.data.password
      }
    }
  })
}

const executeSql = () =>{
  // 执行sql
  if (sql.value == ''){
    VXETable.modal.message({ content: '请先生成SQL语句！', status: 'error' })
    return
  }
  sentGetRequest('/api/execuSqlInDb').then(res =>{
    if (res.status == 200){
      VXETable.modal.message({ content: '数据库生成成功！', status: 'success' })
    } else {
      VXETable.modal.message({ content: '数据库生成失败！', status: 'error' })
    }
  })
}

const formatBoolean = (value: boolean) => {
  if (value) {
    return '是'
  }
  if (!value) {
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
      tableData.value.push(...$table.getInsertRecords())
      $table.loadData(tableData.value)
      tableData.value.forEach((item: RowVO) => {
        item.metaInfo.length = Number(item.metaInfo.length);
      })
      console.log("表格数据：",tableData.value)

      let tableInfo: TableInfo = {
        tableName: formData.tableName,
        tableFields: tableData.value,
        tableComment: formData.tableComment
      }
      if (tableInfo.tableName == '' || tableInfo.tableFields.length == 0){
        VXETable.modal.message({ content: '请先填写表名或字段！', status: 'error' })
        return
      }
      sendPostRequest('/api/genSqlTable', tableInfo).then(one =>{
        if (one.status == 200){
          sql.value = one.data
          VXETable.modal.message({ content: '生成成功！', status: 'success' })
        } else {
          VXETable.modal.message({ content: '生成失败', status: 'error' })
        }
      })
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

const translateRemarks = (row: RowVO) => {
  if (row.metaInfo.remarks){
    getEnWord(row.metaInfo.remarks, row);
  }
}

const getEnWord = (str: string, row: RowVO) => {
  let url = '/api/translateWord?word='+ str
  sentGetRequest(url).then((res : any) =>{
    console.log(res);
    if (res.data){
     row.columnName = res.data.toLowerCase().replace(/\s+/g, '_');
    }
  })
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