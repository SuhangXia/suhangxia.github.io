import type { ImageMetadata } from 'astro';
import brainImaging from '../assets/media/percutaneous/evidence/patent-CN120876553A.png';
import pointCloud from '../assets/media/percutaneous/evidence/patent-CN120070523A.png';
import toolPose from '../assets/media/percutaneous/evidence/patent-CN120501514A.png';
import respiration from '../assets/media/percutaneous/evidence/patent-CN120053072A.png';
import tracking from '../assets/media/percutaneous/evidence/patent-CN120859655A.png';

export type PatentApplication = {
  publicationNumber: string;
  title: string;
  publicationDate: string;
  inventors: readonly string[];
  applicant: string;
  frontPage: ImageMetadata;
  source: string;
};

const applicant = 'Zhejiang Lancet Robotics Co., Ltd.';
const source = 'About Me · slide 15 · supplied application-publication front page';

// These are historical A-kind application publications, not assertions of current grant status.
// Preserve the listed inventor order in romanised form. Do not assign patents to unconfirmed product functions.
export const patentApplications: readonly PatentApplication[] = [
  {
    publicationNumber: 'CN120501514A',
    title: 'End-effector pose optimisation',
    publicationDate: '2025-08-19',
    inventors: ['Suhang Xia', 'Qianjun Yang', 'Zhijun Huang', 'Jinyong Liu', 'Kun Qian'],
    applicant, frontPage: toolPose, source,
  },
  {
    publicationNumber: 'CN120053072A',
    title: 'Respiratory-phase detection',
    publicationDate: '2025-05-30',
    inventors: ['Suhang Xia', 'Qianjun Yang', 'Haiting Mao'],
    applicant, frontPage: respiration, source,
  },
  {
    publicationNumber: 'CN120859655A',
    title: 'Tracking for image-guided surgery',
    publicationDate: '2025-10-31',
    inventors: ['Suhang Xia', 'Chunpeng Meng'],
    applicant, frontPage: tracking, source,
  },
  {
    publicationNumber: 'CN120070523A',
    title: 'Point-cloud registration',
    publicationDate: '2025-05-30',
    inventors: ['Qianjun Yang', 'Suhang Xia', 'Zhijun Huang'],
    applicant, frontPage: pointCloud, source,
  },
  {
    publicationNumber: 'CN120876553A',
    title: 'Multimodal brain-image processing',
    publicationDate: '2025-10-31',
    inventors: ['Qianjun Yang', 'Hongjian Shang', 'Suhang Xia'],
    applicant, frontPage: brainImaging, source,
  },
];
