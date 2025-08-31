<template>
  <div class="strategy-container">
    <!-- 公共头部导航 -->
    <AppHeader 
      ref="appHeaderRef"
      @go-to-login="goToLogin"
      @go-to-profile="goToProfile"
    />

    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">游戏攻略</h1>
          <p class="page-subtitle">专业攻略指南，助你成为游戏高手</p>
        </div>
        <div class="header-right">
          <button class="btn btn-primary" @click="goToUpload">
            <FaIcon name="i-mdi:plus" class="btn-icon"/>
            发布攻略
          </button>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <div class="content-wrapper">
        <!-- 左侧内容区 -->
        <div class="left-content">
          <!-- 筛选和搜索 -->
          <div class="filter-section">
            <div class="filter-row">
              <div class="search-box">
                <FaIcon name="i-mdi:magnify" class="search-icon"/>
                <input 
                  v-model="searchQuery" 
                  type="text" 
                  placeholder="搜索攻略..."
                  class="search-input"
                />
              </div>
              <div class="sort-buttons">
                <button 
                  :class="['sort-btn', { active: sortBy === 'latest' }]"
                  @click="sortBy = 'latest'"
                >
                  <FaIcon name="i-mdi:clock-outline" class="sort-icon"/>
                  最新
                </button>
                <button 
                  :class="['sort-btn', { active: sortBy === 'hot' }]"
                  @click="sortBy = 'hot'"
                >
                  <FaIcon name="i-mdi:fire" class="sort-icon"/>
                  最热
                </button>
              </div>
            </div>
            
            <!-- 游戏分类 -->
            <div class="game-categories">
              <div class="category-label">热门游戏</div>
              <div class="category-buttons">
                <button 
                  v-for="game in gameOptions" 
                  :key="game.value"
                  :class="['category-btn', { active: selectedGames.includes(game.value) }]"
                  @click="toggleGame(game.value)"
                >
                  {{ game.label }}
                </button>
              </div>
            </div>

            <!-- 攻略分类 -->
            <div class="strategy-categories">
              <button 
                v-for="category in strategyCategories" 
                :key="category.value"
                :class="['strategy-category-btn', { active: currentFilter === category.value }]"
                @click="currentFilter = category.value"
              >
                {{ category.label }}
              </button>
            </div>
          </div>

          <!-- 攻略列表 -->
          <div class="strategy-list">
            <div 
              v-for="strategy in paginatedStrategies" 
              :key="strategy.id"
              class="strategy-card"
              @click="viewStrategy(strategy)"
            >
              <div class="strategy-image">
                <img :src="strategy.coverImage" :alt="strategy.title" class="cover-img"/>
                <div class="strategy-overlay">
                  <div class="strategy-tags">
                    <span class="strategy-tag">{{ strategy.game }}</span>
                    <span class="strategy-tag">{{ strategy.category }}</span>
                  </div>
                </div>
              </div>
              <div class="strategy-info">
                <h3 class="strategy-title">{{ strategy.title }}</h3>
                <p class="strategy-summary">{{ strategy.summary }}</p>
                <div class="strategy-meta">
                  <div class="author-info">
                    <img :src="strategy.author.avatar" :alt="strategy.author.name" class="author-avatar"/>
                    <span class="author-name">{{ strategy.author.name }}</span>
                    <div class="strategy-location">
                      <FaIcon name="i-mdi:map-marker" class="location-icon"/>
                      <span class="location-text">{{ strategy.location }}</span>
                    </div>
                  </div>
                  <span class="strategy-date">{{ formatDate(strategy.createTime) }}</span>
                </div>
                <div class="strategy-stats">
                  <div class="stats-item views">
                    <FaIcon name="i-mdi:eye" class="stats-icon"/>
                    <span class="stats-number">{{ formatNumber(strategy.views) }}</span>
                  </div>
                  <div class="stats-item likes clickable" @click.stop="likeStrategy(strategy)">
                    <FaIcon name="i-mdi:heart" :class="['stats-icon', { liked: strategy.isLiked }]"/>
                    <span class="stats-number">{{ formatNumber(strategy.likes) }}</span>
                  </div>
                  <div class="stats-item comments">
                    <FaIcon name="i-mdi:comment" class="stats-icon"/>
                    <span class="stats-number">{{ formatNumber(strategy.comments) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[12, 24, 48]"
              :total="totalStrategies"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>

        <!-- 右侧边栏 -->
        <div class="right-sidebar">
          <!-- 热门攻略 -->
          <div class="sidebar-section">
            <h3 class="sidebar-title">热门攻略</h3>
            <div class="hot-strategies">
              <div 
                v-for="(strategy, index) in hotStrategies" 
                :key="strategy.id"
                class="hot-strategy-item"
                @click="viewStrategy(strategy)"
              >
                <div class="hot-rank">{{ index + 1 }}</div>
                <div class="hot-content">
                  <h4 class="hot-title">{{ strategy.title }}</h4>
                  <div class="hot-meta">
                    <span class="hot-author">{{ strategy.author.name }}</span>
                    <span class="hot-views">{{ formatNumber(strategy.views) }} 浏览</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 攻略作者排行 -->
          <div class="sidebar-section">
            <h3 class="sidebar-title">攻略作者排行</h3>
            <div class="author-ranking">
              <div 
                v-for="(author, index) in topAuthors" 
                :key="author.id"
                class="author-item"
              >
                <div class="author-rank">{{ index + 1 }}</div>
                <img :src="author.avatar" :alt="author.name" class="author-avatar-small"/>
                <div class="author-info">
                  <span class="author-name">{{ author.name }}</span>
                  <span class="author-stats">{{ author.strategyCount }} 篇攻略</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 游戏分类统计 -->
          <div class="sidebar-section">
            <h3 class="sidebar-title">游戏分类统计</h3>
            <div class="game-stats">
              <div 
                v-for="stat in gameStats" 
                :key="stat.game"
                class="game-stat-item"
              >
                <span class="game-name">{{ stat.game }}</span>
                <span class="game-count">{{ stat.count }} 篇</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 登录弹窗 -->
    <Login
      v-model:visible="showAiLoginModal"
      @login-success="handleLoginSuccess"
    />

    <!-- 个人中心弹窗 -->
    <Profile
      v-model:visible="showProfileModal"
      @open-personal-center="handleOpenPersonalCenter"
    />

    <!-- 个人中心页面 -->
    <PersonalCenter
      v-model:visible="showPersonalCenterModal"
    />

    <!-- 公共底部 -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import Login from '@/views/login.vue'
import Profile from '@/views/profile.vue'
import PersonalCenter from '@/views/personal-center.vue'
import AppHeader from '@/components/AppHeader/index.vue'
import AppFooter from '@/components/AppFooter/index.vue'

const router = useRouter()

// 组件引用
const appHeaderRef = ref()

// 响应式数据
const searchQuery = ref('')
const currentFilter = ref('all')
const sortBy = ref('latest')
const selectedGames = ref<string[]>([])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(12)
const totalStrategies = ref(0)

// 弹窗状态
const showAiLoginModal = ref(false)
const showProfileModal = ref(false)
const showPersonalCenterModal = ref(false)

// 游戏选项
const gameOptions = [
  { label: '原神', value: 'genshin' },
  { label: '王者荣耀', value: 'wzry' },
  { label: '和平精英', value: 'hpjy' },
  { label: '英雄联盟', value: 'lol' },
  { label: '崩坏星穹铁道', value: 'hsr' },
  { label: '明日方舟', value: 'arknights' },
  { label: '阴阳师', value: 'yys' },
  { label: '第五人格', value: 'd5' }
]

// 攻略分类
const strategyCategories = [
  { label: '全部', value: 'all' },
  { label: '新手攻略', value: 'beginner' },
  { label: '进阶技巧', value: 'advanced' },
  { label: '装备推荐', value: 'equipment' },
  { label: '角色培养', value: 'character' },
  { label: '副本攻略', value: 'dungeon' },
  { label: 'PVP技巧', value: 'pvp' }
]

// 模拟攻略数据
const mockStrategies = ref([
  {
    id: '1',
    title: '原神新手必看：从零开始的提瓦特之旅',
    summary: '详细的新手攻略，包含角色选择、资源规划、地图探索等核心内容，帮助新手快速上手游戏。',
    content: '这是一篇详细的原神新手攻略...',
    author: { name: '攻略大师', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' },
    game: '原神',
    category: '新手攻略',
    coverImage: 'https://picsum.photos/400/200?random=1',
    views: 15420,
    likes: 892,
    comments: 156,
    isLiked: false,
    createTime: new Date(Date.now() - 3600000).toISOString(),
    location: '上海'
  },
  {
    id: '2',
    title: '王者荣耀S32赛季上分指南：强势英雄推荐',
    summary: '分析当前版本强势英雄，提供详细的出装、铭文和打法思路，助你快速上分。',
    content: 'S32赛季已经开启，让我们来看看...',
    author: { name: '电竞教练', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' },
    game: '王者荣耀',
    category: '进阶技巧',
    coverImage: 'https://picsum.photos/400/200?random=2',
    views: 12850,
    likes: 756,
    comments: 98,
    isLiked: true,
    createTime: new Date(Date.now() - 7200000).toISOString(),
    location: '北京'
  },
  {
    id: '3',
    title: '和平精英枪械选择指南：不同场景的最佳武器',
    summary: '详细介绍各种枪械的特点和使用场景，帮助玩家在不同情况下选择最适合的武器。',
    content: '在和平精英中，选择合适的武器...',
    author: { name: '枪械专家', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3' },
    game: '和平精英',
    category: '装备推荐',
    coverImage: 'https://picsum.photos/400/200?random=3',
    views: 9870,
    likes: 543,
    comments: 87,
    isLiked: false,
    createTime: new Date(Date.now() - 10800000).toISOString(),
    location: '广州'
  },
  {
    id: '4',
    title: '英雄联盟中路对线技巧：如何掌控中路节奏',
    summary: '分享中路对线的核心技巧，包括兵线控制、游走时机、团战定位等关键要素。',
    content: '中路作为地图的核心位置...',
    author: { name: '中路王者', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4' },
    game: '英雄联盟',
    category: 'PVP技巧',
    coverImage: 'https://picsum.photos/400/200?random=4',
    views: 11200,
    likes: 678,
    comments: 124,
    isLiked: false,
    createTime: new Date(Date.now() - 14400000).toISOString(),
    location: '深圳'
  },
  {
    id: '5',
    title: '崩坏星穹铁道角色培养优先级指南',
    summary: '分析各角色的强度和使用价值，为玩家提供角色培养的优先级建议。',
    content: '在崩坏星穹铁道中，资源有限...',
    author: { name: '铁道专家', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5' },
    game: '崩坏星穹铁道',
    category: '角色培养',
    coverImage: 'https://picsum.photos/400/200?random=5',
    views: 8650,
    likes: 432,
    comments: 76,
    isLiked: true,
    createTime: new Date(Date.now() - 18000000).toISOString(),
    location: '杭州'
  },
  {
    id: '6',
    title: '明日方舟危机合约高难度关卡攻略',
    summary: '针对危机合约高难度关卡，提供详细的干员配置和操作流程。',
    content: '危机合约是明日方舟的挑战模式...',
    author: { name: '合约大师', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=6' },
    game: '明日方舟',
    category: '副本攻略',
    coverImage: 'https://picsum.photos/400/200?random=6',
    views: 7430,
    likes: 389,
    comments: 65,
    isLiked: false,
    createTime: new Date(Date.now() - 21600000).toISOString(),
    location: '成都'
  }
])

// 热门攻略数据
const hotStrategies = ref([
  {
    id: '1',
    title: '原神新手必看：从零开始的提瓦特之旅',
    author: { name: '攻略大师' },
    views: 15420
  },
  {
    id: '2',
    title: '王者荣耀S32赛季上分指南：强势英雄推荐',
    author: { name: '电竞教练' },
    views: 12850
  },
  {
    id: '4',
    title: '英雄联盟中路对线技巧：如何掌控中路节奏',
    author: { name: '中路王者' },
    views: 11200
  },
  {
    id: '3',
    title: '和平精英枪械选择指南：不同场景的最佳武器',
    author: { name: '枪械专家' },
    views: 9870
  },
  {
    id: '5',
    title: '崩坏星穹铁道角色培养优先级指南',
    author: { name: '铁道专家' },
    views: 8650
  }
])

// 攻略作者排行
const topAuthors = ref([
  { id: '1', name: '攻略大师', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', strategyCount: 25 },
  { id: '2', name: '电竞教练', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', strategyCount: 18 },
  { id: '3', name: '中路王者', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4', strategyCount: 15 },
  { id: '4', name: '枪械专家', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', strategyCount: 12 },
  { id: '5', name: '铁道专家', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5', strategyCount: 10 }
])

// 游戏分类统计
const gameStats = ref([
  { game: '原神', count: 45 },
  { game: '王者荣耀', count: 38 },
  { game: '英雄联盟', count: 32 },
  { game: '和平精英', count: 28 },
  { game: '崩坏星穹铁道', count: 22 },
  { game: '明日方舟', count: 18 }
])

// 计算属性
const filteredStrategies = computed(() => {
  let filtered = mockStrategies.value

  // 搜索过滤
  if (searchQuery.value) {
    filtered = filtered.filter(strategy => 
      strategy.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      strategy.summary.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // 分类过滤
  if (currentFilter.value !== 'all') {
    filtered = filtered.filter(strategy => strategy.category === currentFilter.value)
  }

  // 游戏过滤
  if (selectedGames.value.length > 0) {
    filtered = filtered.filter(strategy => selectedGames.value.includes(strategy.game))
  }

  // 排序
  if (sortBy.value === 'latest') {
    filtered.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
  } else if (sortBy.value === 'hot') {
    filtered.sort((a, b) => (b.views + b.likes) - (a.views + a.likes))
  }

  totalStrategies.value = filtered.length
  return filtered
})

const paginatedStrategies = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredStrategies.value.slice(start, end)
})

// 方法
const toggleGame = (game: string) => {
  const index = selectedGames.value.indexOf(game)
  if (index > -1) {
    selectedGames.value.splice(index, 1)
  } else {
    selectedGames.value.push(game)
  }
}

const formatDate = (date: string) => {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 2592000000) return `${Math.floor(diff / 86400000)}天前`
  
  return d.toLocaleDateString()
}

const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

const viewStrategy = (strategy: any) => {
  console.log('查看攻略:', strategy)
  // 这里可以跳转到攻略详情页
}

const likeStrategy = (strategy: any) => {
  strategy.isLiked = !strategy.isLiked
  if (strategy.isLiked) {
    strategy.likes++
    ElMessage.success('点赞成功！')
  } else {
    strategy.likes--
    ElMessage.info('取消点赞')
  }
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

const goToUpload = () => {
  router.push('/strategy-upload')
}

const goToLogin = () => {
  showAiLoginModal.value = true
}

const goToProfile = () => {
  showProfileModal.value = true
}

const handleLoginSuccess = (userData: any) => {
  showAiLoginModal.value = false
  ElMessage.success('登录成功！')
  console.log('登录成功，用户信息:', userData)
  if (appHeaderRef.value) {
    appHeaderRef.value.updateUserState()
  }
}

const handleOpenPersonalCenter = () => {
  showPersonalCenterModal.value = true
}

onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.strategy-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.page-header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 60px;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin: 0 0 8px 0;
}

.page-subtitle {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.content-wrapper {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
}

.left-content {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-section {
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 15px;
}

.search-box {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #999;
  font-size: 16px;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
}

.search-input:focus {
  border-color: #667eea;
}

.sort-buttons {
  display: flex;
  gap: 8px;
}

.sort-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.sort-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.game-categories {
  margin-bottom: 15px;
}

.category-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.category-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.category-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.strategy-categories {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.strategy-category-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.strategy-category-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.strategy-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.strategy-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  cursor: pointer;
}

.strategy-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.strategy-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.strategy-card:hover .cover-img {
  transform: scale(1.05);
}

.strategy-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%);
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 12px;
}

.strategy-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.strategy-tag {
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.strategy-info {
  padding: 16px;
}

.strategy-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.strategy-summary {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.strategy-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.author-name {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

.strategy-location {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
}

.location-icon {
  font-size: 12px;
  color: #999;
}

.location-text {
  font-size: 12px;
  color: #999;
}

.strategy-date {
  font-size: 12px;
  color: #999;
}

.strategy-stats {
  display: flex;
  gap: 16px;
}

.stats-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #666;
}

.stats-item.clickable {
  cursor: pointer;
  transition: color 0.3s;
}

.stats-item.clickable:hover {
  color: #667eea;
}

.stats-icon {
  font-size: 14px;
}

.stats-icon.liked {
  color: #ff4757;
}

.stats-number {
  font-weight: 500;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.right-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
}

.hot-strategies {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hot-strategy-item {
  display: flex;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.hot-strategy-item:hover {
  background-color: #f8f9fa;
}

.hot-rank {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.hot-content {
  flex: 1;
}

.hot-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin: 0 0 4px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hot-meta {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #999;
}

.author-ranking {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.author-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.author-item:hover {
  background-color: #f8f9fa;
}

.author-rank {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.author-avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.author-info {
  flex: 1;
}

.author-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  display: block;
  margin-bottom: 2px;
}

.author-stats {
  font-size: 12px;
  color: #999;
}

.game-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.game-stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.game-stat-item:last-child {
  border-bottom: none;
}

.game-name {
  font-size: 14px;
  color: #333;
}

.game-count {
  font-size: 12px;
  color: #999;
  background: #f8f9fa;
  padding: 2px 8px;
  border-radius: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }
  
  .header-content {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .filter-row {
    flex-direction: column;
    gap: 10px;
  }
  
  .strategy-list {
    grid-template-columns: 1fr;
  }
  
  .main-content {
    padding: 10px;
  }
}
</style>
