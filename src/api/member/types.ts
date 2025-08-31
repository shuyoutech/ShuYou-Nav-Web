export interface MemberUserVo {
  id: string;
  status: string;
  nickname: string;
  mobile: string;
  email: string;
  avatar: string;
  gender: string;
  address: string;
  binds: MemberUserBind[];
}

export interface MemberUserBind {
  socialType: string;
  socialUserId: string;
}

