<script setup lang="ts">
import Sidebar from './sidebar.vue'
import type { NavCustomCategoryBo, NavCustomCategoryQuery, NavCustomCategoryVo } from '@/api/nav/types.ts'
import {
  navCustomCategoryTreeApi,
  navCustomCategoryDetailApi,
  navCustomCategorySaveApi,
  navCustomCategoryUpdateApi,
  navCustomCategoryDeleteApi,
} from '@/api/nav'
import { ElMessage, ElMessageBox } from 'element-plus'

// 接口返回的原始节点格式
interface ApiTreeNode {
  value?: string
  label?: string
  metadata?: {
    id: string
    name: string
    icon?: string
    level?: number
    parentId?: string
    sort?: number
    [key: string]: any
  }
  children?: ApiTreeNode[]
  // 或者直接是 NavCustomCategoryVo 格式
  id?: string
  name?: string
  icon?: string
  level?: number
  parentId?: string
  sort?: number
}

interface TreeNode extends NavCustomCategoryVo {
  children?: TreeNode[]
}

const loading = ref(false)
const treeData = ref<TreeNode[]>([])
const treeRef = ref<InstanceType<typeof ElTree> | null>(null)
const defaultExpandedKeys = ref<string[]>([])
const defaultProps = {
  children: 'children',
  label: 'name',
}

// 表单相关
const dialogVisible = ref(false)
const dialogTitle = ref('新增分类')
const formRef = ref<InstanceType<typeof ElForm> | null>(null)
const formData = ref<NavCustomCategoryBo>({
  name: '',
  parentId: '',
  icon: '',
  sort: 0,
})

const formRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
}

// 当前选中的节点
const currentNode = ref<NavCustomCategoryVo | null>(null)

// 扁平化分类树用于选择器
const flatCategoryList = computed(() => {
  // 查找节点及其所有子节点的ID
  const findNodeAndChildrenIds = (nodes: TreeNode[], targetId: string): Set<string> => {
    const ids = new Set<string>()
    const findNode = (nodeList: TreeNode[]): TreeNode | null => {
      for (const node of nodeList) {
        if (node.id === targetId) {
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
    
    const targetNode = findNode(nodes)
    if (targetNode) {
      const collectIds = (node: TreeNode) => {
        ids.add(node.id)
        if (node.children && node.children.length > 0) {
          node.children.forEach(collectIds)
        }
      }
      collectIds(targetNode)
    }
    return ids
  }
  
  const excludedIds = formData.value.id ? findNodeAndChildrenIds(treeData.value, formData.value.id) : new Set()
  
  const flatten = (nodes: TreeNode[], level = 0): Array<NavCustomCategoryVo & { level: number }> => {
    const result: Array<NavCustomCategoryVo & { level: number }> = []
    nodes.forEach(node => {
      // 排除当前编辑的分类及其所有子分类（避免选择自己或自己的子分类作为父分类）
      if (!excludedIds.has(node.id)) {
        result.push({
          id: node.id,
          name: node.name,
          icon: node.icon,
          level,
        })
        if (node.children && node.children.length > 0) {
          result.push(...flatten(node.children, level + 1))
        }
      }
    })
    return result
  }
  return flatten(treeData.value)
})

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

// 将接口返回的数据转换为树形格式
const convertToTreeNode = (apiNodes: ApiTreeNode[]): TreeNode[] => {
  return apiNodes.map((node) => {
    // 如果节点有 metadata，使用 metadata 中的数据
    if (node.metadata) {
      const treeNode: TreeNode = {
        id: node.metadata.id,
        name: node.metadata.name,
        icon: node.metadata.icon,
        level: node.metadata.level,
        parentId: node.metadata.parentId,
        sort: node.metadata.sort,
      }
      
      if (node.children && Array.isArray(node.children) && node.children.length > 0) {
        treeNode.children = convertToTreeNode(node.children)
      }
      
      return treeNode
    } else {
      // 如果没有 metadata，直接使用节点数据（可能是直接返回的 NavCustomCategoryVo 格式）
      const treeNode: TreeNode = {
        id: node.id,
        name: node.name,
        icon: node.icon,
        level: node.level,
        parentId: node.parentId,
        sort: node.sort,
      }
      
      if (node.children && Array.isArray(node.children) && node.children.length > 0) {
        treeNode.children = convertToTreeNode(node.children as ApiTreeNode[])
      }
      
      return treeNode
    }
  })
}

// 加载分类树
const loadCategoryTree = async () => {
  loading.value = true
  try {
    const response = await navCustomCategoryTreeApi({})
    const data = extractApiData(response)
    
    console.log('分类树接口返回数据:', data)
    
    if (Array.isArray(data) && data.length > 0) {
      treeData.value = convertToTreeNode(data as ApiTreeNode[])
      
      // 收集所有节点的ID用于默认展开
      const collectIds = (nodes: TreeNode[]): string[] => {
        const ids: string[] = []
        nodes.forEach(node => {
          if (node.id) {
            ids.push(node.id)
            if (node.children && node.children.length > 0) {
              ids.push(...collectIds(node.children))
            }
          }
        })
        return ids
      }
      defaultExpandedKeys.value = collectIds(treeData.value)
      
      console.log('转换后的树形数据:', treeData.value)
    } else {
      treeData.value = []
      defaultExpandedKeys.value = []
    }
  } catch (error) {
    console.error('加载分类树失败:', error)
    ElMessage.error('加载分类树失败')
    treeData.value = []
    defaultExpandedKeys.value = []
  } finally {
    loading.value = false
  }
}

// 处理节点点击
const handleNodeClick = (data: TreeNode) => {
  currentNode.value = data
}

// 打开新增对话框
const handleAdd = (parentId?: string) => {
  dialogTitle.value = '新增分类'
  formData.value = {
    name: '',
    parentId: parentId || '',
    icon: '',
    sort: 0,
  }
  currentNode.value = null
  dialogVisible.value = true
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

// 打开编辑对话框
const handleEdit = async (node: TreeNode) => {
  if (!node.id) return
  
  try {
    const response = await navCustomCategoryDetailApi(node.id)
    const data = response.data
    
    dialogTitle.value = '编辑分类'
    formData.value = {
      id: data.id,
      name: data.name || '',
      parentId: data.parentId || '',
      icon: data.icon || '',
      sort: data.sort || 0,
    }
    currentNode.value = data
    dialogVisible.value = true
    nextTick(() => {
      formRef.value?.clearValidate()
    })
  } catch (error) {
    console.error('获取分类详情失败:', error)
    ElMessage.error('获取分类详情失败')
  }
}

// 删除分类
const handleDelete = async (node: TreeNode) => {
  if (!node.id) return
  
  try {
    await ElMessageBox.confirm(
      `确定要删除分类"${node.name}"吗？删除后该分类下的所有子分类和网站也会被删除。`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    const response = await navCustomCategoryDeleteApi([node.id])
    if (response.data) {
      ElMessage.success('删除成功')
      await loadCategoryTree()
    } else {
      ElMessage.error('删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除分类失败:', error)
      ElMessage.error('删除分类失败')
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
          const response = await navCustomCategoryUpdateApi(formData.value)
          if (response.data) {
            ElMessage.success('更新成功')
            dialogVisible.value = false
            await loadCategoryTree()
          } else {
            ElMessage.error('更新失败')
          }
        } else {
          // 新增
          const response = await navCustomCategorySaveApi(formData.value)
          if (response.data) {
            ElMessage.success('新增成功')
            dialogVisible.value = false
            await loadCategoryTree()
          } else {
            ElMessage.error('新增失败')
          }
        }
      } catch (error) {
        console.error('保存分类失败:', error)
        ElMessage.error('保存分类失败')
      }
    }
  })
}

// 取消表单
const handleCancel = () => {
  dialogVisible.value = false
  formData.value = {
    name: '',
    parentId: '',
    icon: '',
    sort: 0,
  }
}

onMounted(() => {
  loadCategoryTree()
})
</script>

<template>
  <div class="category-container">
    <div class="category-layout">
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
                <h3 class="table-title">分类管理</h3>
                <p class="table-subtitle">管理您的自定义分类</p>
              </div>
              <el-button type="primary" @click="handleAdd()">
                <template #icon>
                  <FaIcon name="i-ep:plus" />
                </template>
                新增分类
              </el-button>
            </div>
            <ElDivider border-style="dashed" />

            <div class="tree-wrapper" v-loading="loading">
              <el-tree
                ref="treeRef"
                :data="treeData"
                :props="defaultProps"
                node-key="id"
                :default-expanded-keys="defaultExpandedKeys"
                :highlight-current="true"
                @node-click="handleNodeClick"
                empty-text="暂无分类数据"
              >
                <template #default="{ node, data }">
                  <div class="tree-node">
                    <div class="tree-node-content">
                      <FaIcon v-if="data.icon" :name="data.icon" class="tree-node-icon" />
                      <span class="tree-node-label">{{ node.label }}</span>
                    </div>
                    <div class="tree-node-actions">
                      <el-button
                        link
                        type="primary"
                        size="small"
                        @click.stop="handleAdd(data.id)"
                      >
                        <template #icon>
                          <FaIcon name="i-ep:plus" />
                        </template>
                        新增子分类
                      </el-button>
                      <el-button
                        link
                        type="primary"
                        size="small"
                        @click.stop="handleEdit(data)"
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
                        @click.stop="handleDelete(data)"
                      >
                        <template #icon>
                          <FaIcon name="i-ep:delete" />
                        </template>
                        删除
                      </el-button>
                    </div>
                  </div>
                </template>
              </el-tree>
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
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="父分类">
          <el-select
            v-model="formData.parentId"
            placeholder="请选择父分类（留空则为顶级分类）"
            clearable
            style="width: 100%"
          >
            <el-option label="顶级分类" value="" />
            <el-option
              v-for="category in flatCategoryList"
              :key="category.id"
              :label="'  '.repeat(category.level) + category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="图标">
          <el-input
            v-model="formData.icon"
            placeholder="请输入图标名称（如：i-ep:folder）"
          />
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
.category-container {
  height: calc(100vh - 60px);
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f0ff 100%);
  padding: 0;
  margin: 0;
  width: 100vw;
  position: relative;
  overflow: auto;
}

.category-layout {
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

.tree-wrapper {
  min-height: 400px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  padding-right: 8px;
}

.tree-node-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.tree-node-icon {
  font-size: 16px;
  color: #fa8c16;
}

.tree-node-label {
  font-size: 14px;
  color: #2c3e50;
}

.tree-node-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.tree-node:hover .tree-node-actions {
  opacity: 1;
}

:deep(.el-tree-node__content) {
  height: 40px;
}

:deep(.el-tree-node__content:hover) {
  background-color: rgba(250, 140, 22, 0.1);
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: rgba(250, 140, 22, 0.15);
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .category-layout {
    flex-direction: column;
  }

  .sidebar-section {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .category-layout {
    padding: 16px;
  }

  .table-container {
    padding: 16px;
  }

  .tree-node-actions {
    opacity: 1;
  }
}
</style>

