import "server-only";
import { cookies } from "next/headers";

const csrfTokenName = "csrftoken_django";

const fetchWithCredentials = async <R = any>(url: RequestInfo | URL, options?: RequestInit) => {
  const cookieStore = cookies();
  const csrfToken = cookieStore.get(csrfTokenName)?.value;

  const resp = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...options?.headers,
      Cookie: cookieStore.getAll().map(({ name, value }) => `${name}=${value}`).join("; "),
      ...(csrfToken ? { "X-CSRFToken": csrfToken } : undefined),
    },
  });

  const data = await resp.json() as R;

  return {
    data,
    ...resp,
  };
}

export default fetchWithCredentials;
