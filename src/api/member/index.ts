import type {AxiosResponse} from "axios"
import type {MemberUserVo} from "@/api/member/types.ts"
import api from "@/utils/axios.ts"

/**
 * 获取个人信息
 */
export function memberGetProfile(): Promise<AxiosResponse<MemberUserVo>> {
  return api({
    url: '/memberUser/getProfile',
    method: 'post',
  });
}
