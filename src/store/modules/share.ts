export const useShareStore = defineStore(
  // 唯一ID
  'share',
  () => {
    const code = ref('')
    const state = ref('')
    return {
      code,
      state,
    }
  },
)
