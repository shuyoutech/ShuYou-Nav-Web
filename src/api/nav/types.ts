export interface NavWebsiteQuery {
  name?: string;
  category?: string;
  tag?: string;
}

export interface NavWebsiteVo {
  id?: string;
  name?: string;
  url?: string
  icon?: string;
  categories?: string[];
  tags?: string[];
  description?: string;
}

export interface NavWebsiteSaveBo {
  name?: string;
  url?: string
  icon?: string;
  categories?: string[];
  tags?: string[];
  description?: string;
}

export interface NavWebsiteUpdateBo extends NavWebsiteSaveBo {
  id: string;
}

export interface NavCustomCategoryQuery {
  userId?: string;
  name?: string;
  parentId?: string;
}

export interface NavCustomCategoryVo {
  id?: string;
  userId?: string;
  userName?: string
  name?: string;
  rootId?: string;
  parentId?: string;
  level?: number;
  icon?: string;
  sort?: number;
}

export interface NavCustomCategoryBo {
  id?: string;
  name?: string;
  parentId?: string;
  level?: number;
  icon?: string;
  sort?: number;
}

export interface NavCustomWebsiteQuery {
  userId?: string;
  name?: string;
  categoryId?: string;
}

export interface NavCustomWebsiteVo {
  id?: string;
  userId?: string;
  userName?: string
  categoryId?: string;
  name?: string;
  url?: string;
  icon?: string;
  sort?: number;
}

export interface NavCustomWebsiteBo {
  id?: string;
  categoryId?: string;
  name?: string;
  url?: string;
  icon?: string;
  sort?: number;
}

export interface NavCrawlerWebsiteVo {
  title?: string;
  description?: string;
  favicon?: string;
}
