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
      console.log('Error displayed on studentStore', err);
    }
    return studentData;
  }

  async function getStudentInfo(studentNumber: string) {
    let studentInfo = null;

    try {
      const response = await sisApi.getHttp(
        `${API_PATH.SIS_STUDENT_TRANSCRIPT}?studentNumber=${studentNumber}`
      );
      const { studentCumulativeTranscript, courseTranscript } = response.data;
      studentInfo = {
        studentCumulativeTranscript,
        courseTranscript,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.log('Error fetching student info:', errorMessage);
    }
    return studentInfo;
  }

  return {
    idLookup,
    getStudentInfo,
  };
});

export default {
  useStudentStore,
};
