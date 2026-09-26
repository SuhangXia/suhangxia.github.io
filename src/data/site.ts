export const scholarUrl = 'https://scholar.google.com/citations?user=8rvc8iEAAAAJ&hl=en&oi=ao';

export const site = {
  name: 'Suhang Xia',
  url: 'https://suhangxia.github.io',
  email: 'suhang.xia@kcl.ac.uk',
  location: 'London, United Kingdom',
  role: 'Robotics & Embodied AI.',
  affiliation: 'MSc Robotics · King’s College London',
  focus: ['VLA', 'Visuotactile Learning', 'Robot Manipulation'],
  navigation: [
    { label: 'Research', href: '/research' },
    { label: 'About', href: '/about' },
  ],
  links: [
    { label: 'Email', href: 'mailto:suhang.xia@kcl.ac.uk' },
    { label: 'GitHub', href: 'https://github.com/suhangxia' },
    { label: 'Google Scholar', href: scholarUrl },
  ],
} as const;

export const researchUpdate = {
  conference: 'ICRA',
  year: 2027,
  status: 'Under review',
  description: 'A co-authored manuscript submitted to ICRA 2027.',
  note: 'Details withheld during review.',
} as const;

export const thesis = {
  eyebrow: 'Research thesis',
  title: 'How can robots turn perception into precise physical action?',
  body:
    'I build multimodal robot-learning systems, from data collection and representation learning to policy integration and real-robot evaluation, while retaining an engineering interest in image-guided robotic systems.',
  pillars: [
    { number: '01', label: 'Perception' },
    { number: '02', label: 'Touch' },
    { number: '03', label: 'Interaction' },
  ],
} as const;

export const about = {
  short:
    'I am an MSc Robotics student at King’s College London. My master’s research is supervised by Prof. Shan Luo, and my interests centre on VLA, visuotactile learning, and robot manipulation.',
  background:
    'Before KCL, I worked as an Algorithm Engineer at Hangzhou Lancet Robotics, developing algorithms for surgical robotic systems.',
} as const;
