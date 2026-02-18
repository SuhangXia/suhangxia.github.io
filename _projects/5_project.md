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
Current SOTA models like **VideoMAE V2** excel at memorizing closed-set actions but often fail in open-ended **Human-Robot Interaction (HRI)**. When faced with a new combination—like "Walking with a Polisher" instead of a "Drill"—traditional "Black Box" models are rendered helpless.

## Our Vision: DeCo-MAE
We propose **DeCo-MAE** (Decomposed Semantic VideoMAE), a framework designed to learn **genuine semantic understanding** rather than simple pattern matching.

### 🚀 Key Innovations
* **Semantic Decomposition**: We break down complex actions into a triplet structure: **(Action, Tool, Modifier)**. By aligning visual tokens with a frozen **BERT** language encoder, the robot learns the "concept" of a tool rather than just its pixels.
* **Dual-Head Architecture**: A non-symmetric design that balances discriminative power with open-set generalization.
* **Cool-down Fine-tuning**: A specialized two-stage training strategy (Robustness $\rightarrow$ Precision) that effectively bridges the distribution shift on small-scale HRI datasets.

---

## 🏆 State-of-the-Art Performance
On the **HRI30** dataset, DeCo-MAE doesn't just improve—it unlocks entirely new capabilities:

| Metric | VideoMAE V2 (Giant) | **DeCo-MAE (Ours)** |
| :--- | :---: | :---: |
| **Fully-Supervised Accuracy** | 83.60% | **85.80%** |
| **Zero-Shot (Unseen Action)** | 0.00% (Fail) | **78.86%** |

> **"Our model successfully identifies novel actions by decomposing video semantics into primitives, paving the way for generalizable HRI systems."**

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
Yes. Our **Cross-Modal Attention** maps demonstrate that even for **Unseen classes**, DeCo-MAE explicitly focuses on the interaction area between the human hand and the tool.

<!-- TODO: 添加 assets/img/DeCoMAE/attention_map.jpg 后取消下方注释
<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/DeCoMAE/attention_map.jpg" title="Attention Visualization" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
-->

---

## Collaborators & Resources

* **Suhang Xia**: Principal Investigator (King's College London).
* **Ruiyi Hu**: Collaborator.
* **Muye Yuan**: Collaborator.
* **Dr. Oya Celiktutan**: Project Supervisor.

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        <a href="https://github.com/SuhangXia/DeCo-MAE" class="btn btn-sm z-depth-1" role="button">GitHub</a>
        <a href="https://github.com/SuhangXia/DeCo-MAE/blob/main/DeCo-MAE_Report_v09.pdf" class="btn btn-sm z-depth-1" role="button">Technical Report</a>
        <a href="https://github.com/SuhangXia/DeCo-MAE/blob/main/Poster.pdf" class="btn btn-sm z-depth-1" role="button">Project Poster</a>
    </div>
</div>
