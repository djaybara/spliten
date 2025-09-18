import { QUESTIONS_DATA } from '@/data/questionsData';
import { slugifyTitle } from '@/data/questionsData';

export async function listQuestionSlugsClean(): Promise<string[]> {
  const arr = Object.values(QUESTIONS_DATA || {});
  return arr.map(q => slugifyTitle(q.title));
}
