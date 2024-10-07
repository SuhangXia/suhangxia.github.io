---
layout: page
title: Indoor Navigation of Quadrotor UAV with EGO-Planner
description: Dissertation with distinction
img: assets/img/uav _ego.gif
importance: 1
category: work
related_publications: true
---



<h1 style="text-align: center;"><strong>Abstract</strong></h1>

This paper presents an in-depth study on the route planning and trajectory optimisation techniques for quadrotor UAVs. Firstly, the research status of UAV route planning algorithms is introduced, including global path planning algorithms and local trajectory planning algorithms. Then, this paper designs a system scheme for quadrotor UAV control and establishes its dynamics model. On this basis, a controller based on PD feed-forward compensation is designed, and the effectiveness of this controller in quadrotor UAV control is verified through parameter tuning and simulation analysis. In terms of route planning, this paper investigates the Dijkstra algorithm based on the breadth-first algorithm (BFS), and the A* algorithm path planning algorithm based on the depth-first algorithm (DFS) and the greedy best-first search algorithm, and analyses their applications in quadrotor UAV route planning. Further, this paper carries out a trajectory optimisation study and explores the application of segmented polynomials, Bessel curves and B spline curves in trajectory planning. In order to achieve rapid trajectory optimisation, a trajectory optimisation algorithm based on multi-objective optimisation is proposed, which achieves rapid trajectory generation and optimisation through trajectory representation and collision region trajectory detection, obstacle thrust calculation and multi-objective optimisation function design.Finally, the effectiveness of the trajectory optimisation algorithm proposed in this paper is verified through simulation experiments, which proves its practical value and potential application prospect in improving UAV route planning and trajectory optimisation.

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/1.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/3.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/5.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Caption photos easily. On the left, a road goes through a tunnel. Middle, leaves artistically fall in a hipster photoshoot. Right, in another hipster photoshoot, a lumberjack grasps a handful of pine needles.
</div>
<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/5.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    This image can also have a caption. It's like magic.
</div>
You can also put regular text between your rows of images, even citations {% cite einstein1950meaning %}.
Say you wanted to write a bit about your project before you posted the rest of the images.
You describe how you toiled, sweated, _bled_ for your project, and then... you reveal its glory in the next row of images.

<div class="row justify-content-sm-center">
    <div class="col-sm-8 mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/6.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-sm-4 mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/11.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    You can also have artistically styled 2/3 + 1/3 images, like these.
</div>
The code is simple.
Just wrap your images with `<div class="col-sm">` and place them inside `<div class="row">` (read more about the <a href="https://getbootstrap.com/docs/4.4/layout/grid/">Bootstrap Grid</a> system).
To make images responsive, add `img-fluid` class to each; for rounded corners and shadows use `rounded` and `z-depth-1` classes.
Here's the code for the last row of images above:

{% raw %}

```html
<div class="row justify-content-sm-center">
  <div class="col-sm-8 mt-3 mt-md-0">
    {% include figure.liquid path="assets/img/6.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
  </div>
  <div class="col-sm-4 mt-3 mt-md-0">
    {% include figure.liquid path="assets/img/11.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
  </div>
</div>
```

{% endraw %}
