import { defineStore, storeToRefs } from 'pinia';
import axios from 'axios';
import { useConfigStore } from './configStore';

export const useSisApi = defineStore('sisApi', () => {
  const { config } = storeToRefs(useConfigStore());

  function createAxios(options = {}) {
    console.log('creating SIS axios instance...');
    console.log(options);
    return axios.create({
      ...options,
    });
  }

  const sisApi = createAxios({
    baseURL: config.value.frontend.sisProxyPath,
  });

  async function callSisApi(
    url: string,
    method: string,
    options = {}
  ): Promise<any> {
    return sisApi({
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
    return callSisApi(url, 'get', {
      ...options,
      params,
    });
  }

  return {
    getHttp,
  };
});

export default {
  useSisApi,
};


















// import { defineStore, storeToRefs } from 'pinia';
// import axios from 'axios';
// import { useConfigStore } from './configStore';

// export const useEllucianApi = defineStore('ellucianApi', () => {
// const { config } = storeToRefs(useConfigStore());

// function createAxios(options = {}) {
//     console.log('creating ellucian axios instance...');
//     console.log(options);
//     return axios.create({
//       ...options,
//     });
//   }

//   const ellucianApi = createAxios({
//     baseURL: config.value.frontend.sisProxyPath,
//   });


// async function callEllucianApi(
//     url: string,
//     method: string,
//     options = {}
//   ): Promise<any> {
//     return ellucianApi({
//       method: method.toUpperCase(),
//       url,
//       ...options,
//     });
//   }

// async function getHttp(
//     url: string,
//     params: any = {},
//     options: any = {}
//   ): Promise<any> {
//     return callEllucianApi(url, 'get', {
//       ...options,
//       params,
//     });
//   }

//   return {
//     getHttp,
//   };
// });

// export default {
//   useEllucianApi,
// };
