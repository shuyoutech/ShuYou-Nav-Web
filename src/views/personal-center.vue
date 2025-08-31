<template>
  <div v-if="visible" class="personal-center-container" @click.stop>
    <!-- 关闭按钮 -->
    <button class="close-btn" @click="emit('update:visible', false)">
      <FaIcon name="i-mdi:close"/>
    </button>

    <!-- 顶部用户信息栏 -->
    <div class="top-bar">
      <div class="user-info">
        <div class="user-avatar">
          <img :src="getUserAvatar()" :alt="getUserNickname()"/>
        </div>
        <div class="user-details">
          <h2 class="username">{{ getUserNickname() }}</h2>
          <p class="user-motto">我还没有签名的习惯哟</p>
        </div>
      </div>
      <div class="user-stats">
        <span class="followers">0 被关注</span>
        <div class="user-dropdown">
          <div class="dropdown-avatar">
            <img :src="getUserAvatar()" :alt="getUserNickname()"/>
          </div>
          <div class="dropdown-menu">
            <div class="dropdown-item">
              <span>{{ getUserNickname() }}</span>
            </div>
            <div class="dropdown-item" @click="handlePersonalCenter">
              <span>个人中心</span>
              <FaIcon name="i-mdi:chevron-right" class="arrow-icon"/>
            </div>
            <div class="dropdown-item" @click="handleLogout">
              <FaIcon name="i-mdi:logout" class="logout-icon"/>
              <span>退出登录</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧导航菜单 -->
      <div class="sidebar">
        <div class="nav-menu">
          <div 
            v-for="item in menuItems" 
            :key="item.key"
            :class="['nav-item', { active: activeMenu === item.key }]"
            @click="setActiveMenu(item.key)"
          >
            <FaIcon :name="item.icon" class="nav-icon"/>
            <span>{{ item.label }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧内容区域 -->
      <div class="content-area">
        <div v-if="!hasContent" class="empty-content">
          <div class="empty-icon">
            <FaIcon name="i-mdi:emoticon-happy" class="happy-icon"/>
          </div>
          <p class="empty-text">暂无数据</p>
        </div>
        <div v-else class="content-data">
          <!-- 这里可以显示具体的内容 -->
          <p>内容区域</p>
        </div>
      </div>
    </div>

    <!-- 发布按钮 -->
    <div class="publish-btn">
      <FaIcon name="i-mdi:plus" class="plus-icon"/>
      <span>发布</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

interface Props {
  visible: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const userStore = useUserStore()

// 响应式数据
const activeMenu = ref('activity')
const hasContent = ref(false)

// 菜单项数据
const menuItems = ref([
  { key: 'activity', label: '我的动态', icon: 'i-mdi:timeline' },
  { key: 'works', label: '我的作品', icon: 'i-mdi:palette' },
  { key: 'replies', label: '回复我的', icon: 'i-mdi:reply' },
  { key: 'likes', label: '收到的赞', icon: 'i-mdi:heart' },
  { key: 'mentions', label: '@我的', icon: 'i-mdi:at' },
  { key: 'fans', label: '我的粉丝', icon: 'i-mdi:account-group' },
  { key: 'recent', label: '最近访问', icon: 'i-mdi:clock' },
  { key: 'total', label: '总访问', icon: 'i-mdi:chart-line' }
])

// 默认头像
const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=DM'

// 获取用户头像
const getUserAvatar = () => {
  const avatar = userStore.avatar || userStore.userInfo?.avatar
  return avatar || defaultAvatar
}

// 获取用户昵称
const getUserNickname = () => {
  const nickname = userStore.userInfo?.nickname || userStore.userInfo?.name
  return nickname || 'Mr Yang'
}

// 设置活动菜单
const setActiveMenu = (key: string) => {
  activeMenu.value = key
  // 这里可以根据不同的菜单项加载不同的内容
  hasContent.value = false // 暂时都显示暂无数据
}

// 处理个人中心
const handlePersonalCenter = () => {
  ElMessage.info('个人中心功能开发中...')
}

// 处理退出登录
const handleLogout = () => {
  userStore.logout()
  ElMessage.success('已退出登录')
  emit('update:visible', false)
}

</script>

<style scoped>
/* 主容器 */
.personal-center-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f5f5f5;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 关闭按钮 */
.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(0, 0, 0, 0.1);
  color: #666;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.2);
  color: #333;
  transform: scale(1.1);
}

/* 顶部用户信息栏 */
.top-bar {
  background: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #ddd;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.username {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.user-motto {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.user-stats {
  display: flex;
  align-items: center;
  gap: 16px;
}

.followers {
  font-size: 14px;
  color: #666;
}

.user-dropdown {
  position: relative;
  cursor: pointer;
}

.dropdown-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #ddd;
}

.dropdown-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  min-width: 160px;
  z-index: 100;
  display: none;
}

.user-dropdown:hover .dropdown-menu {
  display: block;
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.arrow-icon {
  font-size: 12px;
  color: #999;
}

.logout-icon {
  font-size: 14px;
  color: #ef4444;
  margin-right: 8px;
}

/* 主要内容区域 */
.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧导航菜单 */
.sidebar {
  width: 200px;
  background: white;
  border-right: 1px solid #e0e0e0;
  padding: 20px 0;
}

.nav-menu {
  display: flex;
  flex-direction: column;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: #f8f9fa;
  color: #333;
}

.nav-item.active {
  background: #f0f9ff;
  color: #409eff;
  border-left-color: #409eff;
  font-weight: 500;
}

.nav-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

/* 右侧内容区域 */
.content-area {
  flex: 1;
  background: #f5f5f5;
  padding: 20px;
  overflow-y: auto;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 400px;
}

.empty-icon {
  font-size: 64px;
  color: #4ade80;
  margin-bottom: 16px;
}

.happy-icon {
  font-size: 64px;
}

.empty-text {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.content-data {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 发布按钮 */
.publish-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: #8b5cf6;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  transition: all 0.3s ease;
  z-index: 100;
}

.publish-btn:hover {
  background: #7c3aed;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
}

.plus-icon {
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    padding: 15px;
  }
  
  .user-info {
    gap: 12px;
  }
  
  .user-avatar {
    width: 40px;
    height: 40px;
  }
  
  .username {
    font-size: 16px;
  }
  
  .sidebar {
    width: 160px;
  }
  
  .nav-item {
    padding: 10px 15px;
    font-size: 13px;
  }
  
  .content-area {
    padding: 15px;
  }
  
  .publish-btn {
    bottom: 20px;
    right: 20px;
    padding: 10px 16px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .top-bar {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .user-stats {
    align-self: flex-end;
  }
  
  .sidebar {
    width: 140px;
  }
  
  .nav-item {
    padding: 8px 12px;
    font-size: 12px;
  }
  
  .nav-icon {
    font-size: 14px;
  }
}
</style>
