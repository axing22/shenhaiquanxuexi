import { findUserByEmail, findUserByUuid, insertUser } from "@/models/user";
import { updateUserCredits } from "@/models/credit";
import { User } from "@/types/user";
import { getUserUuidByApiKey } from "@/models/apikey";
import { headers } from "next/headers";
import { getToken } from "@/lib/auth";
import { getServerToken } from "@/lib/server-auth";
import { auth } from "@/auth";

/**
 * /api/user/info 响应数据结构
 */
interface UserInfoResponse {
  code: number;
  message: string;
  data: {
    user: {
      id: number;
      uuid: number;
      email: string;
      phone: string;
      name: string;
      nickname: string;
      avatar_url: string;
      image: string;
    };
    aiHubToken: string;
    refreshToken: string | null;
  };
}

/**
 * Save user to Supabase database
 * - If user exists: return existing user
 * - If new user: insert to DB and grant 10 initial credits
 */
export async function saveUser(user: User) {
  try {
    console.log("[saveUser] Checking if user exists:", user.email);
    const existUser = await findUserByEmail(user.email, user.signin_provider);

    if (!existUser) {
      console.log("[saveUser] New user, inserting to database...");
      // New user: insert to database
      const insertedUser = await insertUser(user);
      console.log("[saveUser] User inserted with UUID:", insertedUser.uuid);

      // Grant initial credits for new user (10 credits)
      if (insertedUser.uuid) {
        console.log("[saveUser] Granting 10 initial credits to new user");
        await updateUserCredits(
          insertedUser.uuid,
          10,
          "new_user",
          "Welcome bonus: 10 free credits"
        );
      }

      return insertedUser;
    } else {
      console.log("[saveUser] User already exists with UUID:", existUser.uuid);
      // Existing user: return user data
      user.id = existUser.id;
      user.uuid = existUser.uuid;
      user.created_at = existUser.created_at;
      return user;
    }
  } catch (e) {
    console.error("[saveUser] Failed to save user:", e);
    throw e;
  }
}

export async function getUserUuid() {
  // 优先尝试从 NextAuth session 获取（Google 登录）
  try {
    const session = await auth();
    if (session?.user) {
      const user = session.user as any;
      if (user.uuid) {
        console.log("[getUserUuid] Found UUID from NextAuth session:", user.uuid);
        return String(user.uuid);
      }
    }
  } catch (error) {
    console.error("[getUserUuid] Failed to get NextAuth session:", error);
  }

  // 尝试从 cookie 获取 token（AI Hub 客户端登录）
  const cookieToken = await getServerToken();
  console.log("[getUserUuid] Token from cookie:", cookieToken ? "exists" : "none");
  
  if (cookieToken) {
    try {
      console.log("[getUserUuid] Calling /api/user/info with AI Hub token");
      // 服务端 fetch 必须使用完整 URL，不能使用相对路径
      // 优先从环境变量读取，如果没有则尝试使用内部地址
      const baseUrl = process.env.NEXT_PUBLIC_WEB_URL 
        || process.env.VERCEL_URL 
        || 'http://localhost:3000';
      
      const fullUrl = baseUrl.startsWith('http') 
        ? `${baseUrl}/api/user/info`
        : `http://${baseUrl}/api/user/info`;
        
      console.log("[getUserUuid] Fetching from:", fullUrl.replace(/localhost:\d+/, 'localhost:XXX'));
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': cookieToken,
          'Content-Type': 'application/json',
          'Cookie': `aiHubToken=${cookieToken}`,
        },
      });
      
      console.log("[getUserUuid] Response status:", response.status);
      if (response.ok) {
        const result = await response.json() as UserInfoResponse;
        console.log("[getUserUuid] Response from /api/user/info:", JSON.stringify(result).substring(0, 100));
        
        if (result.code === 1000 && result.data) {
          // 响应结构: { code: 1000, data: { user: {...}, aiHubToken: "...", refreshToken: null } }
          const userData = result.data.user;
          if (userData) {
            const uuid = userData.id || userData.uuid;
            if (uuid) {
              console.log("[getUserUuid] Found UUID from AI Hub:", uuid);
              return String(uuid);
            }
          } else {
            console.warn("[getUserUuid] No user data in response:", result.data);
          }
        } else {
          console.warn("[getUserUuid] Unexpected response format:", result);
        }
      } else {
        console.warn("[getUserUuid] /api/user/info returned status:", response.status);
      }
    } catch (error) {
      console.error("[getUserUuid] Failed to call /api/user/info333:", error);
    }
  }

  // 最后尝试从 Authorization header 获取（API 调用时使用）
  const headerToken = await getAuthToken();
  console.log("[getUserUuid] Token from header:", headerToken ? "exists" : "none");
  
  if (headerToken && headerToken.startsWith("sk-")) {
    const uuid = await getUserUuidByApiKey(headerToken);
    if (uuid) {
      return uuid;
    }
  }

  console.log("[getUserUuid] No UUID found, returning empty string");
  return "";
}

/**
 * 从请求头获取 Authorization token（AI Hub 不需要 Bearer 前缀）
 */
export async function getAuthToken() {
  const h = await headers();
  const auth = h.get("Authorization");
  if (!auth) {
    return "";
  }

  // AI Hub 不需要 Bearer 前缀，但如果客户端发送了 Bearer 前缀，需要移除
  return auth.replace("Bearer ", "");
}

export async function getUserEmail() {
  // 优先尝试从 NextAuth session 获取（Google 登录）
  try {
    const session = await auth();
    if (session?.user?.email) {
      console.log("[getUserEmail] Found email from NextAuth session:", session.user.email);
      return session.user.email;
    }
  } catch (error) {
    console.error("[getUserEmail] Failed to get NextAuth session:", error);
  }

  let user_email = "";

  // 尝试从 AI Hub token 获取
  try {
    const cookieToken = await getServerToken();
    if (cookieToken && !cookieToken.startsWith("sk-")) {
      console.log("[getUserEmail] Calling /api/user/info with AI Hub token");
      // 服务端 fetch 必须使用完整 URL，不能使用相对路径
      const baseUrl = process.env.NEXT_PUBLIC_WEB_URL 
        || process.env.VERCEL_URL 
        || 'http://localhost:3000';
      
      const fullUrl = baseUrl.startsWith('http') 
        ? `${baseUrl}/api/user/info`
        : `http://${baseUrl}/api/user/info`;
        
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': cookieToken,
          'Content-Type': 'application/json',
          'Cookie': `aiHubToken=${cookieToken}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log("[getUserEmail] Response from /api/user/info:", JSON.stringify(result).substring(0, 100));
        
        if (result.code === 1000 && result.data) {
          // 响应结构: { code: 1000, data: { user: {...}, aiHubToken: "...", refreshToken: null } }
          const userData = result.data.user;
          if (userData) {
            user_email = userData.email || userData.phone || '';
            if (user_email) {
              console.log("[getUserEmail] Found email from AI Hub:", user_email);
              return user_email;
            }
          } else {
            console.warn("[getUserEmail] No user data in response:", result.data);
          }
        } else {
          console.warn("[getUserEmail] Unexpected response format:", result);
        }
      }
    }
  } catch (error) {
    console.error("[getUserEmail] Failed to get email from AI Hub:", error);
  }

  console.log("[getUserEmail] No email found");
  return user_email;
}

export async function getUserInfo() {
  let user_uuid = await getUserUuid();

  if (!user_uuid) {
    return;
  }

  const user = await findUserByUuid(user_uuid);

  return user;
}
