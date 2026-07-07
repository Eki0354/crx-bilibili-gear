import { receiveVipPrivilege } from "./account.content/utils/privilege";

export default defineUnlistedScript(() => {
  receiveVipPrivilege(1);
  receiveVipPrivilege(2);
});
