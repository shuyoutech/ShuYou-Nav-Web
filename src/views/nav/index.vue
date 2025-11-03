<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import {  navWebsiteCategoryApi } from '@/api/nav'
import type { NavWebsiteVo } from '@/api/nav/types'
import {queryHotDataApi} from "@/api/api";

const route = useRoute()

// 分类配置（对应菜单：综合网站、休闲娱乐、生活服务、教育文化、行业分类、其他）
const categories = ref([
  {
    id: 'comprehensive',
    title: '综合网站',
    icon: 'i-mdi:web',
    color: '#667eea',
    items: [] as NavWebsiteVo[],
    loading: false,
  },
  {
    id: 'entertainment',
    title: '休闲娱乐',
    icon: 'i-mdi:gamepad-variant',
    color: '#f093fb',
    items: [] as NavWebsiteVo[],
    loading: false,
  },
  {
    id: 'life',
    title: '生活服务',
    icon: 'i-mdi:home',
    color: '#4ecdc4',
    items: [] as NavWebsiteVo[],
    loading: false,
  },
  {
    id: 'education',
    title: '教育文化',
    icon: 'i-mdi:school',
    color: '#45b7d1',
    items: [] as NavWebsiteVo[],
    loading: false,
  },
  {
    id: 'industry',
    title: '行业分类',
    icon: 'i-mdi:briefcase',
    color: '#f093fb',
    items: [] as NavWebsiteVo[],
    loading: false,
  },
  {
    id: 'other',
    title: '其他',
    icon: 'i-mdi:dots-horizontal',
    color: '#95a5a6',
    items: [] as NavWebsiteVo[],
    loading: false,
  },
])



// 是否显示分类内容（通过菜单访问时）
const showCategoryView = computed(() => {
  const routeName = route.name as string
  const routePath = route.path
  return ['NavComprehensive', 'NavComprehensiveIndex', 'NavLeisure', 'NavLeisureIndex',
          'NavLifestyle', 'NavLifestyleIndex', 'NavEducation', 'NavEducationIndex',
          'NavIndustry', 'NavIndustryIndex', 'NavOther', 'NavOtherIndex'].includes(routeName) ||
         ['/comprehensive', '/leisure', '/lifestyle', '/education', '/industry', '/other'].includes(routePath)
})

// 当前显示的分类（通过菜单访问时）
const currentCategory = computed(() => {
  if (!showCategoryView.value) return null
  const routeName = route.name as string
  const routePath = route.path
  const categoryMap: Record<string, string> = {
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
    NavOther: 'other',
    NavOtherIndex: 'other',
  }
  // 优先根据路径匹配
  if (routePath === '/comprehensive') return categories.value.find(c => c.id === 'comprehensive') || null
  if (routePath === '/leisure') return categories.value.find(c => c.id === 'entertainment') || null
  if (routePath === '/lifestyle') return categories.value.find(c => c.id === 'life') || null
  if (routePath === '/education') return categories.value.find(c => c.id === 'education') || null
  if (routePath === '/industry') return categories.value.find(c => c.id === 'industry') || null
  if (routePath === '/other') return categories.value.find(c => c.id === 'other') || null

  const categoryId = categoryMap[routeName]
  return categories.value.find(c => c.id === categoryId) || null
})

// 分类页面数据（两层结构：子分类 -> 网站列表）
const categoryPageData = ref<any[]>([])

// 根据分类获取网站列表（通过分类接口）
async function fetchWebsitesByCategory(categoryId: string) {
  const category = categories.value.find(c => c.id === categoryId)
  if (!category) return

  category.loading = true
  // 清空旧数据
  categoryPageData.value = []
  category.items = []
  
  try {
    // 调用分类接口，使用 categoryId 作为 type 参数
    console.log('调用分类接口，categoryId:', categoryId)
    const response = await navWebsiteCategoryApi(categoryId)
    console.log('分类接口响应:', response)
    
    // axios 拦截器已经返回了 response.data，所以 response 就是 { code: 0, data: [...], msg: '' }
    // 如果 response 直接是数组（某些情况下），则直接使用
    let data: any = null
    
    if (Array.isArray(response)) {
      // 直接返回数组的情况
      data = response
    } else if (response?.data && Array.isArray(response.data)) {
      // 标准格式：{ code: 0, data: [...] }
      data = response.data
    } else if (response?.data) {
      // 其他格式
      data = response.data
    }
    
    console.log('解析后的数据:', data)

    // 接口返回的是两层结构：[{ name: "搜索网站", children: [网站列表] }, ...]
    if (Array.isArray(data) && data.length > 0) {
      // 保存树形结构数据用于展示
      categoryPageData.value = data
      console.log('设置 categoryPageData:', categoryPageData.value)

      // 扁平化处理，提取所有网站用于备用展示
      const allWebsites: NavWebsiteVo[] = []
      data.forEach((subCategory: any) => {
        if (subCategory.children && Array.isArray(subCategory.children)) {
          subCategory.children.forEach((website: any) => {
            if (website.id || website.url) {
              allWebsites.push(website)
            }
          })
        }
      })
      category.items = allWebsites
      console.log('提取的网站数量:', allWebsites.length)
    } else {
      console.warn('返回的数据不是有效的数组或为空:', data)
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

// 打开网址
function openWebsite(url: string) {
  if (url && !url.startsWith('http')) {
    url = `https://${url}`
  }
  window.open(url, '_blank')
}

// 获取分类图标
function getCategoryIcon(name: string) {
  const iconMap: Record<string, string> = {
    '综合网站': 'i-mdi:web',
    '休闲娱乐': 'i-mdi:gamepad-variant',
    '生活服务': 'i-mdi:home-heart',
    '教育文化': 'i-mdi:school',
    '行业分类': 'i-mdi:briefcase',
    '其他': 'i-mdi:dots-horizontal',
  }
  return iconMap[name] || 'i-mdi:web'
}

// 获取分类颜色
function getCategoryColor(name: string) {
  // 根据图片，综合网站、休闲娱乐等用紫色，购物等用红色
  const purpleCategories = ['综合网站', '休闲娱乐']
  const redCategories = ['生活服务']

  if (purpleCategories.includes(name)) {
    return '#764ba2'
  } else if (redCategories.includes(name)) {
    return '#ff6b6b'
  }
  return '#667eea'
}

// 监听路由变化，加载对应的分类数据
watch([() => route.path, () => route.name], ([routePath, routeName]) => {
  // 清空旧数据
  categoryPageData.value = []
  
  if (showCategoryView.value && currentCategory.value) {
    console.log('路由变化，加载分类数据:', {
      path: routePath,
      name: routeName,
      categoryId: currentCategory.value.id,
      category: currentCategory.value
    })
    fetchWebsitesByCategory(currentCategory.value.id)
  }
}, { immediate: true })

onMounted(() => {
  initData()
  if (showCategoryView.value && currentCategory.value) {
    // 如果通过菜单访问分类，只加载该分类的数据
    fetchWebsitesByCategory(currentCategory.value.id)
  }
})

// 首页数据
const homeSites = ref<any[]>([])
const loading = ref(false)

// 初始化数据
const initData = async () => {
  if (!showCategoryView.value) {
    // 只在首页加载数据
    loadNavHomeSites()
  }
}

const loadNavHomeSites = () => {
  loading.value = true
  queryHotDataApi('nav_home').then(({data}) => {
    // 新格式：两层结构 [{ name: "搜索网站", children: [网站列表] }, ...]
    // 直接使用返回的数据，不进行重组
    homeSites.value = data || []
  }).catch(() => {
    homeSites.value = []
  }).finally(() => {
    loading.value = false
  })
}

</script>

<template>
  <div class="nav-home-container">
    <!-- 内容区域 -->
    <div class="content-area">
      <!-- 通过菜单访问的分类视图 -->
      <div v-if="showCategoryView && currentCategory" class="categories-section">
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
                  <img v-if="website.icon" :src="website.icon" :alt="website.name" />
                  <FaIcon v-else name="i-mdi:link" />
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
              <FaIcon :name="currentCategory.icon" :style="{ color: currentCategory.color }" />
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
                <img v-if="website.icon" :src="website.icon" :alt="website.name" />
                <FaIcon v-else name="i-mdi:link" />
              </div>
              <div class="website-name">{{ website.name }}</div>
            </div>
          </div>
          <div v-else class="loading">暂无数据</div>
        </div>
      </div>

      <!-- 首页卡片式展示 -->
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
                  <img v-if="website.icon" :src="website.icon" :alt="website.name" />
                  <FaIcon v-else name="i-mdi:link" />
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

/* 响应式设计 */
@media (max-width: 1024px) {
  .content-area {
    max-width: 100%;
  }

  .sub-categories-wrapper {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
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
