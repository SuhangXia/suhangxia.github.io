export type OutputLink = {
  label: string;
  href: string;
};

export type ResearchOutput = {
  id: string;
  title: string;
  authors?: string;
  summary?: { en: string; zh: string };
  context: string;
  year: string;
  kind: 'preprint' | 'report' | 'dissertation';
  topics: string[];
  links: OutputLink[];
};

// The legacy repository's papers.bib contains al-folio demonstration entries
// about Albert Einstein, not verified publications by Suhang Xia. They are
// intentionally excluded. Entries below link to the original public records.
export const researchOutputs: ResearchOutput[] = [
  {
    id: 'avt-fabric',
    title: 'AVT-Fabric: Active Visuo-Tactile Perception via Adaptive Evidence Selection for Efficient Robotic Fabric Comparison',
    authors: 'Chang Gao, Zhuo Chen, Suhang Xia, Jihong Zhu, Jiankang Deng, Shan Luo',
    summary: {
      en: 'An RGB-first framework that adaptively selects tactile evidence for robotic fabric comparison.',
      zh: '面向机器人织物比较的 RGB 优先视触觉框架，按比较难度自适应选择触觉证据。',
    },
    context: 'arXiv preprint · 2026',
    year: '2026',
    kind: 'preprint',
    topics: ['Visuotactile learning', 'Robotic fabric comparison'],
    links: [{ label: 'Paper', href: 'https://arxiv.org/abs/2609.21377' }],
  },
  {
    id: 'deco-mae-report',
    title: "DeCo-MAE: Teaching Robots to ‘Understand’ Unseen Actions",
    authors: 'Suhang Xia, Ruiyi Hu, Muye Yuan · supervised by Oya Celiktutan',
    context: 'Technical report · Human–robot interaction',
    year: 'Current work',
    kind: 'report',
    topics: ['Human–robot interaction', 'Video understanding'],
    links: [
      {
        label: 'Report',
        href: 'https://github.com/SuhangXia/DeCo-MAE/blob/main/DeCo-MAE_Report_v09.pdf',
      },
      { label: 'Code', href: 'https://github.com/SuhangXia/DeCo-MAE' },
      {
        label: 'Poster',
        href: 'https://github.com/SuhangXia/DeCo-MAE/blob/main/Poster.pdf',
      },
    ],
  },
  {
    id: 'uav-dissertation',
    title: 'Research on Indoor Navigation of Quadrotor UAV',
    authors: 'Suhang Xia · supervised by Yunpu Song',
    context: 'Undergraduate dissertation · Zhejiang College of Tongji University',
    year: 'Dissertation',
    kind: 'dissertation',
    topics: ['Autonomous navigation', 'Motion planning'],
    links: [{ label: 'Project', href: '/research/uav-navigation/' }],
  },
];
