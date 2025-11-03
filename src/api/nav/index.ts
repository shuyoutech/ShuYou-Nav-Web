import type {AxiosResponse} from "axios";
import api from "@/utils/axios.ts";
import type {NavWebsiteQuery, NavWebsiteSaveBo, NavWebsiteUpdateBo, NavWebsiteVo} from "@/api/nav/types.ts";

/**
 * 网址管理-分类接口
 */
export function navWebsiteCategoryApi(type: string): Promise<AxiosResponse> {
  return api({
    url: '/nav/website/category/' + type,
    method: 'post',
  });
}

/**
 * 网址管理-分页
 */
export function navWebsitePageApi(data: PageQuery<NavWebsiteQuery>): Promise<AxiosResponse<PageResult<NavWebsiteVo>>> {
  return api({
    url: '/nav/website/page',
    method: 'post',
    data: data,
  });
}

/**
 * 网址管理-详情
 */
export function navWebsiteDetailApi(websiteId: string): Promise<AxiosResponse<NavWebsiteVo>> {
  return api({
    url: '/nav/website/detail/' + websiteId,
    method: 'post'
  });
}

/**
 * 网址管理-新增
 */
export function navWebsiteSaveApi(data: NavWebsiteSaveBo): Promise<AxiosResponse<string>> {
  return api({
    url: '/nav/website/save',
    method: 'post',
    data: data
  });
}

/**
 * 网址管理-修改
 */
export function navWebsiteUpdateApi(data: NavWebsiteUpdateBo): Promise<AxiosResponse<boolean>> {
  return api({
    url: '/nav/website/update',
    method: 'post',
    data: data
  });
}

/**
 * 网址管理-删除
 */
export function navWebsiteDeleteApi(data: string[]): Promise<AxiosResponse<boolean>> {
  return api({
    url: '/nav/website/delete',
    method: 'post',
    data: data
  });
}
