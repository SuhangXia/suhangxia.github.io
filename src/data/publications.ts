export type OutputLink = {
  label: string;
  href: string;
};

export type ResearchOutput = {
  id: string;
  title: string;
  authors: string;
  context: string;
  year: string;
  kind: 'report' | 'dissertation';
  topics: string[];
  links: OutputLink[];
};

// The legacy repository's papers.bib contains al-folio demonstration entries
// about Albert Einstein, not verified publications by Suhang Xia. They are
// intentionally excluded. Only outputs supported by personal project pages
// in that repository are listed here.
export const researchOutputs: ResearchOutput[] = [
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
