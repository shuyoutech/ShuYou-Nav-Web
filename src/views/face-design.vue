<template>
  <div class="face-design-container">
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
          <FaIcon name="i-mdi:face-man" class="header-icon"/>
          <h1 class="page-title">捏脸专区</h1>
          <span class="page-subtitle">分享你的创意角色设计</span>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" @click="goToUpload">
            <FaIcon name="i-mdi:plus"/>
            上传捏脸
          </button>
        </div>
      </div>
    </div>

    <!-- 筛选和搜索区域 -->
    <div class="filter-section">
      <div class="filter-content">
        <!-- 第一排：热门游戏选择 -->
        <div class="game-selector">
          <div class="game-section">
            <span class="game-label">热门游戏</span>
            <div class="game-buttons">
              <button
                v-for="game in gameOptions"
                :key="game.id"
                :class="['game-btn', { active: selectedGames.includes(game.id) }]"
                @click="toggleGame(game.id)"
              >
                <img :src="game.icon" :alt="game.name" class="game-btn-icon"/>
                <span class="game-btn-text">{{ game.name }}</span>
              </button>
            </div>
          </div>
        </div>
        
        <!-- 第二排：分类筛选标签 -->
        <div class="category-selector">
          <div class="filter-tabs">
            <button
              v-for="tab in filterTabs"
              :key="tab.key"
              :class="['filter-tab', { active: currentFilter === tab.key }]"
              @click="currentFilter = tab.key"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>
        
        <!-- 第三排：搜索和排序 -->
        <div class="search-filter-row">
          <div class="search-box">
            <FaIcon name="i-mdi:magnify" class="search-icon"/>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索捏脸作品..."
              class="search-input"
              @input="handleSearch"
            />
          </div>
          <div class="sort-buttons">
            <button
              :class="['sort-btn', { active: sortBy === 'latest' }]"
              @click="sortBy = 'latest'"
            >
              <FaIcon name="i-mdi:clock-outline" class="sort-icon"/>
              <span>最新</span>
            </button>
            <button
              :class="['sort-btn', { active: sortBy === 'popular' }]"
              @click="sortBy = 'popular'"
            >
              <FaIcon name="i-mdi:fire" class="sort-icon"/>
              <span>最热</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <div class="content-wrapper">
        <!-- 左侧内容区 -->
        <div class="content-left">
          <!-- 作品网格 -->
          <div class="works-grid">
            <div
              v-for="work in filteredWorks"
              :key="work.id"
              class="work-card"
              @click="viewWork(work)"
            >
              <div class="work-image">
                <img :src="work.coverImage" :alt="work.title" class="cover-img"/>
                <div class="work-overlay">
                </div>
              </div>
              <div class="work-info">
                <h3 class="work-title">{{ work.title }}</h3>
                <div class="work-meta">
                  <div class="author-info">
                    <img :src="work.author.avatar" :alt="work.author.name" class="author-avatar"/>
                    <span class="author-name">{{ work.author.name }}</span>
                    <div class="work-location">
                      <FaIcon name="i-mdi:map-marker" class="location-icon"/>
                      <span class="location-text">{{ work.location }}</span>
                    </div>
                  </div>
                  <span class="work-date">{{ formatDate(work.createTime) }}</span>
                </div>
                <div class="work-tags-row">
                  <div class="work-tags">
                    <span
                      v-for="tag in work.tags.slice(0, 3)"
                      :key="tag"
                      class="work-tag"
                    >
                      {{ tag }}
                    </span>
                  </div>
                  <!-- 统计信息显示区域 -->
                  <div class="work-stats-display">
                    <div class="stats-item views">
                      <FaIcon name="i-mdi:eye" class="stats-icon"/>
                      <span class="stats-number">{{ formatNumber(work.views) }}</span>
                    </div>
                    <div class="stats-item likes clickable" @click.stop="likeWork(work)">
                      <FaIcon name="i-mdi:heart" :class="['stats-icon', { liked: work.isLiked }]"/>
                      <span class="stats-number">{{ formatNumber(work.likes) }}</span>
                    </div>
                    <div class="stats-item downloads">
                      <FaIcon name="i-mdi:download" class="stats-icon"/>
                      <span class="stats-number">{{ formatNumber(work.downloads) }}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div class="pagination">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :total="totalWorks"
              :page-sizes="[12, 24, 48]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>

        <!-- 右侧边栏 -->
        <div class="sidebar-right">
          <!-- 热门标签 -->
          <div class="sidebar-section">
            <h3>热门标签</h3>
            <div class="tag-cloud">
              <span
                v-for="tag in popularTags"
                :key="tag.name"
                class="tag-item"
                :style="{ fontSize: `${tag.size}px` }"
                @click="filterByTag(tag.name)"
              >
                {{ tag.name }}
              </span>
            </div>
          </div>

          <!-- 热门作者 -->
          <div class="sidebar-section">
            <h3>热门作者</h3>
            <div class="author-list">
              <div
                v-for="author in popularAuthors"
                :key="author.id"
                class="author-item"
                @click="viewAuthor(author)"
              >
                <img :src="author.avatar" :alt="author.name" class="author-avatar-small"/>
                <div class="author-details">
                  <span class="author-name-small">{{ author.name }}</span>
                  <span class="author-works">{{ author.worksCount }} 作品</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 最新评论 -->
          <div class="sidebar-section">
            <h3>最新评论</h3>
            <div class="comment-list">
              <div
                v-for="comment in recentComments"
                :key="comment.id"
                class="comment-item"
              >
                <div class="comment-content">{{ comment.content }}</div>
                <div class="comment-meta">
                  <span class="comment-author">{{ comment.author }}</span>
                  <span class="comment-time">{{ formatDate(comment.createTime) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 作品详情弹窗 -->
    <div v-if="selectedWork" class="work-modal" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="close-btn" @click="closeModal">
          <FaIcon name="i-mdi:close"/>
        </button>
        <div class="modal-body">
          <div class="modal-image">
            <img :src="selectedWork.coverImage" :alt="selectedWork.title" class="modal-img"/>
          </div>
          <div class="modal-info">
            <h2 class="modal-title">{{ selectedWork.title }}</h2>
            <div class="modal-author">
              <img :src="selectedWork.author.avatar" :alt="selectedWork.author.name" class="modal-author-avatar"/>
              <div class="modal-author-info">
                <span class="modal-author-name">{{ selectedWork.author.name }}</span>
                <span class="modal-author-level">{{ selectedWork.author.level }}</span>
              </div>
            </div>
            <div class="modal-description">
              {{ selectedWork.description }}
            </div>
            <div class="modal-stats">
              <div class="stat-item">
                <FaIcon name="i-mdi:eye"/>
                <span>{{ selectedWork.views }} 浏览</span>
              </div>
              <div class="stat-item">
                <FaIcon name="i-mdi:heart"/>
                <span>{{ selectedWork.likes }} 喜欢</span>
              </div>
              <div class="stat-item">
                <FaIcon name="i-mdi:download"/>
                <span>{{ selectedWork.downloads }} 下载</span>
              </div>
            </div>
            <div class="modal-actions">
              <button class="btn btn-primary" @click="downloadWork(selectedWork)">
                <FaIcon name="i-mdi:download"/>
                下载捏脸文件
              </button>
              <button class="btn btn-secondary" @click="likeWork(selectedWork)">
                <FaIcon name="i-mdi:heart" :class="{ liked: selectedWork.isLiked }"/>
                {{ selectedWork.isLiked ? '已喜欢' : '喜欢' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI登录模态框 -->
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

const selectedWork = ref<any>(null)

// 分页相关
const currentPage = ref(1)
const pageSize = ref(12)
const totalWorks = ref(0)

// 游戏选择相关
const selectedGames = ref<string[]>([])
const gameOptions = ref([
  {
    id: 'lost-ark',
    name: '命运方舟',
    icon: 'https://picsum.photos/24/24?random=100'
  },
  {
    id: 'genshin',
    name: '原神',
    icon: 'https://picsum.photos/24/24?random=101'
  },
  {
    id: 'honkai',
    name: '崩坏：星穹铁道',
    icon: 'https://picsum.photos/24/24?random=102'
  },
  {
    id: 'wow',
    name: '魔兽世界',
    icon: 'https://picsum.photos/24/24?random=103'
  },
  {
    id: 'ffxiv',
    name: '最终幻想XIV',
    icon: 'https://picsum.photos/24/24?random=104'
  },
  {
    id: 'black-desert',
    name: '黑色沙漠',
    icon: 'https://picsum.photos/24/24?random=105'
  },
  {
    id: 'bdo',
    name: '剑灵',
    icon: 'https://picsum.photos/24/24?random=106'
  },
  {
    id: 'tera',
    name: 'TERA',
    icon: 'https://picsum.photos/24/24?random=107'
  }
])

// 筛选标签
const filterTabs = [
  { key: 'all', label: '全部' },
  { key: 'female', label: '女性角色' },
  { key: 'male', label: '男性角色' },
  { key: 'fantasy', label: '奇幻风格' },
  { key: 'realistic', label: '写实风格' },
  { key: 'anime', label: '动漫风格' }
]

// 模拟作品数据
const works = ref([
  {
    id: '1',
    title: '精灵公主 - 月光下的守护者',
    description: '一个充满神秘色彩的精灵角色，银发如月光般闪耀，眼神深邃而温柔。',
    coverImage: 'https://picsum.photos/300/400?random=1',
    author: {
      id: '1',
      name: '设计师小王',
      avatar: 'https://picsum.photos/50/50?random=10',
      level: '高级设计师'
    },
    views: 1256,
    likes: 89,
    downloads: 234,
    isLiked: false,
    tags: ['精灵', '女性', '奇幻', '银发'],
    category: 'female',
    game: 'lost-ark',
    location: '北京·朝阳区',
    createTime: new Date().toISOString()
  },
  {
    id: '2',
    title: '暗黑骑士 - 深渊的守护者',
    description: '一个来自深渊的暗黑骑士，全身被黑色铠甲覆盖，散发着强大的黑暗力量。',
    coverImage: 'https://picsum.photos/300/400?random=2',
    author: {
      id: '2',
      name: '创意大师',
      avatar: 'https://picsum.photos/50/50?random=11',
      level: '大师级'
    },
    views: 2156,
    likes: 156,
    downloads: 445,
    isLiked: true,
    tags: ['骑士', '男性', '暗黑', '铠甲'],
    category: 'male',
    game: 'genshin',
    location: '上海·浦东新区',
    createTime: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '3',
    title: '魔法少女 - 星光守护者',
    description: '一个可爱的魔法少女，拥有粉色的长发和闪亮的魔法棒，充满青春活力。',
    coverImage: 'https://picsum.photos/300/400?random=3',
    author: {
      id: '3',
      name: '动漫达人',
      avatar: 'https://picsum.photos/50/50?random=12',
      level: '中级设计师'
    },
    views: 3456,
    likes: 267,
    downloads: 678,
    isLiked: false,
    tags: ['魔法少女', '女性', '动漫', '粉色'],
    category: 'female',
    game: 'honkai',
    location: '广州·天河区',
    createTime: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: '4',
    title: '龙族战士 - 火焰之怒',
    description: '一个拥有龙族血统的战士，能够操控火焰，拥有强大的战斗能力。',
    coverImage: 'https://picsum.photos/300/400?random=4',
    author: {
      id: '4',
      name: '龙族专家',
      avatar: 'https://picsum.photos/50/50?random=13',
      level: '高级设计师'
    },
    views: 1890,
    likes: 134,
    downloads: 289,
    isLiked: false,
    tags: ['龙族', '男性', '火焰', '战士'],
    category: 'male',
    game: 'wow',
    location: '深圳·南山区',
    createTime: new Date(Date.now() - 10800000).toISOString()
  },
  {
    id: '5',
    title: '森林精灵 - 自然之灵',
    description: '一个与自然和谐共生的森林精灵，拥有绿色的头发和自然的力量。',
    coverImage: 'https://picsum.photos/300/400?random=5',
    author: {
      id: '5',
      name: '自然艺术家',
      avatar: 'https://picsum.photos/50/50?random=14',
      level: '中级设计师'
    },
    views: 987,
    likes: 78,
    downloads: 156,
    isLiked: true,
    tags: ['精灵', '女性', '自然', '绿色'],
    category: 'female',
    game: 'ffxiv',
    location: '杭州·西湖区',
    createTime: new Date(Date.now() - 14400000).toISOString()
  },
  {
    id: '6',
    title: '机械战士 - 未来守护者',
    description: '一个来自未来的机械战士，拥有高科技装备和强大的战斗能力。',
    coverImage: 'https://picsum.photos/300/400?random=6',
    author: {
      id: '6',
      name: '科幻大师',
      avatar: 'https://picsum.photos/50/50?random=15',
      level: '大师级'
    },
    views: 2789,
    likes: 198,
    downloads: 456,
    isLiked: false,
    tags: ['机械', '男性', '科幻', '未来'],
    category: 'male',
    game: 'black-desert',
    location: '成都·锦江区',
    createTime: new Date(Date.now() - 18000000).toISOString()
  },
  {
    id: '7',
    title: '天使守护者 - 圣光之翼',
    description: '一个拥有圣光力量的天使角色，洁白的羽翼散发着神圣的光芒。',
    coverImage: 'https://picsum.photos/300/400?random=7',
    author: {
      id: '7',
      name: '神圣艺术家',
      avatar: 'https://picsum.photos/50/50?random=16',
      level: '高级设计师'
    },
    views: 1567,
    likes: 123,
    downloads: 234,
    isLiked: false,
    tags: ['天使', '女性', '神圣', '白色'],
    category: 'female',
    game: 'genshin',
    location: '南京·鼓楼区',
    createTime: new Date(Date.now() - 21600000).toISOString()
  },
  {
    id: '8',
    title: '恶魔领主 - 暗影之王',
    description: '一个强大的恶魔领主，掌控着暗影和火焰的力量。',
    coverImage: 'https://picsum.photos/300/400?random=8',
    author: {
      id: '8',
      name: '暗黑设计师',
      avatar: 'https://picsum.photos/50/50?random=17',
      level: '中级设计师'
    },
    views: 2345,
    likes: 167,
    downloads: 345,
    isLiked: true,
    tags: ['恶魔', '男性', '暗黑', '火焰'],
    category: 'male',
    game: 'wow',
    location: '武汉·江汉区',
    createTime: new Date(Date.now() - 25200000).toISOString()
  },
  {
    id: '9',
    title: '花仙子 - 春之精灵',
    description: '一个充满生机的花仙子，身边环绕着美丽的花朵和蝴蝶。',
    coverImage: 'https://picsum.photos/300/400?random=9',
    author: {
      id: '9',
      name: '自然之友',
      avatar: 'https://picsum.photos/50/50?random=18',
      level: '新手设计师'
    },
    views: 987,
    likes: 89,
    downloads: 156,
    isLiked: false,
    tags: ['花仙子', '女性', '自然', '花朵'],
    category: 'female',
    game: 'honkai',
    location: '西安·雁塔区',
    createTime: new Date(Date.now() - 28800000).toISOString()
  },
  {
    id: '10',
    title: '冰霜法师 - 寒冰掌控者',
    description: '一个精通冰霜魔法的法师，能够操控冰雪和寒冰的力量。',
    coverImage: 'https://picsum.photos/300/400?random=10',
    author: {
      id: '10',
      name: '冰霜专家',
      avatar: 'https://picsum.photos/50/50?random=19',
      level: '高级设计师'
    },
    views: 1876,
    likes: 145,
    downloads: 267,
    isLiked: false,
    tags: ['法师', '男性', '冰霜', '魔法'],
    category: 'male',
    game: 'ffxiv',
    location: '重庆·渝中区',
    createTime: new Date(Date.now() - 32400000).toISOString()
  },
  {
    id: '11',
    title: '猫娘女仆 - 可爱萌宠',
    description: '一个可爱的猫娘女仆，拥有猫耳朵和尾巴，充满萌系魅力。',
    coverImage: 'https://picsum.photos/300/400?random=11',
    author: {
      id: '11',
      name: '萌系大师',
      avatar: 'https://picsum.photos/50/50?random=20',
      level: '中级设计师'
    },
    views: 3456,
    likes: 289,
    downloads: 456,
    isLiked: true,
    tags: ['猫娘', '女性', '萌系', '女仆'],
    category: 'female',
    game: 'lost-ark',
    location: '天津·和平区',
    createTime: new Date(Date.now() - 36000000).toISOString()
  },
  {
    id: '12',
    title: '武士刀客 - 剑道大师',
    description: '一个精通剑道的武士，拥有精湛的剑术和武士精神。',
    coverImage: 'https://picsum.photos/300/400?random=12',
    author: {
      id: '12',
      name: '剑道宗师',
      avatar: 'https://picsum.photos/50/50?random=21',
      level: '大师级'
    },
    views: 2134,
    likes: 178,
    downloads: 312,
    isLiked: false,
    tags: ['武士', '男性', '剑道', '东方'],
    category: 'male',
    game: 'bdo',
    location: '苏州·姑苏区',
    createTime: new Date(Date.now() - 39600000).toISOString()
  }
])

// 热门标签
const popularTags = ref([
  { name: '精灵', size: 16 },
  { name: '女性', size: 14 },
  { name: '男性', size: 14 },
  { name: '奇幻', size: 12 },
  { name: '动漫', size: 12 },
  { name: '暗黑', size: 10 },
  { name: '魔法', size: 10 },
  { name: '战士', size: 8 },
  { name: '自然', size: 8 }
])

// 热门作者
const popularAuthors = ref([
  {
    id: '1',
    name: '设计师小王',
    avatar: 'https://picsum.photos/50/50?random=10',
    worksCount: 15
  },
  {
    id: '2',
    name: '创意大师',
    avatar: 'https://picsum.photos/50/50?random=11',
    worksCount: 23
  },
  {
    id: '3',
    name: '动漫达人',
    avatar: 'https://picsum.photos/50/50?random=12',
    worksCount: 18
  }
])

// 最新评论
const recentComments = ref([
  {
    id: '1',
    content: '这个精灵角色设计得太美了！',
    author: '用户A',
    createTime: new Date().toISOString()
  },
  {
    id: '2',
    content: '暗黑骑士的细节处理很棒',
    author: '用户B',
    createTime: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: '3',
    content: '魔法少女很可爱，下载了！',
    author: '用户C',
    createTime: new Date(Date.now() - 3600000).toISOString()
  }
])

// 计算属性
const filteredWorks = computed(() => {
  let result = works.value

  // 搜索过滤
  if (searchQuery.value) {
    result = result.filter(work =>
      work.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      work.tags.some(tag => tag.toLowerCase().includes(searchQuery.value.toLowerCase()))
    )
  }

  // 分类过滤
  if (currentFilter.value !== 'all') {
    result = result.filter(work => work.category === currentFilter.value)
  }

  // 游戏过滤
  if (selectedGames.value.length > 0) {
    result = result.filter(work => selectedGames.value.includes(work.game))
  }

  // 排序
  switch (sortBy.value) {
    case 'latest':
      result = result.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
      break
    case 'popular':
      result = result.sort((a, b) => b.likes - a.likes)
      break
    case 'downloads':
      result = result.sort((a, b) => b.downloads - a.downloads)
      break
    case 'rating':
      result = result.sort((a, b) => b.views - a.views)
      break
  }

  // 更新总数
  totalWorks.value = result.length

  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return result.slice(start, end)
})

// 方法
const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

const filterByTag = (tagName: string) => {
  searchQuery.value = tagName
}

const viewWork = (work: any) => {
  selectedWork.value = work
}

const closeModal = () => {
  selectedWork.value = null
}

const downloadWork = (work: any) => {
  ElMessage.success(`开始下载 ${work.title}`)
  // 这里可以添加实际的下载逻辑
}

const likeWork = (work: any) => {
  work.isLiked = !work.isLiked
  if (work.isLiked) {
    work.likes++
    ElMessage.success('已添加到喜欢列表')
  } else {
    work.likes--
    ElMessage.info('已取消喜欢')
  }
}

const viewAuthor = (author: any) => {
  ElMessage.info(`查看作者 ${author.name} 的作品`)
  // 这里可以跳转到作者页面
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1 // 重置到第一页
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 2592000000) return `${Math.floor(diff / 86400000)}天前`

  return date.toLocaleDateString()
}

const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

const goToUpload = () => {
  router.push('/face-upload')
}

// 弹窗状态
const showAiLoginModal = ref(false)
const showProfileModal = ref(false)
const showPersonalCenterModal = ref(false)

const goToLogin = () => {
  // 显示登录弹窗
  showAiLoginModal.value = true
}

const goToProfile = () => {
  // 显示个人中心弹窗
  showProfileModal.value = true
}

const handleLoginSuccess = (userData: any) => {
  showAiLoginModal.value = false
  ElMessage.success('登录成功！')
  console.log('登录成功，用户信息:', userData)
  // 更新AppHeader组件的用户状态
  if (appHeaderRef.value) {
    appHeaderRef.value.updateUserState()
  }
}

const handleOpenPersonalCenter = () => {
  showPersonalCenterModal.value = true
}

// 游戏选择相关方法
const toggleGame = (gameId: string) => {
  const index = selectedGames.value.indexOf(gameId)
  if (index > -1) {
    selectedGames.value.splice(index, 1)
  } else {
    selectedGames.value.push(gameId)
  }
}

onMounted(() => {
  // 初始化数据
  // 这里可以检查用户登录状态
})
</script>

<style scoped>
.face-design-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}



.page-header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 60px;
  z-index: 99;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  font-size: 32px;
  color: #409eff;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.page-subtitle {
  font-size: 14px;
  color: #666;
  background: #f0f9ff;
  padding: 4px 12px;
  border-radius: 12px;
  border: 1px solid #b3d8ff;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.filter-section {
  background: white;
  border-bottom: 1px solid #e4e7ed;
  padding: 20px 0;
}

.filter-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-filter-row {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 0.5;
  min-width: 200px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #909399;
  font-size: 18px;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: #fafafa;
}

.search-input:focus {
  outline: none;
  border-color: #409eff;
  background: white;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

.filter-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 8px 16px;
  border: 1px solid #dcdfe6;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  color: #606266;
}

.filter-tab.active,
.filter-tab:hover {
  background: #409eff;
  color: white;
  border-color: #409eff;
}



/* 游戏选择按钮样式 */
.game-selector {
  display: flex;
  align-items: center;
}

.game-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.game-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
}

.game-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.game-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #dcdfe6;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.game-btn:hover {
  background: #f5f7fa;
  border-color: #c0c4cc;
}

.game-btn.active {
  background: #409eff;
  color: white;
  border-color: #409eff;
}

.game-btn-icon {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  object-fit: cover;
}

.game-btn-text {
  font-size: 14px;
  font-weight: 500;
}

/* 分类选择器样式 */
.category-selector {
  display: flex;
  align-items: center;
}

/* 排序按钮样式 */
.sort-buttons {
  display: flex;
  align-items: center;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  overflow: hidden;
  background: white;
}

.sort-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  background: white;
  color: #909399;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  border-right: 1px solid #dcdfe6;
}

.sort-btn:last-child {
  border-right: none;
}

.sort-btn:hover {
  background: #f5f7fa;
  color: #606266;
}

.sort-btn.active {
  background: #f0f9ff;
  color: #409eff;
}

.sort-icon {
  font-size: 16px;
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

.content-left {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.works-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.work-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.work-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.work-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.work-card:hover .cover-img {
  transform: scale(1.05);
}

.work-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 12px;
}

.work-card:hover .work-overlay {
  opacity: 1;
}





.work-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.action-btn {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.action-btn .liked {
  color: #f56c6c;
}

.work-info {
  padding: 16px;
  position: relative;
}

.work-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.work-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.author-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.author-name {
  font-size: 12px;
  color: #666;
}

.work-date {
  font-size: 12px;
  color: #999;
}

/* 标签和统计信息行样式 */
.work-tags-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.work-tags {
  display: flex;
  gap: 6px;
  flex-wrap: nowrap;
  flex: 1;
  overflow: hidden;
}

.work-tag {
  padding: 2px 8px;
  background: #f0f9ff;
  color: #409eff;
  border-radius: 10px;
  font-size: 11px;
  border: 1px solid #b3d8ff;
}

/* 统计信息显示区域样式 */
.work-stats-display {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.stats-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  color: white;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  min-width: 50px;
  justify-content: center;
}

.stats-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 100%);
  pointer-events: none;
}

.stats-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
}

/* 浏览数样式 */
.stats-item.views {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4);
}

/* 点赞数样式 */
.stats-item.likes {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  box-shadow: 0 4px 15px rgba(250, 112, 154, 0.4);
}

.stats-item.clickable {
  cursor: pointer;
  transition: all 0.3s ease;
}

.stats-item.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
}

.stats-icon.liked {
  color: #ff4757;
  animation: heartBeat 0.6s ease-in-out;
}

/* 下载数样式 */
.stats-item.downloads {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  box-shadow: 0 4px 15px rgba(168, 237, 234, 0.4);
}

.stats-icon {
  font-size: 12px;
  opacity: 0.9;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
  position: relative;
  z-index: 1;
}

.stats-number {
  font-size: 11px;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.3px;
  position: relative;
  z-index: 1;
}

/* 位置信息样式 */
.work-location {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  background: #f0f9ff;
  border-radius: 4px;
  border: 1px solid #b3d8ff;
}

.location-icon {
  font-size: 10px;
  color: #409eff;
}

.location-text {
  font-size: 10px;
  color: #409eff;
  font-weight: 500;
}

/* 右下角点赞按钮样式 */
.corner-like {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
}

.corner-like:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.like-icon {
  font-size: 16px;
  color: #999;
  transition: all 0.3s ease;
}

.like-icon.liked {
  color: #ff4757;
  animation: heartBeat 0.6s ease-in-out;
}

@keyframes heartBeat {
  0% {
    transform: scale(1);
  }
  14% {
    transform: scale(1.3);
  }
  28% {
    transform: scale(1);
  }
  42% {
    transform: scale(1.3);
  }
  70% {
    transform: scale(1);
  }
}

.pagination {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.sidebar-right {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.sidebar-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f9ff;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  padding: 4px 12px;
  background: #f8f9fa;
  color: #666;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
}

.tag-item:hover {
  background: #409eff;
  color: white;
  border-color: #409eff;
}

.author-list {
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
  transition: background-color 0.3s ease;
}

.author-item:hover {
  background: #f8f9fa;
}

.author-avatar-small {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.author-name-small {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.author-works {
  font-size: 12px;
  color: #666;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-item {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid #409eff;
}

.comment-content {
  font-size: 14px;
  color: #333;
  line-height: 1.4;
  margin-bottom: 8px;
}

.comment-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

.work-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

.modal-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
}

.modal-image {
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.modal-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-info {
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.modal-author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-author-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.modal-author-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.modal-author-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.modal-author-level {
  font-size: 12px;
  color: #409eff;
  background: #f0f9ff;
  padding: 2px 8px;
  border-radius: 10px;
  width: fit-content;
}

.modal-description {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.modal-stats {
  display: flex;
  gap: 20px;
}

.modal-stats .stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #409eff, #337ecc);
  color: white;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
}

.btn-secondary {
  background: white;
  color: #606266;
  border: 2px solid #dcdfe6;
}

.btn-secondary:hover {
  background: #f5f7fa;
  border-color: #c0c4cc;
}

@media (max-width: 768px) {
  .bbs-header .header-content {
    padding: 0 10px;
  }
  
  .bbs-header .logo {
    margin-left: 0;
  }
  
  .bbs-header .nav-menu {
    display: none;
  }
  
  .page-header {
    top: 60px;
  }
  
  .content-wrapper {
    grid-template-columns: 1fr;
  }
  
  .header-content {
    flex-direction: column;
    height: auto;
    padding: 16px 20px;
    gap: 16px;
  }
  
  .filter-content {
    gap: 12px;
  }
  
  .search-filter-row {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .search-box {
    min-width: auto;
  }
  
  .sort-buttons {
    justify-content: center;
  }
  
  .sort-btn {
    flex: 1;
    justify-content: center;
  }
  
  .game-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .category-selector {
    justify-content: flex-start;
  }
  
  .game-label {
    font-size: 13px;
  }
  
  .game-buttons {
    gap: 6px;
  }
  
  .game-btn {
    padding: 6px 12px;
    font-size: 13px;
  }
  
  .game-btn-icon {
    width: 18px;
    height: 18px;
  }
  
  .works-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
  }
  
  .modal-body {
    grid-template-columns: 1fr;
  }
  
  .modal-info {
    padding: 20px;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>
