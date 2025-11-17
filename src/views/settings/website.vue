<script setup lang="ts">
import Sidebar from './sidebar.vue'
import type {
  NavCustomWebsiteBo,
  NavCustomWebsiteQuery,
  NavCustomWebsiteVo,
  NavCustomCategoryVo,
} from '@/api/nav/types.ts'
import {
  navCustomWebsitePageApi,
  navCustomWebsiteDetailApi,
  navCustomWebsiteSaveApi,
  navCustomWebsiteUpdateApi,
  navCustomWebsiteDeleteApi,
  navCustomCategoryTreeApi,
  navCrawlerWebsiteApi,
} from '@/api/nav'
import { ElMessage, ElMessageBox } from 'element-plus'

const { pagination, getParams, onSizeChange, onCurrentChange } = usePagination()
const loading = ref(false)
const dataList = ref<NavCustomWebsiteVo[]>([])
const categoryTreeData = ref<any[]>([])

const search = reactive<PageQuery<NavCustomWebsiteQuery>>({
  query: {
    name: '',
    categoryId: '',
  },
})

// 树形选择器配置
const treeProps = {
  value: 'id',
  label: 'name',
  children: 'children',
}

// 表单相关
const dialogVisible = ref(false)
const dialogTitle = ref('新增网站')
const formRef = ref<InstanceType<typeof ElForm> | null>(null)
const formData = ref<NavCustomWebsiteBo>({
  name: '',
  url: '',
  icon: '',
  categoryId: '',
  sort: 0,
})
const crawlerLoading = ref(false)

// 判断是否为URL
const isUrl = (value?: string) => {
  if (!value) return false
  return /^https?:\/\//.test(value)
}

const formRules = {
  name: [{ required: true, message: '请输入网站名称', trigger: 'blur' }],
  url: [
    { required: true, message: '请输入网站地址', trigger: 'blur' },
    {
      pattern: /^https?:\/\/.+/,
      message: '请输入正确的网址（以http://或https://开头）',
      trigger: 'blur',
    },
  ],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
}

// 提取API数据
const extractApiData = (response: any): any[] | null => {
  if (Array.isArray(response)) {
    return response
  }
  if (response?.data && Array.isArray(response.data)) {
    return response.data
  }
  if (response?.data) {
    return Array.isArray(response.data) ? response.data : null
  }
  return null
}

// 将接口返回的数据转换为树形选择器需要的格式
const convertToTreeSelectData = (apiNodes: any[]): any[] => {
  return apiNodes.map((node) => {
    // 处理 metadata 结构
    const categoryData = node.metadata || node

    const treeNode: any = {
      id: categoryData.id,
      name: categoryData.name,
      icon: categoryData.icon,
    }

    if (node.children && Array.isArray(node.children) && node.children.length > 0) {
      treeNode.children = convertToTreeSelectData(node.children)
    }

    return treeNode
  })
}

// 加载分类树
const loadCategoryTree = async () => {
  try {
    const response = await navCustomCategoryTreeApi({})
    const data = extractApiData(response) || []
    categoryTreeData.value = convertToTreeSelectData(data)
  } catch (error) {
    console.error('加载分类树失败:', error)
  }
}

// 加载网站列表
const loadWebsiteList = async () => {
  loading.value = true
  try {
    Object.assign(search, getParams())
    const response = await navCustomWebsitePageApi(search)
    dataList.value = response.data.rows || []
    pagination.value.total = Number(response.data.total || 0)
  } catch (error) {
    console.error('加载网站列表失败:', error)
    ElMessage.error('加载网站列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.value.pageNum = 1
  loadWebsiteList()
}

// 重置搜索
const handleReset = () => {
  search.query = {
    name: '',
    categoryId: '',
  }
  pagination.value.pageNum = 1
  loadWebsiteList()
}

// 每页数量切换
const sizeChange = (size: number) => {
  onSizeChange(size).then(() => loadWebsiteList())
}

// 当前页码切换（翻页）
const currentChange = (page = 1) => {
  onCurrentChange(page).then(() => loadWebsiteList())
}

// 打开新增对话框
const handleAdd = () => {
  dialogTitle.value = '新增网站'
  formData.value = {
    name: '',
    url: '',
    icon: '',
    categoryId: search.query?.categoryId || '',
    sort: 0,
  }
  dialogVisible.value = true
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

// 打开编辑对话框
const handleEdit = async (row: NavCustomWebsiteVo) => {
  if (!row.id) return

  try {
    const response = await navCustomWebsiteDetailApi(row.id)
    const data = response.data

    dialogTitle.value = '编辑网站'
    formData.value = {
      id: data.id,
      name: data.name || '',
      url: data.url || '',
      icon: data.icon || '',
      categoryId: data.categoryId || '',
      sort: data.sort || 0,
    }
    dialogVisible.value = true
    nextTick(() => {
      formRef.value?.clearValidate()
    })
  } catch (error) {
    console.error('获取网站详情失败:', error)
    ElMessage.error('获取网站详情失败')
  }
}

// 删除网站
const handleDelete = async (row: NavCustomWebsiteVo) => {
  if (!row.id) return

  try {
    await ElMessageBox.confirm(
      `确定要删除网站"${row.name}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const response = await navCustomWebsiteDeleteApi([row.id])
    if (response.data) {
      ElMessage.success('删除成功')
      await loadWebsiteList()
    } else {
      ElMessage.error('删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除网站失败:', error)
      ElMessage.error('删除网站失败')
    }
  }
}

// 保存表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (formData.value.id) {
          // 更新
          const response = await navCustomWebsiteUpdateApi(formData.value)
          if (response.data) {
            ElMessage.success('更新成功')
            dialogVisible.value = false
            await loadWebsiteList()
          } else {
            ElMessage.error('更新失败')
          }
        } else {
          // 新增
          const response = await navCustomWebsiteSaveApi(formData.value)
          if (response.data) {
            ElMessage.success('新增成功')
            dialogVisible.value = false
            await loadWebsiteList()
          } else {
            ElMessage.error('新增失败')
          }
        }
      } catch (error) {
        console.error('保存网站失败:', error)
        ElMessage.error('保存网站失败')
      }
    }
  })
}

// 取消表单
const handleCancel = () => {
  dialogVisible.value = false
  formData.value = {
    name: '',
    url: '',
    icon: '',
    categoryId: '',
    sort: 0,
  }
}

// 抓取网站信息
const handleCrawler = async () => {
  if (!formData.value.url) {
    ElMessage.warning('请先输入网站地址')
    return
  }

  crawlerLoading.value = true
  try {
    const { data } = await navCrawlerWebsiteApi(formData.value.url)
    if (data) {
      if (data.title) {
        formData.value.name = data.title
      }
      if (data.favicon) {
        formData.value.icon = data.favicon
      }
      ElMessage.success('抓取成功')
    } else {
      ElMessage.warning('未获取到网站信息')
    }
  } catch (error) {
    console.error('抓取网站信息失败:', error)
    ElMessage.error('抓取网站信息失败')
  } finally {
    crawlerLoading.value = false
  }
}

// 获取分类名称（从树形数据中查找）
const getCategoryName = (categoryId?: string): string => {
  if (!categoryId) return '-'

  const findNode = (nodes: any[]): any | null => {
    for (const node of nodes) {
      if (node.id === categoryId) {
        return node
      }
      if (node.children && node.children.length > 0) {
        const found = findNode(node.children)
        if (found) {
          return found
        }
      }
    }
    return null
  }

  const node = findNode(categoryTreeData.value)
  return node?.name || '-'
}

onMounted(() => {
  loadCategoryTree()
  loadWebsiteList()
})
</script>

<template>
  <div class="website-container">
    <div class="website-layout">
      <!-- 侧边栏 -->
      <div class="sidebar-section">
        <Sidebar />
      </div>

      <!-- 主内容区 -->
      <div class="main-content">
      <div class="table-section">
          <div class="table-container">
            <div class="table-header">
              <div>
                <h3 class="table-title">网站管理</h3>
                <p class="table-subtitle">管理您的自定义网站</p>
              </div>
              <el-button type="primary" @click="handleAdd()">
                <template #icon>
                  <FaIcon name="i-ep:plus" />
                </template>
                新增网站
              </el-button>
            </div>
            <ElDivider border-style="dashed" />

            <!-- 搜索区域 -->
            <div class="search-section">
              <el-form :model="search.query" size="default" inline class="search-form">
                <el-form-item label="网站名称：">
                  <el-input
                    v-model="search.query.name"
                    placeholder="请输入网站名称"
                    clearable
                    style="width: 200px"
                    @keyup.enter="handleSearch"
                  />
                </el-form-item>
                <el-form-item label="分类：">
                  <el-tree-select
                    v-model="search.query.categoryId"
                    :data="categoryTreeData"
                    :props="treeProps"
                    placeholder="请选择分类"
                    clearable
                    style="width: 200px"
                    check-strictly
                  />
                </el-form-item>
                <el-form-item>
                  <el-button @click="handleReset" class="reset-btn">
                    重置
                  </el-button>
                  <el-button type="primary" @click="handleSearch" class="search-btn">
                    <template #icon>
                      <FaIcon name="i-ep:search" />
                    </template>
                    筛选
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
            <ElDivider border-style="dashed" />

            <!-- 表格区域 -->
            <div class="table-wrapper">
              <el-table
                v-loading="loading"
                :data="dataList"
                stripe
                border
                empty-text="暂无网站数据"
                style="width: 100%"
                size="small"
                header-align="center"
              >
                <el-table-column prop="name" label="网站名称" min-width="150" align="center" />
                <el-table-column prop="url" label="网站地址" min-width="200" align="center">
                  <template #default="{ row }">
                    <el-link :href="row.url" target="_blank" type="primary">
                      {{ row.url }}
                    </el-link>
                  </template>
                </el-table-column>
                <el-table-column prop="categoryId" label="所属分类" min-width="120" align="center">
                  <template #default="{ row }">
                    {{ getCategoryName(row.categoryId) }}
                  </template>
                </el-table-column>
                <el-table-column prop="icon" label="图标" width="120" align="center">
                  <template #default="{ row }">
                    <template v-if="row.icon">
                      <img
                        v-if="isUrl(row.icon)"
                        :src="row.icon"
                        alt="icon"
                        class="website-icon-img"
                      />
                      <FaIcon v-else :name="row.icon" class="website-icon" />
                    </template>
                    <span v-else>-</span>
                  </template>
                </el-table-column>
                <el-table-column prop="sort" label="排序" width="80" align="center" />
                <el-table-column label="操作" width="180" align="center" fixed="right">
                  <template #default="{ row }">
                    <el-button
                      link
                      type="primary"
                      size="small"
                      @click="handleEdit(row)"
                    >
                      <template #icon>
                        <FaIcon name="i-ep:edit" />
                      </template>
                      编辑
                    </el-button>
                    <el-button
                      link
                      type="danger"
                      size="small"
                      @click="handleDelete(row)"
                    >
                      <template #icon>
                        <FaIcon name="i-ep:delete" />
                      </template>
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 分页区域 -->
            <div class="pagination-wrapper">
              <el-pagination
                :current-page="pagination.pageNum"
                :total="pagination.total"
                :page-size="pagination.pageSize"
                :page-sizes="pagination.sizes"
                :layout="pagination.layout"
                :hide-on-single-page="false"
                background
                @size-change="sizeChange"
                @current-change="currentChange"
                class="pagination"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @close="handleCancel"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="网站地址" prop="url">
          <el-input v-model="formData.url" placeholder="请输入网站地址（以http://或https://开头）">
            <template #append>
              <el-button type="primary" :loading="crawlerLoading" @click="handleCrawler">
                抓取
              </el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="网站名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入网站名称" />
        </el-form-item>
        <el-form-item label="所属分类" prop="categoryId">
          <el-tree-select
            v-model="formData.categoryId"
            :data="categoryTreeData"
            :props="treeProps"
            placeholder="请选择分类"
            style="width: 100%"
            check-strictly
          />
        </el-form-item>
        <el-form-item label="图标">
          <el-input
            v-model="formData.icon"
            placeholder="请输入图标名称或URL（如：i-ep:link 或 https://xxx/favicon.ico）"
          />
          <div v-if="formData.icon" class="icon-preview">
            <span class="icon-preview-label">预览：</span>
            <img
              v-if="isUrl(formData.icon)"
              :src="formData.icon"
              alt="preview"
              class="icon-preview-img"
            />
            <FaIcon v-else :name="formData.icon" class="icon-preview-icon" />
          </div>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number
            v-model="formData.sort"
            :min="0"
            placeholder="排序值"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.website-container {
  height: calc(100vh - 60px);
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f0ff 100%);
  padding: 0;
  margin: 0;
  width: 100vw;
  position: relative;
  overflow: auto;
}

.website-layout {
  display: flex;
  gap: 16px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 10px 20px;
  height: 100%;
}

.sidebar-section {
  flex-shrink: 0;
  width: 280px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  display: block;
  min-width: 0;
  overflow: visible;
  position: relative;
  z-index: 10;
  padding-bottom: 20px;
}

.table-section {
  flex: 1;
  min-height: 250px;
  overflow: visible;
  margin-bottom: 20px !important;
  margin-top: 0 !important;
  position: relative;
  z-index: 10;
  clear: both;
}

.table-container {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.table-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 4px 0;
}

.table-subtitle {
  font-size: 0.85rem;
  color: #5a6c7d;
  margin: 0;
  font-weight: 400;
}

.search-section {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.reset-btn,
.search-btn {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.reset-btn {
  background: rgba(0, 0, 0, 0.04);
  border-color: rgba(0, 0, 0, 0.15);
  color: #5a6c7d;
}

.reset-btn:hover {
  background: rgba(0, 0, 0, 0.08);
  border-color: rgba(0, 0, 0, 0.25);
}

.search-btn {
  background: linear-gradient(135deg, #722ed1 0%, #9254de 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(114, 46, 209, 0.3);
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(114, 46, 209, 0.4);
}

.table-wrapper {
  flex: 1;
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: auto;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: white;
  position: relative;
  z-index: 15;
  min-height: 150px;
  max-height: 600px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding-top: 16px;
}

.pagination {
  --el-pagination-bg-color: rgba(255, 255, 255, 0.8);
  --el-pagination-button-bg-color: rgba(255, 255, 255, 0.9);
}

.website-icon {
  font-size: 20px;
  color: #722ed1;
}

.website-icon-img {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  object-fit: cover;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.icon-preview {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-preview-label {
  font-size: 13px;
  color: #5a6c7d;
}

.icon-preview-img {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.icon-preview-icon {
  font-size: 24px;
  color: #722ed1;
}

/* 表格列标题居中 */
.table-wrapper :deep(.el-table th > .cell) {
  text-align: center !important;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .website-layout {
    flex-direction: column;
  }

  .sidebar-section {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .website-layout {
    padding: 16px;
  }

  .table-container {
    padding: 16px;
  }

  .search-form {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

