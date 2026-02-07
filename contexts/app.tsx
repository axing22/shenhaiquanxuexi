"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { cacheGet, cacheRemove } from "@/lib/cache";

import { CacheKey } from "@/services/constant";
import { ContextValue } from "@/types/context";
import { User } from "@/types/user";
import moment from "moment";
import { authEventBus } from "@/lib/auth-event";
import { getConsumptionItems, ConsumptionItemsData } from "@/services/consumption";
import { trackLoginSuccess } from "@/lib/analytics";

const AppContext = createContext({} as ContextValue);

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children, initialUserData }: { children: ReactNode; initialUserData?: any }) => {
  const [theme, setTheme] = useState<string>(() => {
    return process.env.NEXT_PUBLIC_DEFAULT_THEME || "";
  });

  const [showSignModal, setShowSignModal] = useState<boolean>(false);
  
  // ✅ 优化：用初始化函数同步读取 localStorage，避免异步延迟
  const [user, setUser] = useState<User | null>(() => {
    // ✅ 优先使用服务端传递的用户数据（SSR 初始化）
    if (initialUserData?.user) {
      const userObj = initialUserData.user;
      const userData: User = {
        uuid: userObj.id || userObj.uuid,
        email: userObj.email || '',
        phone: userObj.phone || userObj.mobile || '',
        nickname: userObj.nickname || userObj.name || '用户',
        avatar_url: userObj.avatar_url || userObj.avatar || '',
        credits: userObj.credits || 0,
        created_at: userObj.created_at || userObj.createTime || new Date().toISOString(),
        invited_by: userObj.invited_by || null
      };
      console.log("[AppContext] Using initial user data from SSR:", userData.nickname);
      return userData;
    }

    // 只在客户端环境执行
    if (typeof window === 'undefined') return null;

    return null;
  });

  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [isUserInfoLoading, setIsUserInfoLoading] = useState<boolean>(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [consumptionItems, setConsumptionItems] = useState<ConsumptionItemsData>({});

  // 处理 Google OAuth 回调的 token
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const authToken = urlParams.get('auth_token');
    const refreshToken = urlParams.get('refresh_token');
    const expire = urlParams.get('expire');
    const refreshExpire = urlParams.get('refresh_expire');

    if (authToken) {
      console.log('[AppContext] 检测到 Google 登录 token，保存到 localStorage...');

      // 保存 token 到 localStorage
      localStorage.setItem('aiHubToken', authToken);
      localStorage.setItem('aiHubToken_full', JSON.stringify({
        token: authToken,
        refreshToken: refreshToken || '',
        expire: parseInt(expire || '2592000'),
        refreshExpire: parseInt(refreshExpire || '2592000'),
        loginTime: Date.now()
      }));

      // 移除 URL 中的 token 参数
      const url = new URL(window.location.href);
      url.searchParams.delete('auth_token');
      url.searchParams.delete('refresh_token');
      url.searchParams.delete('expire');
      url.searchParams.delete('refresh_expire');

      // 使用 replace 而不是 push
      window.history.replaceState({}, '', url.toString());

      // 立即获取用户信息，不刷新页面
      fetchUserInfo().then((userInfo) => {
        console.log('[AppContext] Google 登录成功，用户信息已加载');

        // 追踪 Google 登录成功事件
        if (userInfo) {
          trackLoginSuccess('google', String(userInfo.uuid || ''));
        }
      });
    }
  }, []);

  // 监听认证事件，当检测到登录失效时打开登录弹窗
  useEffect(() => {
    console.log('[AppContext] Setting up auth event listener');

    const unsubscribe = authEventBus.subscribe((event) => {
      console.log('[AppContext] Auth event received:', event.type);

      if (event.type === 'login-expired' || event.type === 'unauthorized') {
        console.log('[AppContext] Opening sign modal due to:', event.type);
        setShowSignModal(true);
      }
    });

    return () => {
      console.log('[AppContext] Cleaning up auth event listener');
      unsubscribe();
    };
  }, []);

  const fetchUserInfo = async function (): Promise<User | null> {
    // 防止重复调用
    if (isUserInfoLoading) {
      return null;
    }

    // 如果距离上次获取不到 30 秒，且已有用户数据，则跳过
    const now = Date.now();
    if (user && lastFetchTime && now - lastFetchTime < 30000) {
      return null;
    }

    setIsUserInfoLoading(true);
    try {
      // 确保只在客户端访问 localStorage
      if (typeof window === 'undefined') return null;

      // 尝试从中台获取用户信息
      const token = localStorage.getItem('aiHubToken');
      if (!token || token.trim() === '') {
        console.log("[AppContext] No aiHubToken, skip fetching user info from AI Hub");
        // 如果没有 token，可能用户还没登录中台，暂时跳过
        return null;
      }

      const resp = await fetch("/api/user/info", {
        method: "GET",
        headers: {
          'Authorization': token
        }
      });

      if (!resp.ok) {
        console.log("[AppContext] Failed to fetch user info, status:", resp.status);
        // 如果是未授权错误，清除无效的 token
        if (resp.status === 401 || resp.status === 403) {
          localStorage.removeItem('aiHubToken');
          localStorage.removeItem('aiHubToken_full');
          localStorage.removeItem('aiHubData');
          localStorage.removeItem('userInfo');
        }
        return null;
      }

      const result = await resp.json();

      // ✅ 改进：处理两种响应格式
      let userData: User | null = null;

      if (result.code === 1000 && result.data) {
        // 格式 1: 来自 /api/user/info 的响应 { user, aiHubToken, refreshToken }
        if (result.data.user) {
          const userObj = result.data.user;
          userData = {
            uuid: userObj.id || userObj.uuid,
            email: userObj.email || '',
            phone: userObj.phone || userObj.mobile || '',
            nickname: userObj.nickname || userObj.name || '用户',
            avatar_url: userObj.avatar_url || userObj.avatar || '',
            credits: userObj.credits || 0,
            created_at: userObj.created_at || userObj.createTime || new Date().toISOString(),
            invited_by: userObj.invited_by || null
          };
        }
        // 格式 2: 来自 /api/user/info/person 的响应 (直接是用户信息)
        else if (result.data.id || result.data.userId) {
          userData = {
            uuid: result.data.id || result.data.userId,
            email: result.data.email || '',
            phone: result.data.phone || result.data.mobile || '',
            nickname: result.data.nickname || result.data.userName || '用户',
            avatar_url: result.data.avatar || result.data.avatarUrl || '',
            credits: result.data.availablePoints || result.data.credits || 0,
            created_at: result.data.createTime || result.data.created_at || new Date().toISOString(),
            invited_by: result.data.invitedBy || null
          };
        }

        if (userData) {
          console.log('[AppContext] Loaded user info:', userData.nickname);
          setUser(userData);
          setLastFetchTime(now);
          updateInvite(userData);
        }
      }

      return userData;
    } catch (e) {
      console.log("[AppContext] Failed to fetch user info:", e);
      // 静默失败，不影响用户体验
      return null;
    } finally {
      setIsUserInfoLoading(false);
    }
  };

  const updateInvite = async (user: User) => {
    try {
      if (user.invited_by) {
        // user already been invited
        console.log("user already been invited", user.invited_by);
        return;
      }

      const inviteCode = cacheGet(CacheKey.InviteCode);
      if (!inviteCode) {
        // no invite code
        return;
      }

      const userCreatedAt = moment(user.created_at).unix();
      const currentTime = moment().unix();
      const timeDiff = Number(currentTime - userCreatedAt);

      if (timeDiff <= 0 || timeDiff > 7200) {
        // user created more than 2 hours
        console.log("user created more than 2 hours");
        return;
      }

      // update invite relation
      console.log("update invite", inviteCode, user.uuid);
      const req = {
        invite_code: inviteCode,
        user_uuid: user.uuid,
      };
      const resp = await fetch("/api/update-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req),
      });
      if (!resp.ok) {
        throw new Error("update invite failed with status: " + resp.status);
      }
      const { code, message, data } = await resp.json();
      if (code !== 0) {
        throw new Error(message);
      }

      setUser(data);
      cacheRemove(CacheKey.InviteCode);
    } catch (e) {
      console.log("update invite failed: ", e);
    }
  };


  // ✅ 优化：页面加载时优先级最高的用户信息获取
  useEffect(() => {
    const initUserInfo = async () => {
      // 只在客户端执行，且用户未加载时执行
      if (typeof window === 'undefined' || user) {
        return;
      }

      try {
        // 检查是否有 token
        let token = localStorage.getItem('aiHubToken');

        // 如果没有 token，尝试从 NextAuth session 同步
        if (!token || token.trim() === '') {
          console.log('[AppContext] No token found, checking NextAuth session...');

          // 调用同步 API
          const syncResp = await fetch('/api/auth/sync');
          if (syncResp.ok) {
            const syncResult = await syncResp.json();
            if (syncResult.code === 1000 && syncResult.data) {
              console.log('[AppContext] NextAuth session synced successfully');

              // 保存 token 到 localStorage
              const authToken = syncResult.data.aiHubToken;
              localStorage.setItem('aiHubToken', authToken);
              localStorage.setItem('aiHubToken_full', JSON.stringify({
                token: authToken,
                refreshToken: syncResult.data.refreshToken || '',
                expire: syncResult.data.expire || 2592000,
                refreshExpire: syncResult.data.refreshExpire || 2592000,
                loginTime: Date.now()
              }));

              // 设置用户信息
              const userObj = syncResult.data.user;
              const userData: User = {
                uuid: userObj.id || userObj.uuid,
                email: userObj.email || '',
                phone: userObj.phone || '',
                nickname: userObj.nickname || userObj.name || '用户',
                avatar_url: userObj.avatar_url || userObj.avatar || '',
                credits: userObj.credits || 0,
                created_at: userObj.created_at || new Date().toISOString(),
                invited_by: userObj.invited_by || null
              };

              console.log('[AppContext] User loaded from NextAuth:', userData.nickname);
              setUser(userData);
              setLastFetchTime(Date.now());
              return;
            }
          }

          console.log('[AppContext] No valid session found');
          return;
        }

        console.log('[AppContext] Token found, immediately fetching user info...');

        // 直接进行 fetch，不依赖 fetchUserInfo 的节流逻辑
        const resp = await fetch("/api/user/info", {
          method: "GET",
          headers: {
            'Authorization': token
          }
        });

        if (!resp.ok) {
          console.log("[AppContext] Failed to fetch user info at init, status:", resp.status);
          // 如果是未授权错误，清除无效的 token
          if (resp.status === 401 || resp.status === 403) {
            localStorage.removeItem('aiHubToken');
            localStorage.removeItem('aiHubToken_full');
            localStorage.removeItem('aiHubData');
            localStorage.removeItem('userInfo');
          }
          return;
        }

        const result = await resp.json();
        
        if (result.code === 1000 && result.data) {
          let userData: User | null = null;
          
          if (result.data.user) {
            const userObj = result.data.user;
            userData = {
              uuid: userObj.id || userObj.uuid,
              email: userObj.email || '',
              phone: userObj.phone || userObj.mobile || '',
              nickname: userObj.nickname || userObj.name || '用户',
              avatar_url: userObj.avatar_url || userObj.avatar || '',
              credits: userObj.credits || 0,
              created_at: userObj.created_at || userObj.createTime || new Date().toISOString(),
              invited_by: userObj.invited_by || null
            };
          } else if (result.data.id || result.data.userId) {
            userData = {
              uuid: result.data.id || result.data.userId,
              email: result.data.email || '',
              phone: result.data.phone || result.data.mobile || '',
              nickname: result.data.nickname || result.data.userName || '用户',
              avatar_url: result.data.avatar || result.data.avatarUrl || '',
              credits: result.data.availablePoints || result.data.credits || 0,
              created_at: result.data.createTime || result.data.created_at || new Date().toISOString(),
              invited_by: result.data.invitedBy || null
            };
          }
          
          if (userData) {
            console.log('[AppContext] User info loaded at init:', userData.nickname);
            setUser(userData);
            setLastFetchTime(Date.now());
          }
        }
      } catch (e) {
        console.error("[AppContext] Failed to init user info:", e);
      }
    };

    // 立即执行，不延迟
    initUserInfo();
  }, []); // 只在挂载时执行一次

  // ✅ 在应用加载时获取积分扣除规则
  // 移除 consumption items 的获取，因为 API 已被删除
  // useEffect(() => {
  //   const fetchConsumptionItems = async () => {
  //     try {
  //       console.log('[AppContext] Fetching consumption items...');
  //       const items = await getConsumptionItems();
  //       console.log('[AppContext] Consumption items loaded:', items);
  //       setConsumptionItems(items);
  //     } catch (e) {
  //       console.error('[AppContext] Failed to fetch consumption items:', e);
  //     }
  //   };
  //
  //   fetchConsumptionItems();
  // }, []); // 只在挂载时执行一次

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        showSignModal,
        setShowSignModal,
        user,
        setUser,
        showFeedback,
        setShowFeedback,
        consumptionItems,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
