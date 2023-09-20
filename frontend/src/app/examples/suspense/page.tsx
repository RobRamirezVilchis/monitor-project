import api from "@/api";

import http from "@/utils/server/fetchWithCredentials";
import { User } from "@/api/auth.types";
import { sleep } from "@/utils/utils";

const SuspensePage = async () => {
  const { data: user } = await http<User>(`${api.baseURL}${api.endpoints.auth.user}`);

  return (
    <div>
      Hi {user.email}
    </div>
  );
}

export default SuspensePage;