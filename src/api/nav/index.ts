import type {AxiosResponse} from "axios";
import api from "@/utils/axios.ts";
import type {
  NavCustomCategoryBo,
  NavCustomCategoryQuery,
  NavCustomCategoryVo, NavCustomWebsiteBo, NavCustomWebsiteQuery, NavCustomWebsiteVo,
  NavWebsiteQuery,
  NavWebsiteSaveBo,
  NavWebsiteUpdateBo,
  NavWebsiteVo
} from "@/api/nav/types.ts";

/**
 * 网址管理-分类接口
 */
export function navWebsiteCategoryApi<T = any>(type: string): Promise<AxiosResponse<T[]>> {
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


/**
 * 自定义分类-树
 */
export function navCustomCategoryTreeApi(data: NavCustomCategoryQuery): Promise<AxiosResponse<Tree<NavCustomCategoryVo>[]>> {
  return api({
    url: '/nav/custom/category/tree',
    method: 'post',
    data: data
  });
}

/**
 * 自定义分类-详情
 */
export function navCustomCategoryDetailApi(categoryId: string): Promise<AxiosResponse<NavCustomCategoryVo>> {
  return api({
    url: '/nav/custom/category/detail/' + categoryId,
    method: 'post'
  });
}

/**
 * 自定义分类-新增
 */
export function navCustomCategorySaveApi(data: NavCustomCategoryBo): Promise<AxiosResponse<number>> {
  return api({
    url: '/nav/custom/category/save',
    method: 'post',
    data: data
  });
}

/**
 * 自定义分类-修改
 */
export function navCustomCategoryUpdateApi(data: NavCustomCategoryBo): Promise<AxiosResponse<boolean>> {
  return api({
    url: '/nav/custom/category/update',
    method: 'post',
    data: data
  });
}

/**
 * 自定义分类-删除
 */
export function navCustomCategoryDeleteApi(data: string[]): Promise<AxiosResponse<boolean>> {
  return api({
    url: '/nav/custom/category/delete',
    method: 'post',
    data: data
  });
}

/**
 * 自定义网址-列表接口
 */
export function navCustomWebsiteApi<T = any>(data: NavCustomWebsiteQuery): Promise<AxiosResponse<T[]>> {
  return api({
    url: '/nav/custom/website/list',
    method: 'post',
    data: data
  });
}

/**
 * 自定义网址-详情
 */
export function navCustomWebsiteDetailApi(websiteId: string): Promise<AxiosResponse<NavCustomWebsiteVo>> {
  return api({
    url: '/nav/custom/website/detail/' + websiteId,
    method: 'post'
  });
}

/**
 * 自定义网址-新增
 */
export function navCustomWebsiteSaveApi(data: NavCustomWebsiteBo): Promise<AxiosResponse<number>> {
  return api({
    url: '/nav/custom/website/save',
    method: 'post',
    data: data
  });
}

/**
 * 自定义网址-修改
 */
export function navCustomWebsiteUpdateApi(data: NavCustomWebsiteBo): Promise<AxiosResponse<boolean>> {
  return api({
    url: '/nav/custom/website/update',
    method: 'post',
    data: data
  });
}

/**
 * 自定义网址-删除
 */
export function navCustomWebsiteDeleteApi(data: string[]): Promise<AxiosResponse<boolean>> {
  return api({
    url: '/nav/custom/website/delete',
    method: 'post',
    data: data
  });
}
