import api from "@/utils/api";

import http from "@/utils/server/fetchWithCredentials";
import { User } from "@/utils/auth/auth.types";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const SuspensePage = async () => {
  const { data: user } = await http<User>(`${api.baseURL}${api.endpoints.auth.user}`);

  return (
    <div>
      Hi {user.email}
    </div>
  );
}

export default SuspensePage;