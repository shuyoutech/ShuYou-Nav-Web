<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="50%"
    class="ai-login-modal"
    :style="dialogStyle"
  >
    <div class="login-page">
      <!-- 关闭按钮 -->
      <button class="close-btn" @click="handleClose">
        <FaIcon name="i-mdi:close"/>
      </button>

      <!-- 左侧功能展示区 -->
      <div class="left-section">
        <div class="content">
          <h1 class="title">Hello, 欢迎登录数游论坛</h1>
          <p class="subtitle">更多精彩等你来发现</p>

          <!-- 3D螺旋图形 -->
          <div class="spiral-container">
            <div class="spiral">
              <div class="ring ring-1"></div>
              <div class="ring ring-2"></div>
              <div class="ring ring-3"></div>
              <div class="ring ring-4"></div>
              <div class="ring ring-5"></div>
              <div class="ring ring-6"></div>
            </div>
          </div>

          <!-- AI功能按钮 -->
          <div class="ai-features">
            <div
              v-for="feature in aiFeatures"
              :key="feature.name"
              class="feature-btn"
              :class="feature.position"
            >
              <FaIcon :name="feature.icon" class="feature-icon"/>
              <span>{{ feature.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧登录面板 -->
      <div class="right-section">
        <div class="login-panel">
          <div class="brand">
            <div class="logo">
              <FaIcon name="i-mdi:brain" class="logo-icon"/>
            </div>
            <h2 class="brand-name">数游论坛</h2>
          </div>

          <div class="login-tabs">
            <button
              class="tab-btn"
              :class="{ active: loginType === 'wechat' }"
              @click="getQrCode"
            >
              微信登录
            </button>
            <button
              class="tab-btn"
              :class="{ active: loginType === 'phone' }"
              @click="loginType = 'phone'"
            >
              手机登录
            </button>
          </div>

          <div v-if="loginType === 'wechat'" class="wechat-login">
            <div class="qr-container">
              <div class="qr-code">
                <div v-show="qrCodeUrl" class="code-box">
                  <iframe
                    :src="qrCodeUrl"
                    :style="{ width: '100%', height: '100%' }"
                    class="wechat-iframe"
                  />
                </div>
                <div v-show="!qrCodeUrl" class="qr-placeholder">
                  <FaIcon name="i-mdi:qrcode" class="qr-icon"/>
                  <span>点击上方按钮获取二维码</span>
                </div>
              </div>
            </div>
            <div class="qr-instructions">
              <div class="instruction-item">
                <FaIcon name="i-mdi:wechat" class="wechat-icon"/>
                <span>打开【手机微信】扫一扫登录更方便</span>
              </div>
            </div>
          </div>

          <div v-if="loginType === 'phone'" class="phone-login">
            <form @submit="onPhoneSubmit">
              <div class="form-item">
                <input
                  type="tel"
                  placeholder="请输入手机号"
                  class="phone-input"
                  v-model="phoneForm.phone"
                />
              </div>

              <div class="form-item">
                <div class="code-input-group">
                  <input
                    type="text"
                    placeholder="请输入验证码"
                    class="code-input"
                    v-model="phoneForm.code"
                  />
                  <button
                    type="button"
                    class="send-code-btn"
                    @click="sendSms"
                  >
                    发送验证码
                  </button>
                </div>
              </div>

              <button
                :disabled="loading"
                class="login-btn"
                type="submit"
              >
                {{ loading ? '登录中...' : '登录' }}
              </button>
            </form>
          </div>

          <div class="terms">
            <p>欢迎使用数游论坛,您登录即同意</p>
            <div class="terms-links">
              <a href="#" class="term-link">《用户协议》</a>
              <span>和</span>
              <a href="#" class="term-link">《隐私政策》</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue'
import {ElMessage} from 'element-plus'
import {authAuthorize, authSendSms} from '@/api/auth'
import {useShareStore} from "@/store/modules/share.ts";
import {useUserStore} from "@/store/modules/user.ts";

interface Props {
  visible: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void

  (e: 'login-success', userData: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loading = ref(false)
const loginType = ref<'wechat' | 'phone'>('wechat')
const qrCodeUrl = ref('')

// 计算对话框样式
const dialogStyle = computed(() => ({
  height: '60vh',
  maxHeight: '60vh',
  marginTop: '20vh',
  borderRadius: '16px',
  boxShadow: 'none'
}))

const phoneForm = ref({
  phone: '',
  code: '',
})

const aiFeatures = [
  {name: '游戏攻略', icon: 'i-mdi:gamepad-variant', position: 'top'},
  {name: '游戏论坛', icon: 'i-mdi:book-open-variant', position: 'bottom-left'},
  {name: '游戏捏脸', icon: 'i-mdi:face-man', position: 'top-left'},
  {name: '游戏商城', icon: 'i-mdi:store', position: 'top-right'},
  {name: '游戏公会', icon: 'i-mdi:account-group', position: 'bottom-right'},
]

watch(
  () => props.visible,
  (newVal) => {
    console.log("visible =========== newVal:", newVal)
    if (newVal) {
      getQrCode()
    }
  });


const shareStore = useShareStore()
const userStore = useUserStore()

watch(
  () => shareStore.code,
  (newValue) => {
    alert("code:" + newValue)
    console.log("accessToken =========== code:", newValue)
    if (newValue) {
      userStore.accessToken({
        code: newValue,
      }).then(() => {
        emit('login-success', userStore.userInfo)
        handleClose() // 登录成功后关闭登录弹窗
      }).catch((error) => {
        console.error('微信登录失败:', error)
        ElMessage.error('微信登录失败，请重试')
      })
    }
  }
);

const onPhoneSubmit = async (e: Event) => {
  e.preventDefault()
  if (!phoneForm.value.phone || !phoneForm.value.code) {
    ElMessage.error('请填写完整的手机号和验证码')
    return
  }
  loading.value = true
  await userStore.smsLogin({
    mobile: phoneForm.value.phone,
    code: phoneForm.value.code,
  })
  emit('login-success', userStore.userInfo)
  handleClose()
  loading.value = false
}

const sendSms = async () => {
  const phone = phoneForm.value.phone
  if (!phone) {
    ElMessage.error('请输入手机号')
    return
  }
  await authSendSms({
    mobile: phone,
    templateCode: 'SMS_491995068'
  })
  ElMessage.success('验证码已发送')
}

const handleClose = () => {
  emit('update:visible', false)
}

// 获取二维码url,展示二维码图片
const getQrCode = async () => {
  loginType.value = 'wechat'
  try {
    const response = await authAuthorize({
      socialType: '01',
      callBackSuffix: 'local/wechat/callback',
    })
    if (response.data) {
      qrCodeUrl.value = response.data
      console.log("getQrCode =========== qrCodeUrl:", qrCodeUrl.value)
    } else {
      ElMessage.error('获取二维码失败')
    }
  } catch (error) {
    ElMessage.error('获取二维码失败，请重试')
  }
}
</script>

<style>
/* 全局样式强制覆盖对话框高度 - 使用更高优先级 */
html body .el-dialog.ai-login-modal {
  height: 600px !important;
  max-height: 600px !important;
  width: 1000px !important;
  max-width: 1000px !important;
  border-radius: 16px !important;
  box-shadow: none !important;
  border: none !important;
  background: transparent !important;
  overflow: visible !important;
  outline: none !important;
}

/* 移除所有可能的红色调试框 */
* {
  outline: none !important;
}

*:focus {
  outline: none !important;
  box-shadow: none !important;
}

html body .el-dialog.ai-login-modal .el-dialog__body {
  height: 600px !important;
  max-height: 600px !important;
  background: transparent !important;
  overflow: hidden !important;
  border-radius: 16px !important;
}

html body .el-dialog.ai-login-modal .el-dialog__header {
  display: none !important;
}

html body .el-dialog.ai-login-modal .el-dialog__wrapper {
  background: transparent !important;
}

/* 强制覆盖移动端样式 */
@media (max-width: 1200px) {
  html body .el-dialog.ai-login-modal {
    height: 500px !important;
    max-height: 500px !important;
    width: 90vw !important;
    max-width: 90vw !important;
    border-radius: 16px !important;
    box-shadow: none !important;
    border: none !important;
    background: transparent !important;
    overflow: hidden !important;
  }

  html body .el-dialog.ai-login-modal .el-dialog__body {
    height: 500px !important;
    max-height: 500px !important;
    background: transparent !important;
    overflow: hidden !important;
    border-radius: 16px !important;
  }

  html body .el-dialog.ai-login-modal .el-dialog__wrapper {
    background: transparent !important;
  }
}

@media (max-width: 768px) {
  html body .el-dialog.ai-login-modal {
    height: 80vh !important;
    max-height: 80vh !important;
    width: 95vw !important;
    max-width: 95vw !important;
  }

  html body .el-dialog.ai-login-modal .el-dialog__body {
    height: 80vh !important;
    max-height: 80vh !important;
  }
}
</style>

<style scoped>
.ai-login-modal :deep(.el-dialog) {
  margin: 20vh auto !important;
  height: 600px !important;
  max-width: 1000px !important;
  width: 1000px !important;
  border-radius: 16px !important;
  overflow: hidden !important;
  box-shadow: none !important;
  border: none !important;
  background: transparent !important;
}

.ai-login-modal :deep(.el-dialog__header) {
  display: none !important;
}

.ai-login-modal :deep(.el-dialog__wrapper) {
  background: transparent !important;
}

.ai-login-modal :deep(.el-dialog__body) {
  padding: 0;
  height: 600px;
  overflow: hidden;
  border-radius: 16px;
}

/* 强制覆盖对话框高度 */
.ai-login-modal :deep(.el-dialog) {
  height: 600px !important;
  max-height: 600px !important;
  width: 1000px !important;
  max-width: 1000px !important;
  border-radius: 16px !important;
  box-shadow: none !important;
  border: none !important;
  overflow: hidden !important;
}

.ai-login-modal :deep(.el-dialog__body) {
  height: 600px !important;
  max-height: 600px !important;
  overflow: hidden !important;
  border-radius: 16px !important;
}

.login-page {
  display: flex;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a3a 50%, #2d1b69 100%);
  overflow: hidden;
  position: relative;
  backdrop-filter: blur(20px);
  border-radius: 16px;
}

/* 左侧功能展示区 */
.left-section {
  flex: 2;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  position: relative;
  background: linear-gradient(135deg, #1a1a3a 0%, #2d1b69 50%, #4c1d95 100%);
  position: relative;
  overflow: visible;
  padding: 2rem 0 5rem 0;
  border-radius: 16px 0 0 16px;
}

.left-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.4) 0%, transparent 50%),
  radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.4) 0%, transparent 50%),
  radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%),
  radial-gradient(circle at 60% 60%, rgba(139, 92, 246, 0.2) 0%, transparent 50%);
  pointer-events: none;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

.content {
  text-align: center;
  z-index: 1;
  position: relative;
  margin-top: 5px;
  padding-bottom: 1rem;
}

.title {
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 30px rgba(255, 255, 255, 0.4);
  background: linear-gradient(135deg, #ffffff 0%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    filter: drop-shadow(0 0 10px rgba(168, 85, 247, 0.5));
  }
  to {
    filter: drop-shadow(0 0 20px rgba(168, 85, 247, 0.8));
  }
}

.subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
  font-weight: 300;
  letter-spacing: 0.5px;
}

/* 3D螺旋图形 */
.spiral-container {
  width: 200px;
  height: 200px;
  margin: 0 auto 0.25rem;
  position: relative;
}

.spiral {
  position: relative;
  width: 100%;
  height: 100%;
  animation: rotate 20s linear infinite;
}

.ring {
  position: absolute;
  border: 3px solid;
  border-radius: 50%;
  animation: pulse 3s ease-in-out infinite alternate;
  box-shadow: 0 0 20px currentColor;
}

.ring-1 {
  width: 60px;
  height: 60px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-color: #8b5cf6;
  animation-delay: 0s;
}

.ring-2 {
  width: 120px;
  height: 120px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-color: #a855f7;
  animation-delay: 0.5s;
}

.ring-3 {
  width: 180px;
  height: 180px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-color: #c084fc;
  animation-delay: 1s;
}

.ring-4 {
  width: 240px;
  height: 240px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-color: #d8b4fe;
  animation-delay: 1.5s;
}

.ring-5 {
  width: 300px;
  height: 300px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-color: #e9d5ff;
  animation-delay: 2s;
}

.ring-6 {
  width: 360px;
  height: 360px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-color: #f3e8ff;
  animation-delay: 2.5s;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0% {
    opacity: 0.3;
    box-shadow: 0 0 20px currentColor;
  }
  100% {
    opacity: 1;
    box-shadow: 0 0 40px currentColor;
  }
}

/* AI功能按钮 */
.ai-features {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 0.8rem;
  width: 320px;
  margin: auto;
  padding: 1rem;
  max-height: 200px;
  overflow: visible;
}

.feature-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  padding: 0.5rem 0.6rem;
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.4);
  border-radius: 16px;
  color: white;
  font-size: 0.7rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(15px);
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.2);
  min-height: 80px;
  justify-content: center;
}

.feature-btn:hover {
  background: rgba(139, 92, 246, 0.25);
  border-color: rgba(139, 92, 246, 0.6);
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 15px 30px rgba(139, 92, 246, 0.4);
}

.feature-icon {
  font-size: 1.2rem;
  color: #a855f7;
  filter: drop-shadow(0 0 8px rgba(168, 85, 247, 0.6));
}

/* 网格定位 - 3+2布局 */
.feature-btn {
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

.feature-btn:nth-child(1) {
  grid-column: 1;
  grid-row: 1;
  animation-delay: 0.1s;
}

.feature-btn:nth-child(2) {
  grid-column: 2;
  grid-row: 1;
  animation-delay: 0.2s;
}

.feature-btn:nth-child(3) {
  grid-column: 3;
  grid-row: 1;
  animation-delay: 0.3s;
}

.feature-btn:nth-child(4) {
  grid-column: 1;
  grid-row: 2;
  animation-delay: 0.4s;
}

.feature-btn:nth-child(5) {
  grid-column: 2;
  grid-row: 2;
  animation-delay: 0.5s;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 右侧登录面板 */
.right-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(25px);
  min-width: 400px;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0 16px 16px 0;
  overflow: hidden;
}

.login-panel {
  width: 100%;
  max-width: 380px;
  padding: 0.5rem 1rem 0.5rem;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: auto;
  justify-content: center;
  padding-top: 2rem;
}

.close-btn {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 1000;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

.brand {
  text-align: center;
  margin-bottom: 0.5rem;
  flex-shrink: 0;
}

.logo {
  width: 60px;
  height: 60px;
  margin: 0 auto 0.75rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
  position: relative;
  overflow: hidden;
}

.logo::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: shine 3s infinite;
}

@keyframes shine {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}

.logo-icon {
  font-size: 2.2rem;
  color: white;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
}

.brand-name {
  font-size: 1.4rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.25rem;
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
}

.brand-slogan {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
}

.login-tabs {
  display: flex;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 0.25rem;
  flex-shrink: 0;
}

.tab-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  border-radius: 8px;
  font-weight: 500;
}

.tab-btn.active {
  color: white;
  background: rgba(139, 92, 246, 0.2);
  box-shadow: 0 2px 10px rgba(139, 92, 246, 0.3);
}

.wechat-login {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  flex: 1;
  width: 100%;
  padding: 1rem 0;
}

.qr-container {
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.qr-code {
  width: 200px;
  height: 200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.code-box {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.code-box iframe {
  width: 100% !important;
  height: 100% !important;
  border-radius: 16px;
}

.wechat-iframe {
  border: none;
  border-radius: 16px;
  width: 100% !important;
  height: 100% !important;
}


.qr-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  height: 100%;
  gap: 0.5rem;
}

.qr-icon {
  font-size: 3rem;
  color: rgba(255, 255, 255, 0.4);
}

.qr-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.qr-instructions {
  color: white;
  text-align: center;
  margin-top: 0;
}

.instruction-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}

.wechat-icon {
  color: #07c160;
  font-size: 1.25rem;
}

.get-qr-btn {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(7, 193, 96, 0.2);
  border: 1px solid rgba(7, 193, 96, 0.3);
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.get-qr-btn:hover {
  background: rgba(7, 193, 96, 0.3);
  border-color: rgba(7, 193, 96, 0.5);
}

.proxy-notice {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
}

.phone-login {
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 200px;
  width: 100%;
  flex: 1;
  padding: 0.5rem 0;
}

.form-item {
  margin-bottom: 0.75rem;
  width: 100%;
}

.phone-input,
.code-input {
  width: 100%;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: white;
  backdrop-filter: blur(15px);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.phone-input::placeholder,
.code-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.phone-input:focus,
.code-input:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.3);
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-1px);
}

.code-input-group {
  display: flex;
  gap: 0.75rem;
  width: 100%;
}

.code-input {
  flex: 1;
}

.send-code-btn {
  white-space: nowrap;
  padding: 14px 18px;
  background: rgba(139, 92, 246, 0.25);
  border: 1px solid rgba(139, 92, 246, 0.4);
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  backdrop-filter: blur(10px);
}

.send-code-btn:hover {
  background: rgba(139, 92, 246, 0.3);
  border-color: rgba(139, 92, 246, 0.5);
}

.login-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
  position: relative;
  overflow: hidden;
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.login-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(59, 130, 246, 0.6);
}

.login-btn:hover:not(:disabled)::before {
  left: 100%;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.terms {
  margin-top: 30px;
  text-align: center;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  width: 100%;
  flex-shrink: 0;
}

.terms-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  margin-top: 0.25rem;
}

.term-link {
  color: #8b5cf6;
  text-decoration: none;
  transition: color 0.3s ease;
}

.term-link:hover {
  color: #a855f7;
  text-decoration: underline;
}

@media (max-width: 1200px) {
  .ai-login-modal :deep(.el-dialog) {
    width: 90vw !important;
    height: 500px !important;
    margin: 20vh auto !important;
    border-radius: 16px !important;
    box-shadow: none !important;
    border: none !important;
    overflow: hidden !important;
  }
}

@media (max-width: 768px) {
  .ai-login-modal :deep(.el-dialog) {
    width: 95vw !important;
    height: 80vh !important;
    margin: 10vh auto !important;
    border-radius: 16px !important;
    box-shadow: none !important;
    border: none !important;
    overflow: hidden !important;
  }

  .login-page {
    flex-direction: column;
  }

  .left-section {
    flex: 1;
    min-height: 45vh;
  }

  .right-section {
    flex: 1;
    min-width: auto;
  }

  .title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .spiral-container {
    width: 150px;
    height: 150px;
  }

  .ai-features {
    width: 280px;
    gap: 0.6rem;
    padding: 0.8rem;
    max-height: 180px;
  }

  .feature-btn {
    font-size: 0.7rem;
    padding: 0.6rem 0.8rem;
  }

  .login-panel {
    max-width: 320px;
    padding: 0.75rem;
  }

  .qr-code {
    width: 150px;
    height: 150px;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 1.5rem;
  }

  .ai-features {
    width: 250px;
    gap: 0.5rem;
    padding: 0.6rem;
    max-height: 160px;
  }

  .feature-btn {
    font-size: 0.65rem;
    padding: 0.5rem 0.7rem;
  }
}
</style>
