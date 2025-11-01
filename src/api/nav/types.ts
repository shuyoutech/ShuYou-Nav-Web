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
