<script setup lang="ts">
const userStore = useUserStore()
const userInfo = ref(userStore.userInfo)
const showList = [
  { label: '用户名', value: 'username' },
  { label: '昵称', value: 'nickname' },
  { label: '真实姓名', value: 'realName' },
  { label: '邮箱', value: 'email' },
]
</script>

<template>
  <div class="min-h-full w-full">
    <div class="mb-30px text-3xl color-[var(--el-text-color-primary)] font-bold">
      基本信息
    </div>
    <FaAvatar :src="userStore.avatar" shape="square" class="mb-30px" />
    <div v-for="(item, i) in showList" :key="item.value + i" class="mb-24px flex">
      <div class="mr-5px color-[var(--el-text-color-primary)]">
        {{ item.label }}：
      </div>
      <div>{{ userInfo[item.value] }}</div>
    </div>
  </div>
</template>
