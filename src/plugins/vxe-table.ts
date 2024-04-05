import type {App} from 'vue'
import XEUtils from 'xe-utils'
import {
    VXETable,
    // 表格功能
    Filter,
    Edit,
    Menu,
    Export,
    Keyboard,
    Validator,
    // 可选组件
    Icon,
    Column,
    Colgroup,
    Grid,
    Tooltip,
    Toolbar,
    Pager,
    Form,
    FormItem,
    FormGather,
    Checkbox,
    CheckboxGroup,
    Radio,
    RadioGroup,
    RadioButton,
    Switch,
    Input,
    Select,
    Optgroup,
    Option,
    Textarea,
    Button,
    Modal,
    List,
    Pulldown,
    // 表格
    Table
} from 'vxe-table'
import 'vxe-table/styles/cssvar.scss'
import zhCNLocat from 'vxe-table/lib/locale/lang/zh-CN'

// 全局默认参数
VXETable.config({
    version: 0,
    zIndex: 100,
    table: {
        autoResize: true
    }
})

// 导入默认的国际化（如果项目中使用多语言，则应该导入到 vue-i18n 中）
VXETable.config({
    i18n: (key, args) => XEUtils.toFormatString(XEUtils.get(zhCNLocat, key), args)
})

export function useTable(app: App) {
    app.use(Filter)
        .use(Edit)
        .use(Menu)
        .use(Export)
        .use(Keyboard)
        .use(Validator)
        .use(Icon)
        .use(Column)
        .use(Colgroup)
        .use(Grid)
        .use(Tooltip)
        .use(Toolbar)
        .use(Pager)
        .use(Form)
        .use(FormItem)
        .use(FormGather)
        .use(Checkbox)
        .use(CheckboxGroup)
        .use(Radio)
        .use(RadioGroup)
        .use(RadioButton)
        .use(Switch)
        .use(Input)
        .use(Select)
        .use(Optgroup)
        .use(Option)
        .use(Textarea)
        .use(Button)
        .use(Modal)
        .use(List)
        .use(Pulldown)
        .use(Table)
}
