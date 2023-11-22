import { parseISO } from "date-fns";

const cookieStorage: Pick<Storage, "getItem" | "setItem" | "removeItem"> = {
  getItem    : (key: string) => null,
  setItem    : (key: string, value: string) => { },
  removeItem : (key: string) => { },
};

interface JWTOptions {
  useJwt           : boolean;
  storageType      : "local" | "session" | "cookie";
  cookieHttpOnly   : boolean;
  accessTokenName  : string;
  refreshTokenName : string;
  accessExpName    : string;
  refreshExpName   : string;
}

class JWT {
  public readonly useJwt           : JWTOptions["useJwt"];
  public readonly storageType      : JWTOptions["storageType"];
  public readonly cookieHttpOnly   : JWTOptions["cookieHttpOnly"];
  public readonly accessTokenName  : JWTOptions["accessTokenName"];
  public readonly refreshTokenName : JWTOptions["refreshTokenName"];
  public readonly accessExpName    : JWTOptions["accessExpName"];
  public readonly refreshExpName   : JWTOptions["refreshExpName"];

  private storage    : Pick<Storage, "getItem" | "setItem" | "removeItem">;
  private expStorage : Pick<Storage, "getItem" | "setItem" | "removeItem">;

  constructor({
    useJwt           = false,
    storageType      = "local",
    cookieHttpOnly   = false,
    accessTokenName  = "auth",
    refreshTokenName = "refresh",
    accessExpName    = "auth_exp",
    refreshExpName   = "refresh_exp",
  }: Partial<JWTOptions>) {
    this.useJwt           = useJwt;
    this.storageType      = storageType;
    this.cookieHttpOnly   = cookieHttpOnly;
    this.accessTokenName  = accessTokenName;
    this.refreshTokenName = refreshTokenName;
    this.accessExpName    = accessExpName;
    this.refreshExpName   = refreshExpName;

    this.storage = cookieStorage;
    this.expStorage = cookieStorage;

    if (typeof window !== "undefined") {
      if (storageType === "cookie") {
        this.storage = cookieStorage;
        this.expStorage = localStorage;
      }
      else if (storageType === "session") {
        this.storage = sessionStorage;
        this.expStorage = sessionStorage;
      }
      else {
        this.storage = localStorage;
        this.expStorage = localStorage;
      }
    }
  }

  getAccessToken() {
    return this.storage.getItem(this.accessTokenName);
  }
  
  getRefreshToken() {
    return this.storage.getItem(this.refreshTokenName);
  }
  
  setAccessToken(token: string) {
    this.storage.setItem(this.accessTokenName, token);
  }
  
  setRefreshToken(token: string) {
    this.storage.setItem(this.refreshTokenName, token);
  }
  
  getAccessTokenExpiration() {
    const exp = this.expStorage.getItem(this.accessExpName);
    if (!exp) return null;
    return parseISO(exp);
  }
  
  getRefreshTokenExpiration() {
    const exp = this.expStorage.getItem(this.refreshExpName);
    if (!exp) return null;
    return parseISO(exp);
  }
  
  setAccessTokenExpiration(exp: string) {
    this.expStorage.setItem(this.accessExpName, exp);
  }
  
  setRefreshTokenExpiration(exp: string) {
    this.expStorage.setItem(this.refreshExpName, exp);
  }
  
  isAccessTokenExpired() {
    const exp = this.getAccessTokenExpiration();
    if (!exp) return true;
    return Date.now() >= exp.valueOf();
  }
  
  isRefreshTokenExpired() {
    const exp = this.getRefreshTokenExpiration();
    if (!exp) return true;
    return Date.now() >= exp.valueOf();
  }
  
  async refreshAccessToken(
    refreshFn: (refresh: string | null) => Promise<{ access: string; access_token_expiration: string }>,
  ) {
    try {
      const resp = await refreshFn(this.getRefreshToken());
      this.setAccessToken(resp.access);
      this.setAccessTokenExpiration(resp.access_token_expiration);
      return resp.access;
    }
    catch (e) {
      console.log("Failed to refresh access token.", e);
    }
    return null;
  }
  
  getOrRefreshAccessToken(
    refreshFn: (refresh: string | null) => Promise<{ access: string; access_token_expiration: string }>,
  ) {
    if (this.isAccessTokenExpired()) {
      return this.refreshAccessToken(refreshFn);
    }
    return this.getAccessToken();
  }
  
  clearStorage() {
    this.storage.removeItem(this.accessTokenName);
    this.storage.removeItem(this.refreshTokenName);
    this.expStorage.removeItem(this.accessExpName);
    this.expStorage.removeItem(this.refreshExpName);
  }
}

const jwt = new JWT({
  useJwt           : process.env.NEXT_PUBLIC_USE_JWT_AUTH?.toLocaleLowerCase() === "true",
  storageType      : process.env.NEXT_PUBLIC_JWT_STORAGE?.toLocaleLowerCase() as JWT["storageType"] | undefined,
  accessTokenName  : process.env.NEXT_PUBLIC_JWT_COOKIE_ACCESS_TOKEN_NAME,
  refreshTokenName : process.env.NEXT_PUBLIC_JWT_REFRESH_TOKEN_NAME,
  cookieHttpOnly   : process.env.NEXT_PUBLIC_JWT_HTTPONLY?.toLocaleLowerCase() === "true",
});

export default jwt;
