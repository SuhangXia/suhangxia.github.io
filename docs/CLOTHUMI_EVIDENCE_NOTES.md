# ClothUMI website evidence notes

This note records the source boundary for public-facing ClothUMI copy.

## Sources inspected

- Paper draft: `/home/suhang/projects/latex/6a626186ab4b99318ba3b9e3`
- Paper sections: abstract, introduction, system, policy, experiments, discussion, and conclusion
- Paper-native figures: `figures/policy_architecture.tex` and `figures/task_results.tex`
- Implementation note: `/home/suhang/projects/Clothumi/README_vision_only_0619.md`
- Policy configurations: `train_clothumi_fr3_uniforce_dp.yaml` and `train_clothumi_fr3_vision_0619_dp.yaml`
- π0.5 route: `/home/suhang/projects/Clothumi/tools/franka_pi05_tcp_client.py`

Both source repositories were inspected read-only.

## Claims used on the website

- ClothUMI combines Quest pose, wrist RGB, two fingertip tactile streams, gripper opening, camera-relative actions, and Franka FR3 deployment.
- The tactile policy uses causal six-frame histories on both sides, a frozen UniForce temporal encoder, and eight compact contact tokens.
- The controlled comparison uses the same strict 06/19 subset: 77 demonstrations and the same RGB/state/action and Diffusion Policy interface.
- Vision-only DP records 10/34 contact successes (29.4%; Wilson 95% CI 16.8–46.2%).
- UniForce + DP records 14/34 (41.2%; Wilson 95% CI 26.4–57.8%).
- The observed difference is four successful contacts, or 11.8 percentage points.
- The two-sided Fisher exact test is p = 0.447, so the result is preliminary and not statistically significant.
- A separate calibrated π0.5 Franka control route was tested; it is presented as an additional policy-interface test, not as a numerical comparator.

## Claims intentionally excluded

- No claim of cloth-task performance is made from the current experiment.
- Contact success is not described as full pick-and-place success.
- UniForce is described as an external frozen representation, not a method invented by ClothUMI.
- The 222-episode corpus is not substituted for the 77-episode controlled comparison.
- Planned randomized layouts, temporal ablations, failure-stage labels, and deformable-object tasks are not described as completed.
- Later 06/19+06/23 checkpoints are not used to reinterpret the reported 68 physical rollouts.
- No π0.5 success rate, baseline comparison, or conclusion is inferred without a separately recorded rollout protocol and outcome table.
