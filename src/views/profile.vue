<template>
  <div v-if="visible" class="profile-popup" @click.stop>
    <!-- 关闭按钮 -->
    <button class="close-btn" @click="emit('update:visible', false)">
      <FaIcon name="i-mdi:close"/>
    </button>

    <!-- 用户头像和姓名 -->
    <div class="user-section">
      <div class="user-avatar">
        <img :src="getUserAvatar()" :alt="getUserNickname()"/>
      </div>
      <h2 class="username">{{ getUserNickname() }}</h2>
    </div>

    <!-- 账户绑定选项 -->
    <div class="binding-section">
      <!-- 个人中心选项 -->
      <div class="binding-item" @click="handlePersonalCenter">
        <div class="binding-left">
          <FaIcon name="i-mdi:account" class="binding-icon"/>
          <span>个人中心</span>
        </div>
        <FaIcon name="i-mdi:chevron-right" class="arrow-icon"/>
      </div>

      <div class="binding-item" @click="handlePhoneBinding">
        <div class="binding-left">
          <FaIcon name="i-mdi:phone" class="binding-icon"/>
          <span>绑定手机</span>
        </div>
        <FaIcon name="i-mdi:chevron-right" class="arrow-icon"/>
      </div>

      <div class="binding-item">
        <div class="binding-left">
          <FaIcon name="i-mdi:wechat" class="binding-icon wechat-icon"/>
          <span>绑定微信</span>
        </div>
        <span class="bound-text">已绑定</span>
      </div>
    </div>

    <!-- 退出登录按钮 -->
    <div class="logout-section">
      <button class="logout-btn" @click="handleLogout">
        退出登录
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

interface Props {
  visible: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'open-personal-center'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const userStore = useUserStore()

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
  return nickname || 'DM'
}

// 处理手机绑定
const handlePhoneBinding = () => {
  ElMessage.info('手机绑定功能开发中...')
}

// 处理个人中心
const handlePersonalCenter = () => {
  emit('open-personal-center')
  emit('update:visible', false)
}

// 处理退出登录
const handleLogout = () => {
  userStore.logout()
  ElMessage.success('已退出登录')
  emit('update:visible', false)
}

</script>

<style scoped>
/* 弹窗主体 */
.profile-popup {
  position: fixed;
  top: 80px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 24px;
  width: 320px;
  max-width: 90vw;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

/* 关闭按钮 */
.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
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
  background: rgba(0, 0, 0, 0.15);
  color: #333;
  transform: scale(1.1);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

.profile-popup::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  pointer-events: none;
}

/* 用户头像和姓名 */
.user-section {
  text-align: center;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.user-avatar {
  width: 80px;
  height: 80px;
  margin: 0 auto 12px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  position: relative;
}

.user-avatar::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #8b5cf6, #a855f7, #c084fc, #8b5cf6);
  border-radius: 50%;
  z-index: -1;
  animation: rotate 3s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.username {
  color: #333;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  text-shadow: none;
}

/* 账户绑定选项 */
.binding-section {
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.binding-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.binding-item:last-child {
  border-bottom: none;
}

.binding-item:hover {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  padding-left: 8px;
  padding-right: 8px;
}

.binding-left {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #333;
  font-size: 14px;
}

.binding-icon {
  font-size: 18px;
  color: #8b5cf6;
}

.wechat-icon {
  color: #07c160;
}

.arrow-icon {
  font-size: 16px;
  color: rgba(0, 0, 0, 0.4);
}

.bound-text {
  color: #07c160;
  font-size: 12px;
  font-weight: 600;
}

/* 退出登录按钮 */
.logout-section {
  text-align: center;
  position: relative;
  z-index: 1;
}

.logout-btn {
  background: transparent;
  border: none;
  color: #ef4444;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  transform: translateY(-1px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-popup {
    top: 70px;
    right: 15px;
    width: 300px;
    padding: 20px;
  }

  .user-avatar {
    width: 70px;
    height: 70px;
  }

  .username {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .profile-popup {
    top: 60px;
    right: 10px;
    width: 280px;
    padding: 16px;
  }

  .user-avatar {
    width: 60px;
    height: 60px;
  }

  .username {
    font-size: 16px;
  }

  .binding-left {
    font-size: 13px;
  }
}
</style>
