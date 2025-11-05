<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ElTree } from 'element-plus'
import { navWebsiteCategoryApi, navCustomCategoryTreeApi, navCustomWebsiteApi } from '@/api/nav'
import type { NavWebsiteVo, NavCustomCategoryVo, NavCustomWebsiteVo } from '@/api/nav/types'
import { queryHotDataApi } from '@/api/api'

const route = useRoute()

// 路由配置常量
const ROUTE_CONFIG = {
  categoryRouteNames: [
    'NavComprehensive', 'NavComprehensiveIndex',
    'NavLeisure', 'NavLeisureIndex',
    'NavLifestyle', 'NavLifestyleIndex',
    'NavEducation', 'NavEducationIndex',
    'NavIndustry', 'NavIndustryIndex',
    'NavCustom', 'NavCustomIndex',
  ],
  categoryPaths: ['/comprehensive', '/leisure', '/lifestyle', '/education', '/industry', '/custom'],
  categoryMap: {
    NavComprehensive: 'comprehensive',
    NavComprehensiveIndex: 'comprehensive',
    NavLeisure: 'entertainment',
    NavLeisureIndex: 'entertainment',
    NavLifestyle: 'life',
    NavLifestyleIndex: 'life',
    NavEducation: 'education',
    NavEducationIndex: 'education',
    NavIndustry: 'industry',
    NavIndustryIndex: 'industry',
    NavCustom: 'custom',
    NavCustomIndex: 'custom',
  },
  pathToCategoryId: {
    '/comprehensive': 'comprehensive',
    '/leisure': 'entertainment',
    '/lifestyle': 'life',
    '/education': 'education',
    '/industry': 'industry',
    '/custom': 'custom',
  },
} as const

// 分类配置
interface CategoryItem {
  id: string
  title: string
  icon: string
  color: string
  items: NavWebsiteVo[]
  loading: boolean
}

const categories = ref<CategoryItem[]>([
  {
    id: 'comprehensive',
    title: '综合网站',
    icon: 'i-mdi:web',
    color: '#667eea',
    items: [],
    loading: false,
  },
  {
    id: 'entertainment',
    title: '休闲娱乐',
    icon: 'i-mdi:gamepad-variant',
    color: '#f093fb',
    items: [],
    loading: false,
  },
  {
    id: 'life',
    title: '生活服务',
    icon: 'i-mdi:home',
    color: '#4ecdc4',
    items: [],
    loading: false,
  },
  {
    id: 'education',
    title: '教育文化',
    icon: 'i-mdi:school',
    color: '#45b7d1',
    items: [],
    loading: false,
  },
  {
    id: 'industry',
    title: '行业分类',
    icon: 'i-mdi:briefcase',
    color: '#f093fb',
    items: [],
    loading: false,
  },
  {
    id: 'custom',
    title: '我的导航',
    icon: 'i-mdi:dots-horizontal',
    color: '#95a5a6',
    items: [],
    loading: false,
  },
])

// 工具函数：统一处理API响应数据
function extractApiData(response: any): any[] | null {
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

// 是否显示分类内容（通过菜单访问时）
const showCategoryView = computed(() => {
  const routeName = route.name as string
  const routePath = route.path
  return (
    ROUTE_CONFIG.categoryRouteNames.includes(routeName as any) ||
    ROUTE_CONFIG.categoryPaths.includes(routePath as any)
  )
})

// 是否是自定义导航（我的导航）
const isCustomNav = computed(() => {
  const routeName = route.name as string
  const routePath = route.path
  return routeName === 'NavCustom' || routeName === 'NavCustomIndex' || routePath === '/custom'
})

// 当前显示的分类（通过菜单访问时）
const currentCategory = computed(() => {
  if (!showCategoryView.value) return null

  const routePath = route.path as keyof typeof ROUTE_CONFIG.pathToCategoryId
  const routeName = route.name as keyof typeof ROUTE_CONFIG.categoryMap

  // 优先根据路径匹配
  const categoryIdFromPath = ROUTE_CONFIG.pathToCategoryId[routePath]
  if (categoryIdFromPath) {
    return categories.value.find(c => c.id === categoryIdFromPath) || null
  }

  // 根据路由名称匹配
  const categoryIdFromName = ROUTE_CONFIG.categoryMap[routeName]
  if (categoryIdFromName) {
    return categories.value.find(c => c.id === categoryIdFromName) || null
  }

  return null
})

// 子分类数据结构
interface SubCategoryData {
  name: string
  children: NavWebsiteVo[]
}

// 分类页面数据（两层结构：子分类 -> 网站列表）
const categoryPageData = ref<SubCategoryData[]>([])

// 自定义导航相关数据
// 树形节点接口定义（接口返回的原始格式）
interface ApiTreeNode {
  value: string
  label: string
  parentId: string
  sort: number
  metadata: {
    level: number
    rootId: string
    icon: string
    name: string
    id: string
    sort: number
    userName: string
    userId: string
    parentId: string
  }
  children?: ApiTreeNode[]
}

// Element Tree 需要的节点格式
interface ElTreeNode {
  id: string
  label: string
  icon?: string
  metadata?: ApiTreeNode['metadata']
  level?: number // 添加层级信息
  children?: ElTreeNode[]
}

// 保存原始树形结构（用于查找）
const customCategoryTreeRaw = ref<ApiTreeNode[]>([])
// Element Tree 组件需要的数据格式
const customCategoryTree = ref<ElTreeNode[]>([])
const customWebsites = ref<NavCustomWebsiteVo[]>([])
const customWebsitesGrouped = ref<SubCategoryData[]>([]) // 按分类分组的数据
const selectedCategoryId = ref<string | undefined>(undefined)
const customLoading = ref(false)
const treeContainerRef = ref<HTMLElement | null>(null)
const treeRef = ref<InstanceType<typeof ElTree> | null>(null)
const defaultExpandedKeys = ref<string[]>([]) // Element Tree 默认展开的节点

// 将接口返回的数据转换为 Element Tree 需要的格式
function convertToElTreeData(apiNodes: ApiTreeNode[]): ElTreeNode[] {
  return apiNodes.map((node) => {
    const elNode: ElTreeNode = {
      id: node.metadata?.id || node.value,
      label: node.metadata?.name || node.label,
      icon: node.metadata?.icon,
      metadata: node.metadata,
      level: node.metadata?.level || 1, // 保存层级信息
    }
    
    if (node.children && Array.isArray(node.children) && node.children.length > 0) {
      elNode.children = convertToElTreeData(node.children)
    }
    
    return elNode
  })
}

// 收集所有一级节点的ID（用于默认展开）
function collectFirstLevelIds(nodes: ApiTreeNode[]): string[] {
  const ids: string[] = []
  nodes.forEach((node) => {
    if (node.metadata && node.metadata.level === 1) {
      ids.push(node.metadata.id)
    }
  })
  return ids
}

// 加载自定义分类树
async function fetchCustomCategoryTree() {
  try {
    const response = await navCustomCategoryTreeApi({})
    const data = extractApiData(response)

    if (Array.isArray(data) && data.length > 0) {
      // 保存原始数据
      customCategoryTreeRaw.value = data as ApiTreeNode[]
      // 转换为 Element Tree 格式
      customCategoryTree.value = convertToElTreeData(data)
      // 设置默认展开的节点（一级节点）
      defaultExpandedKeys.value = collectFirstLevelIds(data)
    } else {
      customCategoryTree.value = []
      customCategoryTreeRaw.value = []
      defaultExpandedKeys.value = []
    }
  } catch (error) {
    console.error('获取自定义分类树失败:', error)
    customCategoryTree.value = []
    customCategoryTreeRaw.value = []
    defaultExpandedKeys.value = []
  }
}

// 递归查找分类节点（在原始数据中查找）
function findCategoryNode(nodes: ApiTreeNode[], categoryId: string): ApiTreeNode | null {
  for (const node of nodes) {
    if (node.metadata && node.metadata.id === categoryId) {
      return node
    }
    if (node.children && Array.isArray(node.children) && node.children.length > 0) {
      const found = findCategoryNode(node.children, categoryId)
      if (found) return found
    }
  }
  return null
}

// Element Tree 节点点击事件
function handleNodeClick(data: ElTreeNode) {
  if (data.id) {
    scrollToCategory(data.id)
  }
}

// 计算元素相对于滚动容器的位置
function getOffsetTopRelativeToContainer(element: HTMLElement, container: HTMLElement): number {
  // 使用 getBoundingClientRect 精确计算（这个方法最可靠）
  const elementRect = element.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()
  const containerScrollTop = container.scrollTop
  
  // 元素相对于视口的位置 - 容器相对于视口的位置 + 容器当前的滚动位置
  // 这样得到的就是元素在容器内容区域中的绝对位置
  return elementRect.top - containerRect.top + containerScrollTop
}

// 定位到右侧对应的分类列表
function scrollToCategory(categoryId: string) {
  // 更新选中状态
  selectedCategoryId.value = categoryId

  // 定位到右侧对应的分类卡片
  nextTick(() => {
    setTimeout(() => {
      // 根据分类ID查找右侧对应的分类卡片（在原始数据中查找）
      const categoryNode = findCategoryNode(customCategoryTreeRaw.value, categoryId)
      if (categoryNode && categoryNode.metadata) {
        const categoryName = categoryNode.metadata.name
        // 在右侧网站列表中查找对应的分类卡片
        const rightCard = document.querySelector(`[data-right-category-name="${categoryName}"]`) as HTMLElement
        if (rightCard) {
          // 获取右侧滚动容器
          const rightContainer = rightCard.closest('.custom-websites-list') as HTMLElement
          if (rightContainer) {
            // 计算卡片相对于容器的位置
            const cardOffsetTop = getOffsetTopRelativeToContainer(rightCard, rightContainer)
            // 获取容器的 padding-top
            const containerPadding = parseInt(getComputedStyle(rightContainer).paddingTop) || 24
            
            // 滚动到顶部位置（卡片顶部对齐容器内容区域顶部）
            const scrollTop = cardOffsetTop - containerPadding
            
            rightContainer.scrollTo({
              top: Math.max(0, scrollTop), // 确保不会滚动到负数
              behavior: 'smooth'
            })
          } else {
            // 如果没有找到容器，使用默认的 scrollIntoView
            rightCard.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
              inline: 'nearest'
            })
          }
          
          // 添加高亮效果
          rightCard.classList.add('highlight-category')
          setTimeout(() => {
            rightCard.classList.remove('highlight-category')
          }, 2000)
        }
      }
    }, 150) // 增加延迟，确保DOM完全渲染
  })
}

// 加载自定义网址列表
async function fetchCustomWebsites(categoryId?: string) {
  // 如果点击的是当前已选中的分类，不重新加载
  if (selectedCategoryId.value === categoryId && customWebsitesGrouped.value.length > 0) {
    return
  }

  // 先更新选中状态，让UI立即响应
  selectedCategoryId.value = categoryId

  try {
    // 延迟显示loading，如果数据加载很快就不显示loading
    const loadingTimeout = setTimeout(() => {
      customLoading.value = true
    }, 150)

    const response = await navCustomWebsiteApi({ categoryId })
    const data = extractApiData(response)

    // 清除loading定时器
    clearTimeout(loadingTimeout)
    customLoading.value = false

    if (Array.isArray(data) && data.length > 0) {
      // 接口返回格式：[{ id, name, icon, children: [...] }, ...]
      // 转换为 SubCategoryData 格式用于展示
      customWebsitesGrouped.value = data.map((item: any) => ({
        name: item.name || '',
        children: Array.isArray(item.children) ? item.children : [],
      }))
      // 扁平化所有网站用于备用
      customWebsites.value = data.flatMap((item: any) => 
        Array.isArray(item.children) ? item.children : []
      )
    } else {
      customWebsitesGrouped.value = []
      customWebsites.value = []
    }
  } catch (error) {
    console.error('获取自定义网址列表失败:', error)
    customWebsitesGrouped.value = []
    customWebsites.value = []
    customLoading.value = false
  }
}

// 扁平化处理分类数据，提取所有网站
function flattenCategoryData(data: SubCategoryData[]): NavWebsiteVo[] {
  const allWebsites: NavWebsiteVo[] = []
  data.forEach((subCategory) => {
    if (subCategory.children && Array.isArray(subCategory.children)) {
      subCategory.children.forEach((website) => {
        if (website.id || website.url) {
          allWebsites.push(website)
        }
      })
    }
  })
  return allWebsites
}

// 根据分类获取网站列表（通过分类接口）
async function fetchWebsitesByCategory(categoryId: string) {
  // 如果是自定义导航，使用特殊处理
  if (categoryId === 'custom') {
    customLoading.value = true
    try {
      await Promise.all([
        fetchCustomCategoryTree(),
        fetchCustomWebsites(), // 默认不传 categoryId，获取所有分类的网站
      ])
    } finally {
      customLoading.value = false
    }
    return
  }

  const category = categories.value.find(c => c.id === categoryId)
  if (!category) return

  category.loading = true
  // 清空旧数据
  categoryPageData.value = []
  category.items = []

  try {
    const response = await navWebsiteCategoryApi(categoryId)
    const data = extractApiData(response)

    // 接口返回的是两层结构：[{ name: "搜索网站", children: [网站列表] }, ...]
    if (Array.isArray(data) && data.length > 0) {
      // 保存树形结构数据用于展示
      categoryPageData.value = data
      // 扁平化处理，提取所有网站用于备用展示
      category.items = flattenCategoryData(data)
    } else {
      category.items = []
      categoryPageData.value = []
    }
  } catch (error) {
    console.error('获取分类网站列表失败:', error)
    category.items = []
    categoryPageData.value = []
  } finally {
    category.loading = false
  }
}

// 打开网址（优化URL处理）
function openWebsite(url: string) {
  if (!url) return

  let finalUrl = url.trim()
  if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
    finalUrl = `https://${finalUrl}`
  }

  try {
    window.open(finalUrl, '_blank', 'noopener,noreferrer')
  } catch (error) {
    console.error('打开网址失败:', error)
  }
}

// 监听路由变化，加载对应的分类数据
watch(
  [() => route.path, () => route.name],
  () => {
    // 清空旧数据
    categoryPageData.value = []

    if (showCategoryView.value && currentCategory.value) {
      fetchWebsitesByCategory(currentCategory.value.id)
    }
  },
  { immediate: true }
)

// 首页数据
const homeSites = ref<SubCategoryData[]>([])
const loading = ref(false)

// 加载首页导航数据
function loadNavHomeSites() {
  loading.value = true
  queryHotDataApi('nav_home')
    .then(({ data }) => {
      // 新格式：两层结构 [{ name: "搜索网站", children: [网站列表] }, ...]
      // 直接使用返回的数据，不进行重组
      homeSites.value = Array.isArray(data) ? data : []
    })
    .catch((error) => {
      console.error('加载首页导航数据失败:', error)
      homeSites.value = []
    })
    .finally(() => {
      loading.value = false
    })
}

// 初始化数据
function initData() {
  if (!showCategoryView.value) {
    // 只在首页加载数据
    loadNavHomeSites()
  }
}

onMounted(() => {
  initData()
  // 分类数据加载已在 watch 中处理，不需要在这里重复调用
})


</script>


<template>
  <div class="nav-home-container">
    <!-- 内容区域 -->
    <div class="content-area">
      <!-- 通过菜单访问的分类视图 -->
      <div v-if="showCategoryView && currentCategory" class="categories-section">
        <!-- 自定义导航（我的导航）特殊布局：左侧树形菜单 + 右侧网站列表 -->
        <div v-if="isCustomNav" class="custom-nav-layout">
          <div v-if="customLoading" class="loading">加载中...</div>
          <div v-else class="custom-nav-content">
            <!-- 左侧分类树 -->
            <div class="custom-category-tree">
              <div class="tree-header">
                <FaIcon name="i-mdi:view-dashboard" class="tree-header-icon"/>
                <span>我的分类</span>
              </div>
              <div class="tree-container" ref="treeContainerRef">
                <ElTree
                  ref="treeRef"
                  :data="customCategoryTree"
                  :props="{ children: 'children', label: 'label' }"
                  node-key="id"
                  :default-expanded-keys="defaultExpandedKeys"
                  :highlight-current="true"
                  :current-node-key="selectedCategoryId"
                  @node-click="handleNodeClick"
                >
                  <template #default="{ node, data }">
                    <div class="custom-tree-node">
                      <div class="tree-node-icon">
                        <img
                          v-if="data.icon"
                          :src="data.icon"
                          :alt="data.label"
                          class="tree-icon-img"
                        />
                        <FaIcon
                          v-else
                          name="i-mdi:folder"
                          class="tree-icon"
                        />
                      </div>
                      <span class="tree-node-label">{{ data.label }}</span>
                    </div>
                  </template>
                </ElTree>
              </div>
              <div v-if="customCategoryTree.length === 0" class="tree-empty">
                <FaIcon name="i-mdi:folder-off" class="tree-empty-icon"/>
                <span>暂无分类</span>
              </div>
            </div>
            <!-- 右侧网站列表 -->
            <div class="custom-websites-list">
              <!-- 加载遮罩层（不遮挡内容） -->
              <div v-if="customLoading" class="loading-overlay">
                <div class="loading-spinner-small"></div>
              </div>
              <!-- 按分类分组展示 -->
              <Transition name="fade-content" mode="out-in">
                <div v-if="customWebsitesGrouped && customWebsitesGrouped.length > 0" key="content" class="cards-container">
                  <TransitionGroup name="list" tag="div">
                    <div
                      v-for="subCategory in customWebsitesGrouped"
                      :key="subCategory.name"
                      :data-right-category-name="subCategory.name"
                      class="sub-category-card"
                    >
                      <div class="sub-category-header">
                        <h3 class="sub-category-title">{{ subCategory.name }}</h3>
                      </div>
                      <div class="websites-grid">
                        <div
                          v-for="website in subCategory.children"
                          :key="website.id"
                          class="website-item"
                          @click="openWebsite(website.url || '')"
                        >
                          <div class="website-icon">
                            <img v-if="website.icon" :src="website.icon" :alt="website.name"/>
                            <FaIcon v-else name="i-mdi:link"/>
                          </div>
                          <div class="website-name">{{ website.name }}</div>
                        </div>
                      </div>
                    </div>
                  </TransitionGroup>
                </div>
                <!-- 空状态 -->
                <div v-else-if="selectedCategoryId && !customLoading" key="empty" class="empty-state">
                  <FaIcon name="i-mdi:web-off" class="empty-icon"/>
                  <p class="empty-text">暂无网站</p>
                  <p class="empty-hint">该分类下暂无网站</p>
                </div>
                <div v-else-if="!selectedCategoryId" key="select" class="empty-state">
                  <FaIcon name="i-mdi:web-off" class="empty-icon"/>
                  <p class="empty-text">暂无网站</p>
                  <p class="empty-hint">请先选择一个分类</p>
                </div>
              </Transition>
            </div>
          </div>
        </div>
        <!-- 其他分类的展示方式 -->
        <div v-else>
          <div v-if="currentCategory.loading" class="loading">加载中...</div>
          <!-- 如果有分类数据，使用卡片方式展示（两层结构：子分类 -> 网站列表） -->
          <div v-else-if="categoryPageData && categoryPageData.length > 0" class="cards-container">
            <div
              v-for="subCategory in categoryPageData"
              :key="subCategory.name"
              class="sub-category-card"
            >
              <div class="sub-category-header">
                <h3 class="sub-category-title">{{ subCategory.name }}</h3>
              </div>
              <div class="websites-grid">
                <div
                  v-for="website in subCategory.children"
                  :key="website.id"
                  class="website-item"
                  @click="openWebsite(website.url || '')"
                >
                  <div class="website-icon">
                    <img v-if="website.icon" :src="website.icon" :alt="website.name"/>
                    <FaIcon v-else name="i-mdi:link"/>
                  </div>
                  <div class="website-name">{{ website.name }}</div>
                </div>
              </div>
            </div>
          </div>
          <!-- 如果没有数据，显示提示 -->
          <div v-else class="category-block">
            <div class="category-header">
              <div class="category-title">
                <FaIcon :name="currentCategory.icon" :style="{ color: currentCategory.color }"/>
                <span>{{ currentCategory.title }}</span>
              </div>
            </div>
            <div v-if="currentCategory.items && currentCategory.items.length > 0" class="websites-grid">
              <div
                v-for="website in currentCategory.items"
                :key="website.id"
                class="website-item"
                @click="openWebsite(website.url || '')"
              >
                <div class="website-icon">
                  <img v-if="website.icon" :src="website.icon" :alt="website.name"/>
                  <FaIcon v-else name="i-mdi:link"/>
                </div>
                <div class="website-name">{{ website.name }}</div>
              </div>
            </div>
            <div v-else class="loading">暂无数据</div>
          </div>
        </div>
      </div>
      <div v-else class="home-cards-section home-page">
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else class="cards-container">
          <!-- 直接展示子分类，按照接口返回顺序 -->
          <div
            v-for="subCategory in homeSites"
            :key="subCategory.name"
            class="sub-category-card"
          >
            <div class="sub-category-header">
              <h3 class="sub-category-title">{{ subCategory.name }}</h3>
            </div>
            <div class="websites-grid">
              <div
                v-for="website in subCategory.children"
                :key="website.id"
                class="website-item"
                @click="openWebsite(website.url || '')"
              >
                <div class="website-icon">
                  <img v-if="website.icon" :src="website.icon" :alt="website.name"/>
                  <FaIcon v-else name="i-mdi:link"/>
                </div>
                <div class="website-name">{{ website.name }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.nav-home-container {
  width: 100%;
  min-height: calc(100vh - 101px);
  background: #fff;
  padding: 20px;

  // 首页专用背景
  .home-page {
    background: #fff;
  }
}

/* 内容区域 */
.content-area {
  max-width: 1200px;
  margin: 0 auto;
  animation: fadeIn 0.4s ease-in;

  // 首页专用最大宽度
  .home-page & {
    max-width: 1400px;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 分类区块 */
.category-block {
  margin-bottom: 40px;
}

/* 首页卡片式布局 */
.home-cards-section {
  width: 100%;
}

/* 首页专用样式 */
.home-page {
  .cards-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px 20px;
  }

  /* 子类卡片 - 首页样式（直接展示子分类） */
  .sub-category-card {
    background: #fafbfc !important;
    border-radius: 8px;
    padding: 12px 14px;
    margin-bottom: 0;
    border: 1px solid #e2e8f0 !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04) !important;
    transition: all 0.2s ease;
    display: flex;
    align-items: flex-start;
    gap: 14px;

    &:hover {
      background: #ffffff !important;
      border-color: #cbd5e0 !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
    }
  }

  .sub-category-header {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    min-width: 80px;
    flex-shrink: 0;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      right: -7px;
      top: 50%;
      transform: translateY(-50%);
      width: 1px;
      height: 16px;
      background: #e2e8f0;
    }
  }

  .sub-category-title {
    font-size: 13px;
    font-weight: 600;
    color: #1a202c;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
    letter-spacing: 0.1px;
  }

  /* 网站列表 - 首页样式（多列列表形式，紧凑） */
  .websites-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: 0;
    column-gap: 14px;
    row-gap: 2px;
    flex: 1;
  }

  .website-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 3px 4px !important;
    background: transparent !important;
    border: none !important;
    border-radius: 4px !important;
    cursor: pointer;
    transition: all 0.2s ease;
    gap: 6px;
    min-height: auto;
    box-shadow: none !important;

    &:hover {
      background: #f7fafc !important;
      transform: none;
      box-shadow: none !important;
      border: none !important;
    }
  }

  .website-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 3px;
    background: #f1f5f9;
    overflow: hidden;
    user-select: none;
    transition: all 0.2s ease;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      user-select: none;
    }

    :deep(.fa-icon) {
      font-size: 14px;
      color: #64748b;
      user-select: none;
    }
  }

  .website-item:hover .website-icon {
    background: #e2e8f0;

    :deep(.fa-icon) {
      color: #475569;
    }
  }

  .website-name {
    font-size: 13px;
    color: #334155;
    text-align: left;
    word-break: break-word;
    line-height: 1.5;
    font-weight: 400;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    transition: color 0.2s ease;
    cursor: pointer;
    user-select: none;
  }

  .website-item:hover .website-name {
    color: #1e293b;
    font-weight: 500;
  }

  .more-link {
    font-size: 12px;
    color: #a0aec0;
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: #667eea;
    }
  }
}

/* 通用样式（首页和分类页面共用） */
.cards-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 大类卡片 - 通用样式（分类页面使用） */
.main-category-card {
  background: #fff;
  border-radius: 0;
  padding: 12px 0;
  box-shadow: none;
  border: none;
  margin-bottom: 0;
}

.main-category-header {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px dashed rgba(102, 126, 234, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.main-category-title {
  font-size: 17px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;

  :deep(.fa-icon) {
    font-size: 20px;
    color: #667eea;
    filter: drop-shadow(0 2px 4px rgba(102, 126, 234, 0.2));
  }
}

/* 子类容器 - 通用样式 */
.sub-categories-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

/* 子类卡片 - 通用样式 */
.sub-category-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 0;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

  &:hover {
    background: linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%);
    border-color: rgba(102, 126, 234, 0.15);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
  }
}

/* 分类页面直接展示子分类卡片（不需要大类卡片包裹） */
.categories-section .cards-container > .sub-category-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 10px;
  padding: 20px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  margin-bottom: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

  &:hover {
    background: linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%);
    border-color: rgba(102, 126, 234, 0.15);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
  }
}

.sub-category-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px dashed rgba(102, 126, 234, 0.15);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sub-category-title {
  font-size: 16px;
  font-weight: 600;
  color: #4a5568;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.category-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;

  :deep(.fa-icon) {
    font-size: 20px;
  }
}

/* 网站网格 - 通用样式 */
.websites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}

.website-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 10px 12px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  gap: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06);
  min-height: 44px;

  &:hover {
    background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
    border-color: rgba(102, 126, 234, 0.2);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15), 0 2px 4px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06);
  }
}

.website-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
  overflow: hidden;
  user-select: none;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    user-select: none;
  }

  :deep(.fa-icon) {
    font-size: 18px;
    color: #667eea;
    user-select: none;
  }
}

.website-item:hover .website-icon {
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);

  img {
    filter: none;
  }

  :deep(.fa-icon) {
    color: #667eea;
  }
}

.website-name {
  font-size: 13px;
  color: #2d3748;
  text-align: left;
  word-break: break-word;
  line-height: 1.4;
  font-weight: 500;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  transition: color 0.3s ease;
  cursor: pointer;
  user-select: none;
}

.website-item:hover .website-name {
  color: #667eea;
}

.more-link {
  font-size: 13px;
  color: #a0aec0;
  text-decoration: none;
  transition: all 0.3s ease;
  padding: 4px 8px;
  border-radius: 4px;

  &:hover {
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
    transform: translateX(2px);
  }
}

.loading {
  text-align: center;
  padding: 60px 40px;
  color: #95a5a6;
  font-size: 15px;
  position: relative;

  &::before {
    content: '';
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid rgba(102, 126, 234, 0.2);
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-right: 12px;
    vertical-align: middle;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 自定义导航（我的导航）布局 */
.custom-nav-layout {
  width: 100%;
  animation: fadeInUp 0.4s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.custom-nav-content {
  display: flex;
  gap: 28px;
  align-items: flex-start;
  position: relative;
}

.custom-category-tree {
  width: 240px;
  flex-shrink: 0;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
  overflow-x: hidden;

  // 自定义滚动条样式
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(102, 126, 234, 0.2);
    border-radius: 3px;
    transition: background 0.3s ease;

    &:hover {
      background: rgba(102, 126, 234, 0.3);
    }
  }

  &:hover {
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.1), 0 2px 6px rgba(0, 0, 0, 0.05);
  }
}

.tree-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(102, 126, 234, 0.15);

  .tree-header-icon {
    font-size: 20px;
    color: #667eea;
  }
}

.tree-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
  
  // Element Tree 自定义样式
  :deep(.el-tree) {
    background: transparent;
    
    .el-tree-node {
      .el-tree-node__content {
        height: 44px;
        padding: 8px 12px;
        border-radius: 8px;
        margin-bottom: 4px;
        transition: all 0.2s ease;
        
        &:hover {
          background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
        }
      }
      
      &.is-current > .el-tree-node__content {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
        
        .tree-node-label {
          color: #fff;
          font-weight: 600;
        }
        
        .tree-icon {
          color: #fff;
        }
      }
    }
  }
}

.custom-tree-node {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  flex: 1;
}

.tree-node-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: #f1f5f9;
  flex-shrink: 0;
  overflow: hidden;
}

.tree-icon {
  font-size: 18px;
  color: #718096;
  transition: color 0.2s ease;
}

.tree-icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tree-node-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  color: #4a5568;
  transition: color 0.2s ease, font-weight 0.2s ease;
}

.tree-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #a0aec0;
  gap: 12px;

  .tree-empty-icon {
    font-size: 48px;
    opacity: 0.5;
  }

  span {
    font-size: 14px;
  }
}

.custom-websites-list {
  flex: 1;
  min-width: 0;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.03);
  min-height: 400px;
  position: relative;
  overflow-y: auto;
  max-height: calc(100vh - 140px);
  
  // 自定义滚动条样式
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(102, 126, 234, 0.2);
    border-radius: 3px;
    transition: background 0.3s ease;
    
    &:hover {
      background: rgba(102, 126, 234, 0.3);
    }
  }

  // 加载遮罩层
  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(2px);
    z-index: 10;
    border-radius: 12px;

    .loading-spinner-small {
      width: 32px;
      height: 32px;
      border: 3px solid rgba(102, 126, 234, 0.1);
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
  }

  // 使用通用的卡片容器样式
  .cards-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  // 子分类卡片样式（与综合网站页面保持一致）
  .sub-category-card {
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 0;
    border: 1px solid rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    scroll-margin-top: 20px; // 滚动定位时的偏移

    &:hover {
      background: linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%);
      border-color: rgba(102, 126, 234, 0.15);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
    }

    // 高亮效果
    &.highlight-category {
      animation: highlightPulse 2s ease-in-out;
      border-color: rgba(102, 126, 234, 0.4);
      box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
    }
  }

  @keyframes highlightPulse {
    0%, 100% {
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      border-color: rgba(102, 126, 234, 0.4);
    }
    50% {
      background: linear-gradient(135deg, #f0f4ff 0%, #f8f9ff 100%);
      border-color: rgba(102, 126, 234, 0.6);
    }
  }

  .sub-category-header {
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 2px dashed rgba(102, 126, 234, 0.15);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .sub-category-title {
    font-size: 16px;
    font-weight: 600;
    color: #4a5568;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .websites-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  min-height: 400px;

  .empty-icon {
    font-size: 64px;
    color: #cbd5e0;
    margin-bottom: 16px;
    opacity: 0.6;
    animation: float 3s ease-in-out infinite;
  }

  .empty-text {
    font-size: 16px;
    color: #718096;
    font-weight: 500;
    margin: 0 0 8px 0;
  }

  .empty-hint {
    font-size: 14px;
    color: #a0aec0;
    margin: 0;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

// 过渡动画
.fade-content-enter-active {
  transition: opacity 0.25s ease-out, transform 0.25s ease-out;
}

.fade-content-leave-active {
  transition: opacity 0.2s ease-in, transform 0.2s ease-in;
}

.fade-content-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-content-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.list-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-enter-from {
  opacity: 0;
  transform: translateX(30px) scale(0.95);
}

.list-move {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .content-area {
    max-width: 100%;
  }

  .sub-categories-wrapper {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }

  .custom-nav-content {
    flex-direction: column;
  }

  .custom-category-tree {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .nav-home-container {
    padding: 24px 16px;
    background: #fafbfc;
  }

  .cards-container {
    gap: 28px;
  }

  .main-category-card {
    padding: 20px;
    border-radius: 10px;
  }

  .main-category-title {
    font-size: 18px;
  }

  .sub-categories-wrapper {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .sub-category-card {
    padding: 16px;
    border-radius: 6px;
  }

  .websites-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 8px;
  }

  .website-item {
    padding: 8px 10px;
    gap: 8px;
    border-radius: 6px;
  }

  .website-icon {
    width: 24px;
    height: 24px;
  }

  .website-name {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .nav-home-container {
    padding: 20px 12px;
    background: #fafbfc;
  }

  .cards-container {
    gap: 24px;
  }

  .main-category-card {
    padding: 16px;
    border-radius: 8px;
  }

  .main-category-title {
    font-size: 17px;
  }

  .main-category-header {
    margin-bottom: 16px;
    padding-bottom: 12px;
  }

  .sub-category-card {
    padding: 14px;
    border-radius: 6px;
  }

  .sub-category-title {
    font-size: 15px;
  }

  .websites-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .website-item {
    padding: 8px;
    gap: 6px;
    border-radius: 6px;
  }

  .website-icon {
    width: 20px;
    height: 20px;
    border-radius: 4px;
  }

  .website-name {
    font-size: 12px;
    line-height: 1.4;
  }
}
</style>
