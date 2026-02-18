---
layout: page
title: "DeCo-MAE: Teaching Robots to 'Understand' Unseen Actions"
description: Achieving 78.86% Zero-Shot Accuracy by Decomposing Human-Robot Interaction Semantics.
# img: assets/img/DeCoMAE/teaser.jpg  # TODO: 添加图片后取消注释
img: assets/img/NS.gif
importance: 5
category: work
related_publications: true
---

## The Challenge: Beyond Pattern Matching
[cite_start]Current SOTA models like **VideoMAE V2** excel at memorizing closed-set actions but often fail in open-ended **Human-Robot Interaction (HRI)**[cite: 9, 32]. [cite_start]When faced with a new combination—like "Walking with a Polisher" instead of a "Drill"—traditional "Black Box" models are rendered helpless[cite: 23, 24, 29].

## Our Vision: DeCo-MAE
[cite_start]We propose **DeCo-MAE** (Decomposed Semantic VideoMAE), a framework designed to learn **genuine semantic understanding** rather than simple pattern matching[cite: 16, 34]. 

### 🚀 Key Innovations
* **Semantic Decomposition**: We break down complex actions into a triplet structure: **(Action, Tool, Modifier)**[cite: 48]. By aligning visual tokens with a frozen **BERT** language encoder, the robot learns the "concept" of a tool rather than just its pixels[cite: 11, 50].
* [cite_start]**Dual-Head Architecture**: A non-symmetric design that balances discriminative power with open-set generalization[cite: 46].
* [cite_start]**Cool-down Fine-tuning**: A specialized two-stage training strategy (Robustness $\rightarrow$ Precision) that effectively bridges the distribution shift on small-scale HRI datasets[cite: 12, 52, 53].

---

## 🏆 State-of-the-Art Performance
[cite_start]On the **HRI30** dataset, DeCo-MAE doesn't just improve—it unlocks entirely new capabilities[cite: 13, 14]:

| Metric | VideoMAE V2 (Giant) | **DeCo-MAE (Ours)** |
| :--- | :---: | :---: |
| **Fully-Supervised Accuracy** | 83.60% | [cite_start]**85.80%** [cite: 14] |
| **Zero-Shot (Unseen Action)** | 0.00% (Fail) | [cite_start]**78.86%** [cite: 15] |

> [cite_start]**"Our model successfully identifies novel actions by decomposing video semantics into primitives, paving the way for generalizable HRI systems."** [cite: 16, 29]

---

## Technical Visualizations

### Architecture
<!-- TODO: 添加 assets/img/DeCoMAE/architecture_new.jpg 后取消下方注释
<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/DeCoMAE/architecture_new.jpg" title="Professional Architecture" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
   Overview of the Dual-Head mechanism. We combine Cross-Entropy loss $\mathcal{L}_{CE}$ with Semantic Cosine Similarity $\mathcal{L}_{sem}$ to supervise the learning process.
</div>
-->

### Does the model "see" the tool?
Yes. [cite_start]Our **Cross-Modal Attention** maps demonstrate that even for **Unseen classes**, DeCo-MAE explicitly focuses on the interaction area between the human hand and the tool[cite: 73, 104].

<!-- TODO: 添加 assets/img/DeCoMAE/attention_map.jpg 后取消下方注释
<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/DeCoMAE/attention_map.jpg" title="Attention Visualization" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
-->

---

## Collaborators & Resources

* [cite_start]**Suhang Xia**: Principal Investigator (King's College London).
* **Dr. [cite_start]Shan Luo**: Project Supervisor.
* *(Optional)* **[Name]**: [Contribution, e.g., Data Collection].

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        <a href="https://github.com/SuhangXia/DeCo-MAE" class="btn btn-sm z-depth-1" role="button">GitHub</a>
        <a href="https://github.com/SuhangXia/DeCo-MAE/blob/main/DeCo-MAE_Report_v09.pdf" class="btn btn-sm z-depth-1" role="button">Technical Report</a>
        <a href="https://github.com/SuhangXia/DeCo-MAE/blob/main/Poster.pdf" class="btn btn-sm z-depth-1" role="button">Project Poster</a>
    </div>
</div>
