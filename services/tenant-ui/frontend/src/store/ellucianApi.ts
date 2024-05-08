import { defineStore, storeToRefs } from 'pinia';
import axios from 'axios';
import { useConfigStore } from './configStore';

// import { useTokenStore } from './index'; 

export const useEllucianApi = defineStore('ellucianApi', () => {
//   const tokenStore = useTokenStore();
const { config } = storeToRefs(useConfigStore());

function createAxios(options = {}) {
    console.log('creating ellucian axios instance...');
    console.log(options);
    return axios.create({
      ...options,
    });
  }

  const ellucianApi = createAxios({
    baseURL: config.value.frontend.sisProxyPath,
  });


async function callEllucianApi(
    url: string,
    method: string,
    options = {}
  ): Promise<any> {
    return ellucianApi({
      method: method.toUpperCase(),
      url,
      ...options,
    });
  }

async function getHttp(
    url: string,
    params: any = {},
    options: any = {}
  ): Promise<any> {
    return callEllucianApi(url, 'get', {
      ...options,
      params,
    });
  }

  return {
    getHttp,
  };
});

export default {
  useEllucianApi,
};
