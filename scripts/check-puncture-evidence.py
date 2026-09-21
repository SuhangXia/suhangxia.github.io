"""Read-only regression checks of the built puncture and About pages."""

from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
from zipfile import ZipFile
import runpy

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'


class Page(HTMLParser):
    def __init__(self, relative):
        super().__init__()
        self.html = (DIST / relative).read_text()
        self.tags = []
        self.text = []
        self.rows = []
        self.row = None
        self.cell = None
        self.feed(self.html)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append((tag, attrs))
        if tag == 'tr':
            self.row = []
        if tag in ('td', 'th'):
            self.cell = []

    def handle_data(self, text):
        self.text.append(text)
        if self.cell is not None:
            self.cell.append(text)

    def handle_endtag(self, tag):
        if tag in ('td', 'th') and self.cell is not None:
            self.row.append(' '.join(''.join(self.cell).split()))
            self.cell = None
        if tag == 'tr' and self.row is not None:
            self.rows.append(self.row)
            self.row = None

    def attrs(self, tag):
        return [attrs for current, attrs in self.tags if current == tag]


def check(condition, message):
    assert condition, message
    print(f'PASS {message}')


puncture = Page('research/percutaneous-puncture-surgical-robot/index.html')
about = Page('about/index.html')
home = Page('index.html')

for name, page in [('Puncture', puncture), ('About', about)]:
    ids = [attrs['id'] for _, attrs in page.tags if 'id' in attrs]
    check(all(count == 1 for count in Counter(ids).values()), f'{name}: unique HTML IDs')
    check(all(not attrs.get('src') or attrs.get('alt') for attrs in page.attrs('img')), f'{name}: every content image has alternative text')
    labels = [attrs['aria-labelledby'] for _, attrs in page.tags if 'aria-labelledby' in attrs]
    check(all(label in ids for value in labels for label in value.split()), f'{name}: accessible heading references resolve')
    for attrs in page.attrs('a'):
        if 'data-lightbox-src' in attrs:
            check((DIST / unquote(urlsplit(attrs['data-lightbox-src']).path).lstrip('/')).is_file(), f'{name}: full-image asset exists: {attrs.get("data-lightbox-title")}')

section_order = ['nmpa-registration', 'my-contribution', 'system-calibration', 'animal-study', 'puncture-engineering-title', 'project-demos-title', 'puncture-patent-link-title']
offsets = [puncture.html.index(f'id="{identifier}"') for identifier in section_order]
check(offsets == sorted(offsets), 'Certificate → contribution → method → study → engineering → videos → patents')
nodes = {attrs['data-flow-node'] for _, attrs in puncture.tags if 'data-flow-node' in attrs}
check(nodes == {'fixtureCmm', 'ctScan', 'ctGeometry', 'pivot', 'landmark', 'icp', 'toolCmm', 'toolCalibration', 'toolAxis', 'handEye', 'target', 'reference', 'removal', 'motion', 'actual', 'errors', 'report'}, 'All confirmed workflow nodes are present')
check(puncture.rows[1:] == [
    ['Mean error', '0.54 mm', '4.63 mm'],
    ['Standard deviation', '1.109 mm', '6.529 mm'],
    ['First-attempt puncture success', '27/30 (90%)', '16/30 (53.3%)'],
    ['Total puncture attempts', '34', '52'],
    ['Mean attempts per target', '1.13', '1.73'],
], 'Animal-study table exactly matches the approved source values')
check(len(puncture.attrs('video')) == 1 and all('controls' in attrs for attrs in puncture.attrs('video')), 'One retained engineering video has native controls')
check('from the actual TCP origin to the planned reference line' in puncture.html, 'Point-to-line direction is actual TCP → planned line')
check('privacy-masked' in puncture.html and '国械注准20263011303' in puncture.html, 'Masked registration certificate and registration number retained')

extractor = runpy.run_path(str(ROOT / 'scripts/extract-puncture-evidence.py'))
for deck, files in extractor['DECKS'].items():
    with ZipFile(extractor['SOURCE'] / deck) as archive:
        for original, destination in files.items():
            check((extractor['DESTINATION'] / destination).read_bytes() == archive.read(f'ppt/media/{original}'), f'Original bytes preserved: {destination}')
            page = about if destination.startswith('patent-') else puncture
            check(destination.rsplit('.', 1)[0] in page.html, f'Approved slide asset is used: {destination}')

patent_order = ['CN120501514A', 'CN120053072A', 'CN120859655A', 'CN120070523A', 'CN120876553A']
check([attrs['id'] for attrs in about.attrs('article') if attrs.get('id', '').startswith('CN')] == patent_order, 'Five patents, first-listed inventor records first')
check(about.html.count('First-listed inventor · Suhang Xia') == 3, 'Exactly three first-listed inventor labels')
check(len(about.attrs('details')) == 5, 'All five original application front pages can expand')
check('Patent Applications' in about.html and 'Research outputs' not in about.html, 'Patent section does not restore Research outputs')
check(any(attrs.get('href') == '/about/#patent-applications' for attrs in puncture.attrs('a')), 'Project links to the About patent section')
selected = [attrs['id'] for _, attrs in home.tags if 'data-project-feature' in attrs]
check(selected == ['clothumi', 'touch-until-certain', 'robocup-ur5e', 'percutaneous-puncture-surgical-robot', 'neurosurgical-robot', 'uav-navigation'], 'Homepage selected-project order is unchanged')
check((DIST / 'research/deco-mae/index.html').is_file(), 'DeCo-MAE detail page is retained')
check('/research/percutaneous-puncture-surgical-robot/' in (DIST / 'research/surgical-robot-systems/index.html').read_text(), 'Legacy surgical-project redirect is retained')
check(not list(DIST.rglob('*.pptx')), 'No complete company presentation is published')
print('PASS Puncture evidence regression checks complete')
