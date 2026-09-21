import type { ImageMetadata } from 'astro';
import surgicalImaging from '../assets/media/surgical-imaging.jpg';
import surgicalNeedleGuidance from '../assets/media/surgical-needle-guidance.jpg';
import surgicalTarget from '../assets/media/surgical-target.jpg';
import animalStudyTeam from '../assets/media/percutaneous/animal-study-team.jpg';
import animalStudyWorkcell from '../assets/media/percutaneous/animal-study-workcell.jpg';
import nmpaCertificate from '../assets/media/percutaneous/nmpa-registration-certificate-masked.jpg';
import televisionInterview from '../assets/media/percutaneous/evidence/broadcast-poster-p34.png';
import robotChain from '../assets/media/robot-chain.jpg';
import robotPlatform from '../assets/media/robot-platform.jpg';
import uavAstarSearch from '../assets/media/uav-astar-search.png';
import uavControllerResponse from '../assets/media/uav-controller-response.png';
import uavEgoPlanner from '../assets/media/uav-ego-planner.png';
import uavFourChannelResponse from '../assets/media/uav-four-channel-response.png';
import robocupSystemArchitecture from '../assets/media/robocup-system-architecture.svg';

export type EvidenceItem = {
  title: string;
  description: string;
  source: string;
  media: ImageMetadata;
  alt: string;
  wide?: boolean;
  presentation?: 'certificate' | 'team';
  id?: string;
  link?: {
    label: string;
    href: string;
  };
};

export type EvidenceCollection = {
  eyebrow: string;
  title: string;
  introduction: string;
  items: readonly EvidenceItem[];
};

export const repositoryEvidence: Record<string, EvidenceCollection> = {
  'percutaneous-puncture-surgical-robot': {
    eyebrow: 'Industry evidence · NMPA-registered puncture system',
    title: 'An NMPA-registered product, backed by an inspectable engineering chain.',
    introduction:
      'At Lancet Robotics, I led the project from planning and registration through physical guidance and system integration. The NMPA registration is presented first as the project’s principal product milestone; the remaining archive documents the engineering chain without inferring an unreported clinical-performance result.',
    items: [
      {
        id: 'nmpa-registration',
        title: 'NMPA-registered medical device',
        description:
          'The masked certificate records the Puncture Surgery Navigation and Positioning Equipment, model RobPath-PCT-001. It is the clearest product-level outcome of the project I led at Lancet Robotics.',
        source: 'National Medical Products Administration · privacy-masked certificate',
        media: nmpaCertificate,
        alt: 'Privacy-masked NMPA registration certificate for the RobPath-PCT-001 puncture surgery navigation and positioning equipment',
        wide: true,
        presentation: 'certificate',
        link: {
          label: 'Official Lancet Robotics product page',
          href: 'https://www.lancet-robotics.com/newsinfo/11246013.html?templateId=556099',
        },
      },
      {
        title: 'Image-space planning',
        description:
          'Clinical image views and the planning workstation establish the anatomical target and intended approach before robot motion.',
        source: 'Lancet Robotics · puncture planning workstation',
        media: surgicalImaging,
        alt: 'Medical imaging and puncture-planning interface on the navigation workstation',
      },
      {
        title: 'Instrument guidance',
        description:
          'The robot-mounted needle guide exposes the mechanism that turns a registered plan into a physically constrained puncture direction.',
        source: 'Lancet Robotics · puncture hardware record',
        media: surgicalNeedleGuidance,
        alt: 'Percutaneous puncture robot needle guide positioned over a laboratory phantom',
      },
      {
        title: 'Target interaction',
        description:
          'The close physical view keeps the needle, target marker, and phantom geometry visible in one frame for inspectable model testing.',
        source: 'Lancet Robotics · puncture phantom experiment',
        media: surgicalTarget,
        alt: 'Robot-guided puncture instrument approaching a marked phantom target',
        wide: true,
      },
      {
        id: 'animal-study-workcell',
        title: 'Animal-study workcell',
        description:
          'The retained operating-room record shows the CT scanner, robot, navigation display, optical tracking, and clinical team together during the project’s animal-study stage.',
        source: 'Lancet Robotics · animal-study system record',
        media: animalStudyWorkcell,
        alt: 'Percutaneous puncture robot, CT scanner, optical tracking, navigation display, and clinical team during an animal study',
        wide: true,
      },
      {
        id: 'animal-study-team',
        title: 'Animal-study team',
        description:
          'The on-site team photograph documents the engineering and clinical collaboration at the Silver Snake Clinical Center.',
        source: 'Lancet Robotics · animal-study team record',
        media: animalStudyTeam,
        alt: 'Engineering and clinical team outside the Silver Snake Clinical Center after the animal study',
        wide: true,
        presentation: 'team',
      },
      {
        title: 'Public technical communication',
        description:
          'A local television report recorded Suhang working directly with the puncture-robot hardware during project development.',
        source: 'Shaoxing News · original video poster · Lancet technical presentation, slide 34',
        media: televisionInterview,
        alt: 'Suhang Xia demonstrating the percutaneous puncture robot during a Shaoxing television interview',
      },
    ],
  },
  'neurosurgical-robot': {
    eyebrow: 'Industry evidence · Robotic-arm navigation',
    title: 'A registered chain from anatomy to robot motion.',
    introduction:
      'The navigation work connected image guidance, tracked anatomy and tools, robot coordinate transforms, and the physical platform. These materials document system integration rather than a clinical-outcome claim.',
    items: [
      {
        title: 'Integrated neurosurgical platform',
        description:
          'The laboratory record shows the robot, optical tracking equipment, navigation workstation, and physical operating area as one integrated system.',
        source: 'Lancet Robotics · neurosurgical platform',
        media: robotPlatform,
        alt: 'Neurosurgical robot, optical tracking equipment, and navigation workstation in a laboratory',
        wide: true,
      },
      {
        title: 'Navigation coordinate chain',
        description:
          'The engineering diagram makes the transforms between image, face, tracker, end-effector, robot base, and display frames explicit and auditable.',
        source: 'Lancet Robotics · navigation engineering record',
        media: robotChain,
        alt: 'Coordinate-chain diagram for image, patient, tracker, end-effector, robot, and display frames',
        wide: true,
      },
    ],
  },
  'uav-navigation': {
    eyebrow: 'Repository evidence · Dissertation',
    title: 'Controller response, graph search, and local trajectory optimisation.',
    introduction:
      'The original dissertation repository preserves the intermediate controller and planning evidence behind the final ROS, PX4, Gazebo, and EGO-Planner simulation.',
    items: [
      {
        title: 'Position and attitude response',
        description: 'The recorded simulation traces compare the baseline PD controller with feed-forward compensation across the vehicle state.',
        source: 'UAV dissertation · controller experiment',
        media: uavControllerResponse,
        alt: 'Position and attitude response plots comparing UAV control strategies',
        wide: true,
      },
      {
        title: 'Four-channel control output',
        description: 'Four actuator-channel histories expose transient response and convergence instead of reporting only the final flight path.',
        source: 'UAV dissertation · control channels',
        media: uavFourChannelResponse,
        alt: 'Four-channel UAV control response comparison plots',
      },
      {
        title: 'A* search process',
        description: 'The graph-search figure records cost propagation and node expansion under the dissertation heuristic study.',
        source: 'UAV dissertation · A* analysis',
        media: uavAstarSearch,
        alt: 'A-star graph search and node expansion diagrams',
      },
      {
        title: 'EGO-Planner trajectory',
        description: 'Reconstructed obstacles, the updated free-space representation, and the optimised local path appear in the same simulation view.',
        source: 'UAV dissertation · local planning',
        media: uavEgoPlanner,
        alt: 'EGO-Planner trajectory optimisation through a reconstructed obstacle field',
        wide: true,
      },
    ],
  },
  'robocup-ur5e': {
    eyebrow: 'Team leadership · System architecture',
    title: 'The architecture I led connects the whole team stack.',
    introduction:
      'As Team Leader and System Architect, I defined the finite-state orchestration and module boundaries that turned separate perception, grasping, planning, and control contributions into one recoverable sorting system.',
    items: [
      {
        title: 'Finite-state system architecture',
        description:
          'My system-level design coordinates search, detection, scoring, grasping, placement, and recovery across YOLOv8, GraspNet, MoveIt, motion control, and UR5e execution.',
        source: 'robocup_ur5e · repository architecture',
        media: robocupSystemArchitecture,
        alt: 'RoboCup UR5e ROS system architecture from perception through planning and physical sorting',
        wide: true,
      },
    ],
  },
};
