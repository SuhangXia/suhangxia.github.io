import type { ImageMetadata } from 'astro';
import heroRobot from '../assets/media/hero-surgical-robot.jpg';
import surgicalImaging from '../assets/media/surgical-imaging.jpg';
import surgicalTarget from '../assets/media/surgical-target.jpg';
import robotPlatform from '../assets/media/robot-platform.jpg';
import decoTeaser from '../assets/media/deco-teaser.png';
import decoArchitecture from '../assets/media/deco-architecture.png';
import decoAttention from '../assets/media/deco-attention.png';
import vtlaTouchUntilCertain from '../assets/media/vtla-touch-until-certain.png';
import uavEgoPreview from '../assets/media/uav-ego-preview.gif';
import uavSimulation from '../assets/media/uav-simulation.png';
import uavSystem from '../assets/media/uav-system.png';
import animalStudyWorkcell from '../assets/media/percutaneous/animal-study-workcell.jpg';
import lancetRoboticsLogo from '../assets/media/percutaneous/lancet-robotics-logo.png';

export type ProjectLink = {
  label: string;
  href: string;
};

export type Project = {
  slug: string;
  index: string;
  title: string;
  shortTitle: string;
  field: string;
  question: string;
  description: string;
  media?: ImageMetadata;
  mediaAlt?: string;
  previewMedia?: ImageMetadata;
  previewMediaAlt?: string;
  previewMediaAnimated?: boolean;
  previewFallback?: ImageMetadata;
  secondaryMedia?: ImageMetadata;
  secondaryAlt?: string;
  evidenceNote?: string;
  organisation?: {
    name: string;
    product: string;
    href: string;
    logo?: ImageMetadata;
    logoAlt?: string;
  };
  achievement?: {
    authority: string;
    label: string;
    value: string;
    href: string;
  };
  theme: 'light' | 'dark' | 'paper';
  layout: 'wide' | 'split' | 'editorial';
  links: ProjectLink[];
};

export const heroMedia = heroRobot;

export const story = {
  eyebrow: 'Industry systems · Surgical robotics',
  title: 'From image space to physical action.',
  introduction:
    'Across the percutaneous puncture and neurosurgical platforms, robotic intervention is a chain of perception, spatial reasoning, hardware control, and feedback that must remain legible at every step.',
  stages: [
    {
      number: '01',
      title: 'Imaging',
      text: 'Clinical image views establish the spatial context in which a target and an instrument can be understood together.',
      media: surgicalImaging,
      alt: 'Medical imaging and planning interface displayed on a monitor',
    },
    {
      number: '02',
      title: 'Targeting',
      text: 'Physical phantom experiments connect a planned target with an observable point in the robot workspace.',
      media: surgicalTarget,
      alt: 'Surgical robot instrument positioned above a physical phantom target',
    },
    {
      number: '03',
      title: 'Execution',
      text: 'The robot converts the planned relationship into a constrained instrument motion at the interaction site.',
      media: heroRobot,
      alt: 'Close view of a surgical robot guiding an instrument toward a phantom',
    },
    {
      number: '04',
      title: 'Navigation',
      text: 'The complete platform brings the robot, tracking equipment, planning workstation, and operator into one test environment.',
      media: robotPlatform,
      alt: 'Surgical robotics platform in a laboratory environment',
    },
  ],
} as const;

export const projects: Project[] = [
  {
    slug: 'touch-until-certain',
    index: '01',
    title: 'VTLA for Cloth Sorting',
    shortTitle: 'VTLA for Cloth Sorting',
    field: 'MSc thesis · Reliability-guided active tactile perception',
    question: 'When is a second touch worth its sensing cost for estimating fabric thickness and areal mass?',
    description:
      'Fabric-Omni records 200 fabrics through two-sided RGB, GelSight, and force-aligned presses. TouchUntilCertain predicts thickness and GSM, then spends a second touch only when the first appears unreliable.',
    media: vtlaTouchUntilCertain,
    mediaAlt: 'TouchUntilCertain target-free reliability-guided re-touch method for cloth sorting',
    evidenceNote:
      'Fabric-Omni is the private research dataset behind the thesis: 200 fabrics, 400 front/back sessions, and 12,170 valid presses with two-sided RGB, GelSight observations, ATI force records, and explicit label provenance.',
    theme: 'light',
    layout: 'wide',
    links: [{ label: 'View research', href: '/research/touch-until-certain/' }],
  },
  {
    slug: 'tactile-umi',
    index: '02',
    title: 'Tactile UMI',
    shortTitle: 'Tactile UMI',
    field: 'Research system · Calibrated visuotactile demonstrations',
    question: 'How can hand-held visuotactile demonstrations become inspectable, robot-ready trajectories?',
    description:
      'A geometrically and temporally calibrated pipeline that aligns Quest motion, wrist RGB, dual-fingertip tactile video, and gripper state. Raw demonstrations remain auditable before conversion into camera-relative 7D actions; frozen UniForce contact tokens then condition a Diffusion Policy deployed on a Franka FR3.',
    theme: 'paper',
    layout: 'wide',
    links: [
      { label: 'View research', href: '/research/tactile-umi/' },
      { label: 'GitHub repository', href: 'https://github.com/SuhangXia/tactile-umi' },
      { label: 'UniForce · arXiv', href: 'https://arxiv.org/abs/2602.01153' },
    ],
  },
  {
    slug: 'percutaneous-puncture-surgical-robot',
    index: '03',
    title: 'Percutaneous Puncture Surgical Robot',
    shortTitle: 'Puncture surgical robot',
    field: 'Lancet Robotics · Project Leader · NMPA-registered medical device',
    question: 'How can image-space planning become an inspectable, constrained puncture trajectory at the patient-side robot?',
    description:
      'At Lancet Robotics, I led the NMPA-registered RobPath-PCT-001 puncture robot project. I independently developed robot, fixture, and TCP calibration and system-accuracy measurement algorithms, performed Leica laser-tracker inspection and reporting, and designed and led the animal study with Silver Snake Clinical Center in Guangzhou. NMPA registration: 20263011303.',
    media: animalStudyWorkcell,
    mediaAlt: 'Integrated animal-study workcell with CT imaging, the puncture robot, optical tracking, navigation display, and the experimental team',
    previewMedia: animalStudyWorkcell,
    previewMediaAlt: 'Integrated animal-study workcell with CT imaging, the puncture robot, optical tracking, navigation display, and the experimental team',
    evidenceNote:
      'Independent calibration and metrology work connected CT registration, tracked tool geometry, robot motion, and Leica verification. As project leader, I also designed and led the animal-study programme with the team and Silver Snake Clinical Center in Guangzhou.',
    organisation: {
      name: 'RobPath',
      product: 'Lancet Robotics',
      href: 'https://www.lancet-robotics.com/newsinfo/11246013.html?templateId=556099',
      logo: lancetRoboticsLogo,
      logoAlt: 'Lancet Robotics logo',
    },
    achievement: {
      authority: 'NMPA',
      label: 'Registered medical device',
      value: '20263011303',
      href: '/research/percutaneous-puncture-surgical-robot/#nmpa-registration',
    },
    theme: 'dark',
    layout: 'wide',
    links: [
      { label: 'View research', href: '/research/percutaneous-puncture-surgical-robot/' },
      {
        label: 'Official product page',
        href: 'https://www.lancet-robotics.com/newsinfo/11246013.html?templateId=556099',
      },
    ],
  },
  {
    slug: 'neurosurgical-robot',
    index: '04',
    title: 'Neurosurgical Robot',
    shortTitle: 'Neurosurgical robot',
    field: 'Medical robotics · Robotic-arm navigation',
    question: 'How can registration and coordinate-chain reasoning keep a neurosurgical instrument aligned with the planned anatomy?',
    description:
      'At Hangzhou Lancet Robotics, I was responsible for robotic-arm navigation within a neurosurgical robot system. The work connected image guidance, patient and tool registration, robot coordinate transforms, navigation feedback, and constrained probe motion without treating the navigation stack as a clinical outcome claim.',
    media: robotPlatform,
    mediaAlt: 'Neurosurgical robot, tracking equipment, and navigation workstation in the laboratory',
    evidenceNote:
      'The retained system record keeps the planning workstation, tracked anatomy, navigation coordinate chain, and physical robot platform visible as separate but connected parts of the navigation problem.',
    theme: 'paper',
    layout: 'wide',
    links: [{ label: 'View research', href: '/research/neurosurgical-robot/' }],
  },
  {
    slug: 'deco-mae',
    index: '05',
    title: 'DeCo-MAE',
    shortTitle: 'DeCo-MAE',
    field: 'Human–robot interaction · Video understanding',
    question: 'Can an action be understood as composable semantics—not a closed-set label?',
    description:
      'A decomposed semantic VideoMAE framework that represents human–robot interaction through action, tool, and modifier concepts for unseen-action recognition.',
    media: decoTeaser,
    mediaAlt: 'DeCo-MAE teaser comparing closed-set recognition with decomposed action semantics',
    secondaryMedia: decoAttention,
    secondaryAlt: 'Cross-modal attention visualisation over human tool-use video frames',
    evidenceNote:
      'The project pairs decomposed semantic supervision with attention visualisation to inspect how tool–action concepts are represented.',
    theme: 'paper',
    layout: 'split',
    links: [
      { label: 'View research', href: '/research/deco-mae/' },
      { label: 'Code', href: 'https://github.com/SuhangXia/DeCo-MAE' },
      {
        label: 'Report',
        href: 'https://github.com/SuhangXia/DeCo-MAE/blob/main/DeCo-MAE_Report_v09.pdf',
      },
    ],
  },
  {
    slug: 'uav-navigation',
    index: '06',
    title: 'Indoor navigation of a quadrotor UAV',
    shortTitle: 'UAV navigation',
    field: 'Autonomous systems · Dissertation',
    question: 'How can a quadrotor plan smooth, collision-free motion through a reconstructed indoor space?',
    description:
      'A ROS, Gazebo, PX4, and EGO-Planner simulation platform for studying controller design, trajectory optimisation, and indoor obstacle avoidance.',
    media: uavSimulation,
    mediaAlt: 'Reconstructed environment and UAV trajectory in a robotics simulator',
    previewMedia: uavEgoPreview,
    previewMediaAlt: 'Animated Gazebo and RViz view of EGO-Planner navigating a quadrotor through a reconstructed indoor environment',
    previewMediaAnimated: true,
    previewFallback: uavSimulation,
    secondaryMedia: uavSystem,
    secondaryAlt: 'ROS and PX4 simulation platform architecture diagram',
    evidenceNote:
      'The simulation environment combines reconstructed geometry with controller and trajectory-planning analysis.',
    theme: 'light',
    layout: 'editorial',
    links: [{ label: 'View research', href: '/research/uav-navigation/' }],
  },
  {
    slug: 'robocup-ur5e',
    index: '07',
    title: 'RoboCup UR5e Object Sorting System',
    shortTitle: 'RoboCup UR5e',
    field: 'Team Leader & System Architect · KCL RoboCup 2026',
    question: 'How can a modular robot system perceive, grasp, and sort YCB objects under competition time constraints?',
    description:
      'As Team Leader and System Architect, I designed the ROS 1 Noetic control structure for autonomous YCB sorting on UR5e, connecting YOLOv8, GraspNet, MoveIt, execution, scoring, and recovery in one modular workflow.',
    evidenceNote:
      'King’s College London Robotics Group Project · 2026. I led the team and owned the system architecture and finite-state orchestration across perception, scoring, planning, execution, and recovery.',
    theme: 'dark',
    layout: 'wide',
    links: [
      { label: 'View research', href: '/research/robocup-ur5e/' },
      { label: 'GitHub repository', href: 'https://github.com/SuhangXia/robocup_ur5e' },
    ],
  },
];

export const detailMedia = {
  decoArchitecture,
  surgicalImaging,
  surgicalTarget,
};
