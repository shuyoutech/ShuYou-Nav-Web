export interface AuthLoginReq {
  username: string
  password: string;
}

export interface AuthLoginRes {
  accessToken: string;
  userId: string;
  expireTime: number
}

export interface AuthAuthorizeReq {
  socialType: string;
  callBackSuffix: string
}

export interface AuthAccessTokenReq {
  socialType: string;
  code: string
}

export interface AuthAccessTokenRes {
  accessToken: string;
  userId: string;
  expireTime: number
}

export interface AuthSmsSendReq {
  mobile: string
  templateCode: string;
}

export interface AuthSmsLoginReq {
  mobile: string
  code: string;
}

export interface AuthSmsLoginRes {
  accessToken: string;
  userId: string;
  expireTime: number
}
