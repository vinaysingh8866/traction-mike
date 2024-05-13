import { defineStore } from 'pinia';
import { API_PATH } from '@/helpers/constants';
import { useEllucianApi } from './ellucianApi';

export const useStudentStore = defineStore('student', () => {

  const ellucianApi = useEllucianApi();


    async function idLookup(studentNumber: string) {
    
      let studentData = null;
  
      try {
        const response = await ellucianApi.getHttp(
          `${API_PATH.ELLUCIAN_STUDENT_NAME}?studentNumber=${studentNumber}`
        );
        studentData = response.data;
      } catch (err) {
     console.log("Error displayed on studentStore", err)
      }
    return studentData;
  }

  return {
    idLookup
  };
});

export default {
  useStudentStore,
};
