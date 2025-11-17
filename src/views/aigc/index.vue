<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { ElTree } from 'element-plus'
import { queryHotDataApi } from '@/api/api'
import type { NavWebsiteVo } from '@/api/nav/types'

// 树形节点接口定义
interface TreeNode {
  id: string
  label: string
  icon?: string
  parentId?: string
  level: number
  children?: TreeNode[]
}

// 子分类数据结构
interface SubCategoryData {
  name: string
  children: NavWebsiteVo[]
}

// AIGC分类树形结构（参考aigc.cn）
const categoryTreeData = ref<TreeNode[]>([
  {
    id: 'recommend',
    label: 'AIGC工具推荐',
    icon: 'i-mdi:star',
    level: 1,
  },
  {
    id: 'writing',
    label: 'AIGC写作平台',
    icon: 'i-mdi:file-document-edit',
    level: 1,
    children: [
      { id: 'writing-tools', label: 'AI写作工具', parentId: 'writing', level: 2 },
      { id: 'writing-paper', label: 'AI论文写作', parentId: 'writing', level: 2 },
      { id: 'writing-check', label: 'AI论文查重', parentId: 'writing', level: 2 },
      { id: 'writing-reduce', label: '降AIGC率', parentId: 'writing', level: 2 },
      { id: 'writing-detect', label: 'AIGC检测', parentId: 'writing', level: 2 },
      { id: 'writing-summary', label: 'AI总结摘要', parentId: 'writing', level: 2 },
      { id: 'writing-prompt', label: 'AI提示词', parentId: 'writing', level: 2 },
      { id: 'writing-read', label: 'AI阅读', parentId: 'writing', level: 2 },
      { id: 'writing-doc', label: 'AI公文', parentId: 'writing', level: 2 },
      { id: 'writing-novel', label: 'AI小说', parentId: 'writing', level: 2 },
      { id: 'writing-bid', label: 'AI标书写作', parentId: 'writing', level: 2 },
      { id: 'writing-xiaohongshu', label: 'AI小红书文案', parentId: 'writing', level: 2 },
    ],
  },
  {
    id: 'image',
    label: 'AIGC图像生成',
    icon: 'i-mdi:image',
    level: 1,
    children: [
      { id: 'image-paint', label: 'AI绘画工具', parentId: 'image', level: 2 },
      { id: 'image-book', label: 'AI绘本', parentId: 'image', level: 2 },
      { id: 'image-photo', label: 'AI证件照生成', parentId: 'image', level: 2 },
      { id: 'image-material', label: 'AI素材', parentId: 'image', level: 2 },
      { id: 'image-plugin', label: 'PS·AI插件', parentId: 'image', level: 2 },
      { id: 'image-3d', label: 'AI-3D生成', parentId: 'image', level: 2 },
      { id: 'image-prompt', label: 'AI绘画提示词', parentId: 'image', level: 2 },
      { id: 'image-community', label: 'AI绘画社区', parentId: 'image', level: 2 },
      { id: 'image-model', label: 'AI绘画模型', parentId: 'image', level: 2 },
      { id: 'image-manga', label: 'AI漫画翻译', parentId: 'image', level: 2 },
    ],
  },
  {
    id: 'video',
    label: 'AIGC视频创作',
    icon: 'i-mdi:video',
    level: 1,
    children: [
      { id: 'video-generate', label: 'AI视频生成', parentId: 'video', level: 2 },
      { id: 'video-human', label: 'AI数字人', parentId: 'video', level: 2 },
      { id: 'video-face', label: 'AI换脸', parentId: 'video', level: 2 },
      { id: 'video-drama', label: 'AI短剧', parentId: 'video', level: 2 },
      { id: 'video-edit', label: 'AI视频后期', parentId: 'video', level: 2 },
      { id: 'video-motion', label: 'AI动作捕捉', parentId: 'video', level: 2 },
      { id: 'video-model', label: 'AI视频模型', parentId: 'video', level: 2 },
      { id: 'video-subtitle', label: 'AI字幕翻译', parentId: 'video', level: 2 },
      { id: 'video-image2video', label: '图片转视频', parentId: 'video', level: 2 },
      { id: 'video-anime', label: 'AI动漫视频', parentId: 'video', level: 2 },
      { id: 'video-life', label: 'AI数字生命', parentId: 'video', level: 2 },
    ],
  },
  {
    id: 'office',
    label: 'AIGC办公效率',
    icon: 'i-mdi:briefcase',
    level: 1,
    children: [
      { id: 'office-ppt', label: 'AI生成PPT', parentId: 'office', level: 2 },
      { id: 'office-resume', label: 'AI简历制作', parentId: 'office', level: 2 },
      { id: 'office-chart', label: 'AI图表', parentId: 'office', level: 2 },
      { id: 'office-photo', label: 'AI证件照', parentId: 'office', level: 2 },
      { id: 'office-excel', label: 'AI电子表格', parentId: 'office', level: 2 },
      { id: 'office-doc', label: 'AI文档处理', parentId: 'office', level: 2 },
      { id: 'office-mind', label: 'AI思维导图', parentId: 'office', level: 2 },
      { id: 'office-translate', label: 'AI翻译', parentId: 'office', level: 2 },
      { id: 'office-meeting', label: 'AI会议助理', parentId: 'office', level: 2 },
      { id: 'office-plugin', label: 'AI浏览器插件', parentId: 'office', level: 2 },
      { id: 'office-layout', label: 'AI排版', parentId: 'office', level: 2 },
      { id: 'office-survey', label: 'AI调查问卷', parentId: 'office', level: 2 },
      { id: 'office-domain', label: 'AI域名', parentId: 'office', level: 2 },
      { id: 'office-report', label: 'AI研报', parentId: 'office', level: 2 },
    ],
  },
  {
    id: 'chat',
    label: 'AIGC智能对话',
    icon: 'i-mdi:chat',
    level: 1,
    children: [
      { id: 'chat-assistant', label: 'AI智能助手', parentId: 'chat', level: 2 },
      { id: 'chat-search', label: 'AI搜索引擎', parentId: 'chat', level: 2 },
      { id: 'chat-dialog', label: 'AI聊天对话', parentId: 'chat', level: 2 },
      { id: 'chat-qa', label: 'AI问答', parentId: 'chat', level: 2 },
      { id: 'chat-role', label: 'AI角色扮演', parentId: 'chat', level: 2 },
      { id: 'chat-girlfriend', label: 'AI女友', parentId: 'chat', level: 2 },
      { id: 'chat-animal', label: 'AI动物语言转换', parentId: 'chat', level: 2 },
    ],
  },
  {
    id: 'design',
    label: 'AIGC商业设计',
    icon: 'i-mdi:palette',
    level: 1,
    children: [
      { id: 'design-tools', label: 'AI设计工具', parentId: 'design', level: 2 },
      { id: 'design-product', label: 'AI商品图', parentId: 'design', level: 2 },
      { id: 'design-cutout', label: 'AI抠图', parentId: 'design', level: 2 },
      { id: 'design-photo', label: 'AI写真(证件照)', parentId: 'design', level: 2 },
      { id: 'design-expand', label: 'AI图像扩展', parentId: 'design', level: 2 },
      { id: 'design-process', label: 'AI图像处理', parentId: 'design', level: 2 },
      { id: 'design-logo', label: 'AI标志设计', parentId: 'design', level: 2 },
      { id: 'design-space', label: 'AI空间设计', parentId: 'design', level: 2 },
      { id: 'design-clothing', label: 'AI服装设计', parentId: 'design', level: 2 },
      { id: 'design-font', label: 'AI字体设计', parentId: 'design', level: 2 },
      { id: 'design-jewelry', label: 'AI珠宝设计', parentId: 'design', level: 2 },
      { id: 'design-poster', label: 'AI海报设计', parentId: 'design', level: 2 },
      { id: 'design-qrcode', label: 'AI艺术二维码', parentId: 'design', level: 2 },
      { id: 'design-avatar', label: 'AI头像', parentId: 'design', level: 2 },
      { id: 'design-annotation', label: 'AI智能标注', parentId: 'design', level: 2 },
    ],
  },
  {
    id: 'music',
    label: 'AIGC音乐语音',
    icon: 'i-mdi:music',
    level: 1,
    children: [
      { id: 'music-voice', label: 'AI语音生成（配音）', parentId: 'music', level: 2 },
      { id: 'music-generate', label: 'AI音乐生成', parentId: 'music', level: 2 },
      { id: 'music-recognize', label: 'AI语音识别', parentId: 'music', level: 2 },
      { id: 'music-synthesis', label: 'AI语音合成', parentId: 'music', level: 2 },
      { id: 'music-process', label: 'AI音频处理', parentId: 'music', level: 2 },
      { id: 'music-interpret', label: 'AI同声传译', parentId: 'music', level: 2 },
    ],
  },
  {
    id: 'model',
    label: 'AI大模型平台',
    icon: 'i-mdi:brain',
    level: 1,
    children: [
      { id: 'model-llm', label: 'AI大语言模型', parentId: 'model', level: 2 },
      { id: 'model-multimodal', label: 'AI多模态大模型', parentId: 'model', level: 2 },
      { id: 'model-vision', label: 'AI视觉大模型', parentId: 'model', level: 2 },
      { id: 'model-video', label: 'AI视频大模型', parentId: 'model', level: 2 },
      { id: 'model-voice', label: 'AI语音大模型', parentId: 'model', level: 2 },
      { id: 'model-industry', label: 'AI行业大模型', parentId: 'model', level: 2 },
      { id: 'model-overseas', label: 'AI海外大模型', parentId: 'model', level: 2 },
      { id: 'model-eval', label: 'AI大模型评测', parentId: 'model', level: 2 },
    ],
  },
  {
    id: 'agent',
    label: 'AI智能体平台',
    icon: 'i-mdi:robot',
    level: 1,
    children: [
      { id: 'agent-platform', label: 'Agents开发平台', parentId: 'agent', level: 2 },
    ],
  },
  {
    id: 'development',
    label: 'AIGC开发平台',
    icon: 'i-mdi:code-tags',
    level: 1,
    children: [
      { id: 'dev-tools', label: 'AI编程工具', parentId: 'development', level: 2 },
      { id: 'dev-open', label: 'AI开源项目', parentId: 'development', level: 2 },
      { id: 'dev-course', label: 'AI开发课堂', parentId: 'development', level: 2 },
      { id: 'dev-framework', label: 'AI开发框架', parentId: 'development', level: 2 },
      { id: 'dev-platform', label: 'AI开放平台', parentId: 'development', level: 2 },
      { id: 'dev-community', label: 'AI开发者社区', parentId: 'development', level: 2 },
      { id: 'dev-lowcode', label: 'AI低(无)代码编程', parentId: 'development', level: 2 },
      { id: 'dev-sql', label: 'AI-SQL数据库', parentId: 'development', level: 2 },
      { id: 'dev-train', label: 'AI训练模型', parentId: 'development', level: 2 },
      { id: 'dev-international', label: 'AI国际导航', parentId: 'development', level: 2 },
    ],
  },
])

// 当前选中的分类ID
const selectedCategoryId = ref<string>('recommend')
const categoryData = ref<Record<string, SubCategoryData[]>>({})
const loading = ref<Record<string, boolean>>({})
const searchKeyword = ref('')
const treeRef = ref<InstanceType<typeof ElTree> | null>(null)
const defaultExpandedKeys = ref<string[]>([])

// 收集所有一级节点的ID（用于默认展开）
function collectFirstLevelIds(nodes: TreeNode[]): string[] {
  const ids: string[] = []
  nodes.forEach((node) => {
    if (node.level === 1) {
      ids.push(node.id)
    }
  })
  return ids
}

// Element Tree 节点点击事件
function handleNodeClick(data: TreeNode) {
  if (data.id) {
    selectCategory(data.id)
  }
}

// 加载分类数据
async function loadCategoryData(categoryId: string) {
  if (categoryData.value[categoryId]) {
    return // 已加载过，直接返回
  }

  loading.value[categoryId] = true
  try {
    // 使用现有的API接口获取数据
    const response = await queryHotDataApi(`aigc_${categoryId}`)
    const data = Array.isArray(response?.data) ? response.data : []
    
    // 如果接口返回的是两层结构，直接使用
    if (data.length > 0 && data[0].name && data[0].children) {
      categoryData.value[categoryId] = data
    } else {
      // 否则转换为标准格式
      categoryData.value[categoryId] = [{
        name: '推荐工具',
        children: data
      }]
    }
  } catch (error) {
    console.error(`加载${categoryId}分类数据失败:`, error)
    categoryData.value[categoryId] = []
  } finally {
    loading.value[categoryId] = false
  }
}

// 选择分类
function selectCategory(categoryId: string) {
  selectedCategoryId.value = categoryId
  loadCategoryData(categoryId)
  
  // 定位到右侧对应的分类列表
  nextTick(() => {
    setTimeout(() => {
      const rightCard = document.querySelector(`[data-category-id="${categoryId}"]`) as HTMLElement
      if (rightCard) {
        const rightContainer = rightCard.closest('.aigc-websites-list') as HTMLElement
        if (rightContainer) {
          const cardOffsetTop = rightCard.getBoundingClientRect().top - rightContainer.getBoundingClientRect().top + rightContainer.scrollTop
          const containerPadding = parseInt(getComputedStyle(rightContainer).paddingTop) || 24
          
          rightContainer.scrollTo({
            top: Math.max(0, cardOffsetTop - containerPadding),
            behavior: 'smooth'
          })
          
          // 添加高亮效果
          rightCard.classList.add('highlight-category')
          setTimeout(() => {
            rightCard.classList.remove('highlight-category')
          }, 2000)
        }
      }
    }, 150)
  })
}

// 打开网址
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

// 当前分类的数据
const currentCategoryData = computed(() => {
  if (!selectedCategoryId.value) return []
  return categoryData.value[selectedCategoryId.value] || []
})

// 当前分类信息
const currentCategoryInfo = computed(() => {
  function findCategory(nodes: TreeNode[], id: string): TreeNode | null {
    for (const node of nodes) {
      if (node.id === id) return node
      if (node.children) {
        const found = findCategory(node.children, id)
        if (found) return found
      }
    }
    return null
  }
  return findCategory(categoryTreeData.value, selectedCategoryId.value)
})

// 过滤后的数据（支持搜索）
const filteredData = computed(() => {
  if (!searchKeyword.value.trim()) {
    return currentCategoryData.value
  }

  const keyword = searchKeyword.value.toLowerCase()
  return currentCategoryData.value.map(subCategory => ({
    ...subCategory,
    children: subCategory.children.filter(website => 
      website.name?.toLowerCase().includes(keyword) ||
      website.description?.toLowerCase().includes(keyword) ||
      website.url?.toLowerCase().includes(keyword)
    )
  })).filter(subCategory => subCategory.children.length > 0)
})

// 初始化
onMounted(() => {
  // 默认展开所有一级节点
  defaultExpandedKeys.value = collectFirstLevelIds(categoryTreeData.value)
  // 默认选择第一个分类
  if (categoryTreeData.value.length > 0) {
    selectCategory(categoryTreeData.value[0].id)
  }
})
</script>

<template>
  <div class="aigc-nav-container">
    <!-- 左侧树形菜单 -->
    <div class="aigc-category-tree">
      <div class="tree-header">
        <FaIcon name="i-mdi:robot" class="tree-header-icon"/>
        <span>AIGC工具导航</span>
      </div>
      <div class="tree-container">
        <ElTree
          ref="treeRef"
          :data="categoryTreeData"
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
                <FaIcon
                  v-if="data.icon"
                  :name="data.icon"
                  class="tree-icon"
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
    </div>

    <!-- 右侧内容区域 -->
    <div class="aigc-content-area">
      <!-- 顶部搜索栏 -->
      <div class="search-section">
        <div class="search-box">
          <FaIcon name="i-mdi:magnify" class="search-icon"/>
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索AIGC工具..."
            class="search-input"
          />
          <button
            v-if="searchKeyword"
            @click="searchKeyword = ''"
            class="search-clear"
          >
            <FaIcon name="i-mdi:close-circle"/>
          </button>
        </div>
      </div>

      <!-- 分类标题 -->
      <div v-if="currentCategoryInfo" class="category-header">
        <div class="category-info">
          <FaIcon 
            v-if="currentCategoryInfo.icon"
            :name="currentCategoryInfo.icon" 
            class="header-icon"
          />
          <div>
            <h2 class="category-name">{{ currentCategoryInfo.label }}</h2>
          </div>
        </div>
      </div>

      <!-- 工具列表 -->
      <div class="aigc-websites-list">
        <!-- 加载状态 -->
        <div v-if="loading[selectedCategoryId]" class="loading">
          <div class="loading-spinner"></div>
          <span>加载中...</span>
        </div>

        <!-- 工具卡片 -->
        <div v-else-if="filteredData.length > 0" class="tools-container">
          <div
            v-for="subCategory in filteredData"
            :key="subCategory.name"
            :data-category-id="selectedCategoryId"
            class="sub-category-section"
          >
            <h3 class="sub-category-title">{{ subCategory.name }}</h3>
            <div class="tools-grid">
              <div
                v-for="tool in subCategory.children"
                :key="tool.id"
                class="tool-card"
                @click="openWebsite(tool.url || '')"
              >
                <div class="tool-icon">
                  <img v-if="tool.icon" :src="tool.icon" :alt="tool.name"/>
                  <FaIcon v-else name="i-mdi:link" class="default-icon"/>
                </div>
                <div class="tool-info">
                  <div class="tool-name">{{ tool.name }}</div>
                  <div v-if="tool.description" class="tool-desc">
                    {{ tool.description }}
                  </div>
                </div>
                <FaIcon name="i-mdi:open-in-new" class="external-icon"/>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <FaIcon name="i-mdi:web-off" class="empty-icon"/>
          <p class="empty-text">
            {{ searchKeyword ? '未找到相关工具' : '暂无工具' }}
          </p>
          <p v-if="searchKeyword" class="empty-hint">
            试试其他关键词
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.aigc-nav-container {
  width: 100%;
  min-height: calc(100vh - 101px);
  background: #f5f7fa;
  padding: 20px;
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

/* 左侧树形菜单 */
.aigc-category-tree {
  width: 280px;
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

.tree-node-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  color: #4a5568;
  transition: color 0.2s ease, font-weight 0.2s ease;
}

/* 右侧内容区域 */
.aigc-content-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 搜索区域 */
.search-section {
  width: 100%;
}

.search-box {
  position: relative;
  max-width: 600px;
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:focus-within {
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
    border: 2px solid #667eea;
  }
}

.search-icon {
  font-size: 20px;
  color: #94a3b8;
  margin-right: 12px;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  color: #1e293b;
  background: transparent;

  &::placeholder {
    color: #94a3b8;
  }
}

.search-clear {
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.2s ease;

  &:hover {
    color: #64748b;
  }

  :deep(.fa-icon) {
    font-size: 18px;
  }
}

/* 分类标题 */
.category-header {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.category-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  font-size: 32px;
  color: #667eea;
  flex-shrink: 0;
}

.category-name {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 工具列表容器 */
.aigc-websites-list {
  flex: 1;
  min-width: 0;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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
}

.tools-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.sub-category-section {
  scroll-margin-top: 20px;

  // 高亮效果
  &.highlight-category {
    animation: highlightPulse 2s ease-in-out;
  }
}

@keyframes highlightPulse {
  0%, 100% {
    background: transparent;
  }
  50% {
    background: rgba(102, 126, 234, 0.05);
  }
}

.sub-category-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #e2e8f0;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.tool-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  position: relative;

  &:hover {
    background: linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%);
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  }
}

.tool-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .default-icon {
    font-size: 24px;
    color: #667eea;
  }
}

.tool-info {
  flex: 1;
  min-width: 0;
}

.tool-name {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tool-desc {
  font-size: 13px;
  color: #64748b;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.external-icon {
  font-size: 18px;
  color: #94a3b8;
  flex-shrink: 0;
  opacity: 0;
  transition: all 0.3s ease;
}

.tool-card:hover .external-icon {
  opacity: 1;
  color: #667eea;
}

/* 加载状态 */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #64748b;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(102, 126, 234, 0.1);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  text-align: center;
  min-height: 400px;
}

.empty-icon {
  font-size: 64px;
  color: #cbd5e0;
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-text {
  font-size: 18px;
  color: #64748b;
  font-weight: 500;
  margin: 0 0 8px 0;
}

.empty-hint {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .aigc-nav-container {
    flex-direction: column;
    gap: 16px;
  }

  .aigc-category-tree {
    width: 100%;
    position: relative;
    max-height: 400px;
  }

  .tools-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .aigc-nav-container {
    padding: 16px 12px;
  }

  .tools-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .tool-card {
    padding: 12px;
  }

  .tool-icon {
    width: 40px;
    height: 40px;
  }
}
</style>