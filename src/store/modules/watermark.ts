import type { WatermarkOptions } from 'watermark-js-plus'
import { Watermark } from 'watermark-js-plus'

export const useWatermarkStore = defineStore(
  // 唯一ID
  'watermark',
  () => {
    const settingsStore = useSettingsStore()
    const userStore = useUserStore()

    const customSettings = ref<Partial<WatermarkOptions>>()
    const settings = computed({
      get() {
        return Object.assign(
          {
            contentType: 'multi-line-text',
            content: `用户：${userStore.account}`,
            fontColor: settingsStore.currentColorScheme === 'light' ? '#000' : '#fff',
            globalAlpha: 0.1,
            width: 200,
            height: 200,
            // layout: 'grid',
            // gridLayoutOptions: {
            //   rows: 2,
            //   cols: 2,
            //   gap: [10, 10],
            //   matrix: [[1, 0], [0, 1]],
            // },
          } as Partial<WatermarkOptions>,
          customSettings.value,
        )
      },
      set(val) {
        update(val)
      },
    })

    const watermark = new Watermark(settings.value)

    watch(settings, async () => {
      if (settingsStore.settings.app.enableWatermark && await watermark.check()) {
        await watermark.changeOptions(settings.value)
      }
    }, {
      deep: true,
    })

    watch(() => settingsStore.settings.app.enableWatermark, (val) => {
      if (val) {
        watermark.create()
      }
      else {
        watermark.destroy()
      }
    }, {
      immediate: true,
    })

    watch(() => settingsStore.currentColorScheme, async () => {
      if (settingsStore.settings.app.enableWatermark && await watermark.check()) {
        await nextTick()
        await watermark.changeOptions(settings.value)
      }
    })

    // 更新水印设置
    function update(config: Partial<WatermarkOptions> = {}) {
      customSettings.value = config
    }

    return {
      update,
    }
  },
)
