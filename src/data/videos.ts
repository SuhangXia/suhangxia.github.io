export type VideoStatus = 'draft' | 'public' | 'hidden' | 'archived';

export type PlayableVideo = {
  id: string;
  title: string;
  project?: string;
  description?: string;
  src: string;
  previewSrc?: string;
  poster?: string;
  duration?: number;
  featured?: boolean;
  status: VideoStatus;
};

export type VideoRecord = PlayableVideo & {
  objectKey: string;
  previewKey?: string;
  posterKey?: string;
};

/* COS_VIDEO_RECORDS_START */
const cosVideoRecords: readonly VideoRecord[] = [
  {
    "id": "surgical-navigation-test",
    "title": "Neurosurgical robot navigation demonstration",
    "project": "neurosurgical-robot",
    "src": "https://suhangxia-media-1255615484.cos.ap-hongkong.myqcloud.com/public/videos/demos/surgical-navigation-test.mp4",
    "poster": "https://suhangxia-media-1255615484.cos.ap-hongkong.myqcloud.com/public/posters/surgical-navigation-test.webp",
    "duration": 24.77,
    "status": "public",
    "objectKey": "public/videos/demos/surgical-navigation-test.mp4",
    "posterKey": "public/posters/surgical-navigation-test.webp"
  },
  {
    "id": "clothumi-data-collection",
    "title": "Tactile UMI portable data collection",
    "project": "tactile-umi",
    "description": "Portable UMI collection with the hand-held gripper, wrist camera, tactile sensing, and the task workspace in view.",
    "src": "https://suhangxia-media-1255615484.cos.ap-hongkong.myqcloud.com/public/videos/demos/clothumi-data-collection.mp4",
    "previewSrc": "https://suhangxia-media-1255615484.cos.ap-hongkong.myqcloud.com/public/videos/previews/clothumi-data-collection.mp4",
    "poster": "https://suhangxia-media-1255615484.cos.ap-hongkong.myqcloud.com/public/posters/clothumi-data-collection.webp",
    "duration": 14.73,
    "featured": true,
    "status": "public",
    "objectKey": "public/videos/demos/clothumi-data-collection.mp4",
    "previewKey": "public/videos/previews/clothumi-data-collection.mp4",
    "posterKey": "public/posters/clothumi-data-collection.webp"
  },
  {
    "id": "clothumi-uniforce-dp-inference",
    "title": "Tactile UMI UniForce + Diffusion Policy inference",
    "project": "tactile-umi",
    "description": "Franka FR3 rollouts for the UniForce-conditioned Diffusion Policy comparison, with vision-only and π0.5 reference conditions retained in the recording.",
    "src": "https://suhangxia-media-1255615484.cos.ap-hongkong.myqcloud.com/public/videos/demos/clothumi-uniforce-dp-inference.mp4",
    "previewSrc": "https://suhangxia-media-1255615484.cos.ap-hongkong.myqcloud.com/public/videos/previews/clothumi-uniforce-dp-inference.mp4",
    "poster": "https://suhangxia-media-1255615484.cos.ap-hongkong.myqcloud.com/public/posters/clothumi-uniforce-dp-inference.webp",
    "duration": 219.44,
    "status": "public",
    "objectKey": "public/videos/demos/clothumi-uniforce-dp-inference.mp4",
    "previewKey": "public/videos/previews/clothumi-uniforce-dp-inference.mp4",
    "posterKey": "public/posters/clothumi-uniforce-dp-inference.webp"
  },
  {
    "id": "fabric-omni-demo",
    "title": "VTLA for Cloth Sorting — qualitative robot integration",
    "project": "touch-until-certain",
    "description": "A qualitative record of force-aligned fabric sensing and the guarded scripted robot workflow; it is not a robot success-rate or learned-policy evaluation.",
    "src": "https://suhangxia-media-1255615484.cos.ap-hongkong.myqcloud.com/public/videos/demos/fabric-omni-demo.mp4",
    "previewSrc": "https://suhangxia-media-1255615484.cos.ap-hongkong.myqcloud.com/public/videos/previews/fabric-omni-demo.mp4",
    "poster": "https://suhangxia-media-1255615484.cos.ap-hongkong.myqcloud.com/public/posters/fabric-omni-demo.webp",
    "duration": 205.12,
    "featured": true,
    "status": "public",
    "objectKey": "public/videos/demos/fabric-omni-demo.mp4",
    "previewKey": "public/videos/previews/fabric-omni-demo.mp4",
    "posterKey": "public/posters/fabric-omni-demo.webp"
  },
  {
    "id": "robocup-ur5e-object-sorting",
    "title": "RoboCup UR5e autonomous object sorting",
    "project": "robocup-ur5e",
    "description": "A ROS-based UR5e YCB object-sorting workflow joining perception, grasp estimation, planning, and execution in the RoboCup environment.",
    "src": "https://suhangxia-media-1255615484.cos.ap-hongkong.myqcloud.com/public/videos/demos/robocup-ur5e-object-sorting.mp4",
    "previewSrc": "https://suhangxia-media-1255615484.cos.ap-hongkong.myqcloud.com/public/videos/previews/robocup-ur5e-object-sorting-midpoint.mp4",
    "poster": "https://suhangxia-media-1255615484.cos.ap-hongkong.myqcloud.com/public/posters/robocup-ur5e-object-sorting-midpoint.webp",
    "duration": 398.49,
    "featured": true,
    "status": "public",
    "objectKey": "public/videos/demos/robocup-ur5e-object-sorting.mp4",
    "previewKey": "public/videos/previews/robocup-ur5e-object-sorting-midpoint.mp4",
    "posterKey": "public/posters/robocup-ur5e-object-sorting-midpoint.webp"
  }
];
/* COS_VIDEO_RECORDS_END */

export const videos: readonly VideoRecord[] = cosVideoRecords;

export const publicVideos = videos.filter((video) => video.status === 'public');

export const localProjectVideos: readonly PlayableVideo[] = [
  {
    id: 'percutaneous-rendering-arm',
    title: 'Registered robot-arm rendering',
    project: 'percutaneous-puncture-surgical-robot',
    description:
      'A retained engineering recording of the planned robot and instrument relationship used during puncture-system development.',
    src: '/media/percutaneous-rendering-arm.mp4',
    poster: '/media/percutaneous-rendering-arm.webp',
    duration: 19.33,
    status: 'public',
  },
  {
    id: 'neurosurgical-probe-rendering',
    title: 'Tracked probe navigation rendering',
    project: 'neurosurgical-robot',
    description:
      'A navigation-workstation recording that keeps the tracked probe, anatomical surface, and robot-frame feedback visible together.',
    src: '/media/neurosurgical-probe-rendering.mp4',
    poster: '/media/neurosurgical-probe-rendering.webp',
    duration: 15,
    status: 'public',
  },
];

export function publicVideoForProject(project: string) {
  return publicVideos.find((video) => video.project === project);
}

export function publicVideosForProject(project: string) {
  return publicVideos.filter((video) => video.project === project);
}

export function publicLocalVideosForProject(project: string) {
  return localProjectVideos.filter((video) => video.project === project && video.status === 'public');
}

export function publicFeaturedVideoForProject(project: string) {
  return publicVideos.find((video) => video.project === project && video.featured);
}
