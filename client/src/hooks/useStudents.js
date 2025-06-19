import { useContext } from 'react';
import { StudentContext } from '../context/StudentContext';

export default function useStudents() {
  return useContext(StudentContext);
}
