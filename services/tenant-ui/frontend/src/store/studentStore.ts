import { defineStore } from 'pinia';
import { API_PATH } from '@/helpers/constants';
import { useSisApi } from './sisApi';

export const useStudentStore = defineStore('student', () => {

  const sisApi = useSisApi();


    async function idLookup(studentNumber: string) {
    
      let studentData = null;
  
      try {
        const response = await sisApi.getHttp(
          `${API_PATH.SIS_STUDENT_ID}?studentNumber=${studentNumber}`
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
