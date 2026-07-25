// Recursos i18n bundlados (import estático → sem flash de idioma).
// Um namespace por feature: cada arquivo pode ser editado isoladamente.
import enCommon from './locales/en/common.json';
import enNav from './locales/en/nav.json';
import enAuth from './locales/en/auth.json';
import enProfile from './locales/en/profile.json';
import enBacklog from './locales/en/backlog.json';
import enFlashcards from './locales/en/flashcards.json';
import enArticles from './locales/en/articles.json';
import enWeight from './locales/en/weight.json';
import enTimers from './locales/en/timers.json';
import enDiary from './locales/en/diary.json';
import enConverters from './locales/en/converters.json';
import enTodo from './locales/en/todo.json';
import enFeedback from './locales/en/feedback.json';
import enJobs from './locales/en/jobs.json';
import enProblems from './locales/en/problems.json';
import enDogs from './locales/en/dogs.json';
import enExpenses from './locales/en/expenses.json';

import ptCommon from './locales/pt/common.json';
import ptNav from './locales/pt/nav.json';
import ptAuth from './locales/pt/auth.json';
import ptProfile from './locales/pt/profile.json';
import ptBacklog from './locales/pt/backlog.json';
import ptFlashcards from './locales/pt/flashcards.json';
import ptArticles from './locales/pt/articles.json';
import ptWeight from './locales/pt/weight.json';
import ptTimers from './locales/pt/timers.json';
import ptDiary from './locales/pt/diary.json';
import ptConverters from './locales/pt/converters.json';
import ptTodo from './locales/pt/todo.json';
import ptFeedback from './locales/pt/feedback.json';
import ptJobs from './locales/pt/jobs.json';
import ptProblems from './locales/pt/problems.json';
import ptDogs from './locales/pt/dogs.json';
import ptExpenses from './locales/pt/expenses.json';

export const defaultNS = 'common';

export const ns = [
  'common',
  'nav',
  'auth',
  'profile',
  'backlog',
  'flashcards',
  'articles',
  'weight',
  'timers',
  'diary',
  'converters',
  'todo',
  'feedback',
  'jobs',
  'problems',
  'dogs',
  'expenses',
] as const;

export const resources = {
  en: {
    common: enCommon,
    nav: enNav,
    auth: enAuth,
    profile: enProfile,
    backlog: enBacklog,
    flashcards: enFlashcards,
    articles: enArticles,
    weight: enWeight,
    timers: enTimers,
    diary: enDiary,
    converters: enConverters,
    todo: enTodo,
    feedback: enFeedback,
    jobs: enJobs,
    problems: enProblems,
    dogs: enDogs,
    expenses: enExpenses,
  },
  pt: {
    common: ptCommon,
    nav: ptNav,
    auth: ptAuth,
    profile: ptProfile,
    backlog: ptBacklog,
    flashcards: ptFlashcards,
    articles: ptArticles,
    weight: ptWeight,
    timers: ptTimers,
    diary: ptDiary,
    converters: ptConverters,
    todo: ptTodo,
    feedback: ptFeedback,
    jobs: ptJobs,
    problems: ptProblems,
    dogs: ptDogs,
    expenses: ptExpenses,
  },
} as const;
