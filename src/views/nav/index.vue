<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { navWebsitePageApi } from '@/api/nav'
import type { NavWebsiteVo, NavWebsiteQuery } from '@/api/nav/types'
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
    NavLeisure: 'leisure',
    NavLeisureIndex: 'leisure',
    NavLifestyle: 'lifestyle',
    NavLifestyleIndex: 'lifestyle',
    NavEducation: 'education',
    NavEducationIndex: 'education',
    NavIndustry: 'industry',
    NavIndustryIndex: 'industry',
    NavOther: 'other',
    NavOtherIndex: 'other',
  }
  // 优先根据路径匹配
  if (routePath === '/comprehensive') return categories.value.find(c => c.id === 'comprehensive') || null
  if (routePath === '/leisure') return categories.value.find(c => c.id === 'leisure') || null
  if (routePath === '/lifestyle') return categories.value.find(c => c.id === 'lifestyle') || null
  if (routePath === '/education') return categories.value.find(c => c.id === 'education') || null
  if (routePath === '/industry') return categories.value.find(c => c.id === 'industry') || null
  if (routePath === '/other') return categories.value.find(c => c.id === 'other') || null

  const categoryId = categoryMap[routeName]
  return categories.value.find(c => c.id === categoryId) || null
})

// 根据分类获取网站列表
async function fetchWebsitesByCategory(categoryId: string) {
  const category = categories.value.find(c => c.id === categoryId)
  if (!category) return

  category.loading = true
  try {
    const query: PageQuery<NavWebsiteQuery> = {
      pageNum: 1,
      pageSize: 20,
      data: {
        category: categoryId,
      },
    }
    const response = await navWebsitePageApi(query)
    if (response.data?.data) {
      category.items = response.data.data.records || []
    }
  } catch (error) {
    console.error('获取网站列表失败:', error)
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
watch(() => route.name, (routeName) => {
  if (showCategoryView.value && currentCategory.value) {
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
        <div class="category-block">
          <div class="category-header">
            <div class="category-title">
              <FaIcon :name="currentCategory.icon" :style="{ color: currentCategory.color }" />
              <span>{{ currentCategory.title }}</span>
            </div>
            <a class="more-link" href="javascript:void(0)">更多></a>
          </div>
          <div v-if="currentCategory.loading" class="loading">加载中...</div>
          <div v-else class="websites-grid">
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
        </div>
      </div>

      <!-- 首页卡片式展示 -->
      <div v-else class="home-cards-section">
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else class="cards-container">
          <!-- 大类卡片 -->
          <div
            v-for="mainCategory in homeSites"
            :key="mainCategory.name"
            class="main-category-card"
          >
            <div class="main-category-header">
              <h2 class="main-category-title">
                <FaIcon
                  :name="getCategoryIcon(mainCategory.name)"
                  :style="{ color: getCategoryColor(mainCategory.name) }"
                />
                <span>{{ mainCategory.name }}</span>
              </h2>
              <a class="more-link" href="javascript:void(0)">更多></a>
            </div>
            <div class="sub-categories-wrapper">
              <!-- 子类卡片 -->
              <div
                v-for="subCategory in mainCategory.children"
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
    </div>
  </div>
</template>

<style scoped lang="scss">
.nav-home-container {
  width: 100%;
  min-height: calc(100vh - 101px);
  background: #fafbfc;
  padding: 32px 24px;
}

/* 内容区域 */
.content-area {
  max-width: 1200px;
  margin: 0 auto;
  animation: fadeIn 0.4s ease-in;
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

.cards-container {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* 大类卡片 */
.main-category-card {
  background: #fff;
  border-radius: 12px;
  padding: 28px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e8eaed;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
}

.main-category-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 60px;
    height: 2px;
    background: linear-gradient(90deg, #667eea, transparent);
    border-radius: 2px;
  }
}

.main-category-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  letter-spacing: -0.3px;

  :deep(.fa-icon) {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }
}

/* 子类容器 */
.sub-categories-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

/* 子类卡片 */
.sub-category-card {
  background: #fafbfc;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 0;
  border: 1px solid #e8eaed;
  transition: all 0.3s ease;

  &:hover {
    background: #fff;
    border-color: #d0d7de;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
}

.sub-category-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e8eaed;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sub-category-title {
  font-size: 17px;
  font-weight: 600;
  color: #1a1a1a;
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

.more-link {
  font-size: 14px;
  color: #6b7280;
  text-decoration: none;
  transition: all 0.25s ease;
  padding: 4px 8px;
  border-radius: 4px;

  &:hover {
    color: #667eea;
    background: #f0f4ff;
    transform: translateX(2px);
  }
}

/* 网站网格 */
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
  border: 1px solid #e8eaed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  gap: 10px;

  &:hover {
    background: #f8f9fa;
    border-color: #667eea;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.12);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}

.website-icon {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: #f8f9fa;
  overflow: hidden;
  transition: all 0.25s ease;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: transform 0.25s ease;
  }

  :deep(.fa-icon) {
    font-size: 20px;
    color: #667eea;
  }
}

.website-item:hover .website-icon {
  background: #f0f4ff;
  transform: scale(1.05);

  img {
    transform: scale(1.1);
  }
}

.website-name {
  font-size: 14px;
  color: #1a1a1a;
  text-align: left;
  word-break: break-word;
  line-height: 1.5;
  font-weight: 500;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  transition: color 0.25s ease;
}

.website-item:hover .website-name {
  color: #667eea;
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
