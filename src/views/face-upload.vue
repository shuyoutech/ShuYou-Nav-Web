<template>
  <div class="face-upload-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <FaIcon name="i-mdi:file-document-edit" class="header-icon"/>
          <h1 class="page-title">发布帖子</h1>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" @click="goBack">返回</button>
          <button class="btn btn-primary" @click="publishPost" :disabled="!canPublish">
            {{ isPublishing ? '发布中...' : '发布' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <div class="form-container">
        <!-- 标题输入 -->
        <div class="form-section">
          <label class="form-label">标题</label>
          <div class="title-input-wrapper">
            <input
              v-model="formData.title"
              type="text"
              class="title-input"
              placeholder="填写合适标题可以获得更多曝光哦"
              maxlength="30"
              @input="validateTitle"
            />
            <span class="char-counter">{{ formData.title.length }}/30</span>
          </div>
          <div v-if="titleError" class="error-message">{{ titleError }}</div>
        </div>

        <!-- 内容编辑器 -->
        <div class="form-section">
          <label class="form-label">内容</label>
          <div class="editor-container">
            <!-- 富文本编辑器工具栏 -->
            <div class="editor-toolbar">
              <button class="toolbar-btn" @click="formatText('bold')" :class="{ active: formats.bold }">
                <FaIcon name="i-mdi:format-bold"/>
              </button>
              <div class="font-size-selector">
                <select v-model="formats.fontSize" class="font-size-select">
                  <option value="12px">12px</option>
                  <option value="14px">14px</option>
                  <option value="16px">16px</option>
                  <option value="18px">18px</option>
                  <option value="20px">20px</option>
                </select>
              </div>
              <button class="toolbar-btn" @click="formatText('alignLeft')" :class="{ active: formats.alignLeft }">
                <FaIcon name="i-mdi:format-align-left"/>
              </button>
              <button class="toolbar-btn" @click="formatText('alignCenter')" :class="{ active: formats.alignCenter }">
                <FaIcon name="i-mdi:format-align-center"/>
              </button>
              <button class="toolbar-btn" @click="formatText('alignRight')" :class="{ active: formats.alignRight }">
                <FaIcon name="i-mdi:format-align-right"/>
              </button>
              <button class="toolbar-btn" @click="formatText('justify')" :class="{ active: formats.justify }">
                <FaIcon name="i-mdi:format-align-justify"/>
              </button>
              <button class="toolbar-btn" @click="formatText('orderedList')">
                <FaIcon name="i-mdi:format-list-numbered"/>
              </button>
              <button class="toolbar-btn" @click="formatText('bulletList')">
                <FaIcon name="i-mdi:format-list-bulleted"/>
              </button>
              <button class="toolbar-btn" @click="insertImage">
                <FaIcon name="i-mdi:image"/>
              </button>
              <button class="toolbar-btn" @click="insertLink">
                <FaIcon name="i-mdi:link"/>
              </button>
            </div>
            <!-- 编辑器内容区域 -->
            <div
              ref="editorContent"
              class="editor-content"
              contenteditable="true"
              @input="handleContentInput"
              @paste="handlePaste"
              data-placeholder="正文输入最少11个字哦"
            ></div>
          </div>
          <div v-if="contentError" class="error-message">{{ contentError }}</div>
        </div>

        <!-- 板块选择 -->
        <div class="form-section">
          <label class="form-label">板块</label>
          <div class="section-selector">
            <select v-model="formData.section" class="section-select">
              <option value="">请选择板块</option>
              <option value="face-design">捏脸专区</option>
              <option value="strategy">攻略分享</option>
              <option value="discussion">讨论交流</option>
              <option value="showcase">作品展示</option>
            </select>
            <FaIcon name="i-mdi:chevron-down" class="select-arrow"/>
          </div>
        </div>

        <!-- 捏脸文件上传 -->
        <div class="form-section">
          <label class="form-label">捏脸文件</label>
          <div class="file-upload-wrapper">
            <button class="file-select-btn" @click="selectFaceFile">
              <FaIcon name="i-mdi:file-upload"/>
              选择文件
            </button>
            <span class="file-status">
              {{ selectedFaceFile ? selectedFaceFile.name : '未选择任何文件' }}
            </span>
          </div>
          <div class="file-instructions">
            <p>请在以下地址提取需要上传的cus文件:</p>
            <p class="file-path">游戏所在盘/WeGameApps/rail apps/命运方舟(2000811)/EFGame /Customizing</p>
          </div>
          <input
            ref="faceFileInput"
            type="file"
            accept=".cus"
            @change="handleFaceFileChange"
            style="display: none"
          />
        </div>

        <!-- 捏脸封面上传 -->
        <div class="form-section">
          <label class="form-label">捏脸封面</label>
          <div class="cover-upload-wrapper">
            <div class="upload-instructions">
              <p>1. 封面需清晰并契合捏脸角色主题,好的封面有利于获得更多曝光;</p>
              <p>2. 封面图支持JPG、JPEG、PNG; 200kb以内,建议图片尺寸:524×446或262×223;</p>
            </div>
            <div class="cover-upload-area" @click="selectCoverImage" @dragover.prevent @drop="handleDrop">
              <div v-if="!coverImagePreview" class="upload-placeholder">
                <FaIcon name="i-mdi:plus" class="upload-icon"/>
                <span>点击上传</span>
              </div>
              <div v-else class="cover-preview">
                <img :src="coverImagePreview" alt="封面预览" class="preview-image"/>
                <button class="remove-cover" @click.stop="removeCover">
                  <FaIcon name="i-mdi:close"/>
                </button>
              </div>
            </div>
            <input
              ref="coverImageInput"
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              @change="handleCoverImageChange"
              style="display: none"
            />
          </div>
        </div>

        <!-- 发布按钮 -->
        <div class="form-actions">
          <button class="btn btn-secondary" @click="saveDraft">保存草稿</button>
          <button class="btn btn-primary" @click="publishPost" :disabled="!canPublish || isPublishing">
            {{ isPublishing ? '发布中...' : '发布帖子' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 表单数据
const formData = ref({
  title: '',
  content: '',
  section: 'face-design'
})

// 编辑器状态
const formats = ref({
  bold: false,
  fontSize: '16px',
  alignLeft: true,
  alignCenter: false,
  alignRight: false,
  justify: false
})

// 文件上传状态
const selectedFaceFile = ref<File | null>(null)
const coverImagePreview = ref<string>('')
const coverImageFile = ref<File | null>(null)

// 验证状态
const titleError = ref('')
const contentError = ref('')

// 发布状态
const isPublishing = ref(false)

// 引用
const editorContent = ref<HTMLElement>()
const faceFileInput = ref<HTMLInputElement>()
const coverImageInput = ref<HTMLInputElement>()

// 计算属性
const canPublish = computed(() => {
  return formData.value.title.length >= 5 && 
         formData.value.content.length >= 11 && 
         formData.value.section && 
         selectedFaceFile.value && 
         coverImageFile.value
})

// 方法
const validateTitle = () => {
  if (formData.value.title.length < 5) {
    titleError.value = '标题至少需要5个字符'
  } else if (formData.value.title.length > 30) {
    titleError.value = '标题不能超过30个字符'
  } else {
    titleError.value = ''
  }
}

const handleContentInput = (event: Event) => {
  const target = event.target as HTMLElement
  formData.value.content = target.innerText
  
  if (formData.value.content.length < 11) {
    contentError.value = '正文内容至少需要11个字符'
  } else {
    contentError.value = ''
  }
}

const formatText = (format: string) => {
  document.execCommand(format, false)
  updateFormatState()
}

const updateFormatState = () => {
  formats.value.bold = document.queryCommandState('bold')
  formats.value.alignLeft = document.queryCommandState('justifyLeft')
  formats.value.alignCenter = document.queryCommandState('justifyCenter')
  formats.value.alignRight = document.queryCommandState('justifyRight')
  formats.value.justify = document.queryCommandState('justifyFull')
}

const insertImage = () => {
  const url = prompt('请输入图片URL:')
  if (url) {
    document.execCommand('insertImage', false, url)
  }
}

const insertLink = () => {
  const url = prompt('请输入链接URL:')
  if (url) {
    document.execCommand('createLink', false, url)
  }
}

const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const text = event.clipboardData?.getData('text/plain')
  if (text) {
    document.execCommand('insertText', false, text)
  }
}

const selectFaceFile = () => {
  faceFileInput.value?.click()
}

const handleFaceFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    if (file.name.endsWith('.cus')) {
      selectedFaceFile.value = file
      ElMessage.success('捏脸文件选择成功')
    } else {
      ElMessage.error('请选择.cus格式的捏脸文件')
    }
  }
}

const selectCoverImage = () => {
  coverImageInput.value?.click()
}

const handleCoverImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    if (validateImageFile(file)) {
      coverImageFile.value = file
      const reader = new FileReader()
      reader.onload = (e) => {
        coverImagePreview.value = e.target?.result as string
      }
      reader.readAsDataURL(file)
      ElMessage.success('封面图片选择成功')
    }
  }
}

const validateImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
  if (!validTypes.includes(file.type)) {
    ElMessage.error('请选择JPG、JPEG或PNG格式的图片')
    return false
  }
  if (file.size > 200 * 1024) {
    ElMessage.error('图片大小不能超过200KB')
    return false
  }
  return true
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    if (validateImageFile(file)) {
      coverImageFile.value = file
      const reader = new FileReader()
      reader.onload = (e) => {
        coverImagePreview.value = e.target?.result as string
      }
      reader.readAsDataURL(file)
      ElMessage.success('封面图片上传成功')
    }
  }
}

const removeCover = () => {
  coverImagePreview.value = ''
  coverImageFile.value = null
  if (coverImageInput.value) {
    coverImageInput.value.value = ''
  }
}

const saveDraft = () => {
  // 保存草稿逻辑
  ElMessage.success('草稿保存成功')
}

const publishPost = async () => {
  if (!canPublish.value) {
    ElMessage.error('请完善所有必填信息')
    return
  }

  isPublishing.value = true
  
  try {
    // 模拟发布过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    ElMessage.success('帖子发布成功！')
    router.push('/')
  } catch (error) {
    ElMessage.error('发布失败，请重试')
  } finally {
    isPublishing.value = false
  }
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  // 设置默认板块
  formData.value.section = 'face-design'
})
</script>

<style scoped>
.face-upload-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.page-header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  font-size: 24px;
  color: #409eff;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.form-container {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 30px;
}

.form-label {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.title-input-wrapper {
  position: relative;
}

.title-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: #fafafa;
}

.title-input:focus {
  outline: none;
  border-color: #409eff;
  background: white;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

.char-counter {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #909399;
}

.editor-container {
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
  flex-wrap: wrap;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid #dcdfe6;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #606266;
}

.toolbar-btn:hover {
  background: #f5f7fa;
  border-color: #409eff;
  color: #409eff;
}

.toolbar-btn.active {
  background: #409eff;
  border-color: #409eff;
  color: white;
}

.font-size-selector {
  position: relative;
}

.font-size-select {
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 14px;
}

.editor-content {
  min-height: 200px;
  padding: 16px;
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  outline: none;
}

.editor-content:empty:before {
  content: attr(data-placeholder);
  color: #c0c4cc;
  pointer-events: none;
}

.section-selector {
  position: relative;
}

.section-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  font-size: 16px;
  background: #fafafa;
  cursor: pointer;
  appearance: none;
  transition: all 0.3s ease;
}

.section-select:focus {
  outline: none;
  border-color: #409eff;
  background: white;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

.select-arrow {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #909399;
  pointer-events: none;
}

.file-upload-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.file-select-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.file-select-btn:hover {
  background: #337ecc;
  transform: translateY(-1px);
}

.file-status {
  color: #606266;
  font-size: 14px;
}

.file-instructions {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.file-instructions p {
  margin: 0 0 8px 0;
  color: #606266;
  font-size: 14px;
}

.file-path {
  font-family: 'Courier New', monospace;
  background: #e9ecef;
  padding: 8px 12px;
  border-radius: 4px;
  color: #495057;
}

.cover-upload-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.upload-instructions {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #67c23a;
}

.upload-instructions p {
  margin: 0 0 8px 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.cover-upload-area {
  width: 100%;
  height: 200px;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.cover-upload-area:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #909399;
}

.upload-icon {
  font-size: 48px;
  color: #c0c4cc;
}

.cover-preview {
  position: relative;
  width: 100%;
  height: 100%;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.remove-cover {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.remove-cover:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
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

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
}

.btn-primary:disabled {
  background: #c0c4cc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
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

.error-message {
  color: #f56c6c;
  font-size: 14px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

@media (max-width: 768px) {
  .main-content {
    padding: 10px;
  }
  
  .form-container {
    padding: 20px;
  }
  
  .header-content {
    padding: 0 10px;
  }
  
  .page-title {
    font-size: 18px;
  }
  
  .editor-toolbar {
    gap: 4px;
    padding: 8px 12px;
  }
  
  .toolbar-btn {
    width: 32px;
    height: 32px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
