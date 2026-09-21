export const site = {
  name: 'Suhang Xia',
  url: 'https://suhangxia.github.io',
  email: 'suhang.xia@kcl.ac.uk',
  location: 'London, United Kingdom',
  role: 'Robotics researcher studying how machines perceive and act in the physical world.',
  affiliation: 'MSc Robotics · King’s College London',
  focus: ['Vision–Tactile–Language–Action', 'Robot Learning', 'Surgical Robotics'],
  navigation: [
    { label: 'Research', href: '/research' },
    { label: 'About', href: '/about' },
  ],
  links: [
    { label: 'Email', href: 'mailto:suhang.xia@kcl.ac.uk' },
    { label: 'GitHub', href: 'https://github.com/suhangxia' },
    { label: 'Google Scholar', href: 'https://scholar.google.com/citations?user=qc6CJjYAAAAJ' },
  ],
} as const;

export const thesis = {
  eyebrow: 'Research thesis',
  title: 'How can robots turn perception into precise physical action?',
  body:
    'My work connects visual and tactile perception, robot learning, and interaction with complex environments—from deformable objects to image-guided robotic systems.',
  pillars: [
    { number: '01', label: 'Perception' },
    { number: '02', label: 'Touch' },
    { number: '03', label: 'Interaction' },
  ],
} as const;

export const about = {
  short:
    'I am an MSc Robotics student at King’s College London, supervised by Dr Shan Luo. My current interests centre on vision–tactile–language–action models and robotic manipulation.',
  background:
    'Before KCL, I worked as an Algorithm Engineer at Hangzhou Lancet Robotics, developing algorithms for surgical robotic systems.',
} as const;
