"""Extract only the approved slide images, byte-for-byte; never publish the decks."""

from pathlib import Path
from zipfile import ZipFile
from hashlib import sha256

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path('/home/suhang/datasets2/video')
DESTINATION = ROOT / 'src/assets/media/percutaneous/evidence'
DECKS = {
    '长三角分中心产品调研-柳叶刀产品技术介绍.pptx': {
        'image69.png': 'leica-tracker-p33.png',
        'image70.png': 'robot-workspace-p33.png',
        'image71.png': 'robot-requirements-p33.png',
        'image72.png': 'fixture-cad-p34.png',
        'image73.png': 'fixture-workbench-p34.png',
        'image74.png': 'system-requirements-p34.png',
        'image75.png': 'broadcast-poster-p34.png',
    },
    'About Me.pptx': {
        'image34.jpeg': 'geometric-measurement-p10.jpg',
        'image35.PNG': 'tool-calibration-p11.png',
        'image38.jpeg': 'animal-ct-p12-a.jpg',
        'image39.jpeg': 'animal-ct-p12-b.jpg',
        'image40.png': 'animal-results-p13.png',
        'image46.png': 'patent-CN120876553A.png',
        'image47.png': 'patent-CN120070523A.png',
        'image48.png': 'patent-CN120501514A.png',
        'image49.png': 'patent-CN120053072A.png',
        'image50.png': 'patent-CN120859655A.png',
    },
}


def main():
    DESTINATION.mkdir(parents=True, exist_ok=True)
    for deck, images in DECKS.items():
        with ZipFile(SOURCE / deck) as archive:
            for image, name in images.items():
                data = archive.read(f'ppt/media/{image}')
                destination = DESTINATION / name
                if destination.exists():
                    if destination.read_bytes() != data:
                        raise RuntimeError(f'Refusing to replace different asset: {destination}')
                else:
                    destination.write_bytes(data)
                print(f'{name}: {sha256(data).hexdigest()}')


if __name__ == '__main__':
    main()
