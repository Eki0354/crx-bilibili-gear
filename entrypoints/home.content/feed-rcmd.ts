/**
 * 推荐流 API 响应修改器
 *
 * 拦截 /x/web-interface/wbi/index/top/feed/rcmd
 * 修改响应数据后返回给页面。
 */

import type { NetworkInterceptor } from "../../utils/framework";

const feedRcmdInterceptor: NetworkInterceptor = {
  name: "feed-rcmd",
  match: "/x/web-interface/wbi/index/top/feed/rcmd",
  modify(data: any, _url) {
    if (!(data?.data?.item instanceof Array)) return data;

    return {
      ...data,
      data: {
        ...data.data,
        item: data.data.item.filter((n: any) => !n.business_info),
      },
    };
  },
};

export default feedRcmdInterceptor;
