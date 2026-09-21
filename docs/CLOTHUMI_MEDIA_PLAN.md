# ClothUMI 媒体采集与页面计划

## 页面叙事

ClothUMI 在网站中按论文已经支持的证据链展示：

```text
Portable demonstration → Calibrated sensor record → Frozen UniForce conditioning → Franka comparison
```

当前页面已将 ClothUMI 放在最近项目第一位，并用网站原生文字呈现论文中的受控对比。四个照片/视频位仍保持空白；没有用调试截图、训练曲线或仓库中的临时素材冒充正式项目视觉。

需要注意：论文当前的定量实验是固定布局、低对比度的白色圆柱到白色圆盘接触任务。接触即计为成功，不要求稳定放置。它不是布料任务，也不是完整 pick-and-place benchmark。

## P0 — 需要优先提供的视频

### 1. UMI 示教采集

- 横屏 16:9，至少 1920×1080；提供未经剪辑的 MP4 或 MOV。
- 建议 2–3 条完整 take，每条 15–40 秒；动作前后各保留约 2 秒。
- 固定机位优先，画面同时看得到手持 gripper、wrist camera、接触对象和主要工作区。
- 如果有论文所述的 cylinder-to-plate 示教，请优先提供，并注明它是否来自 strict 06/19 数据子集。
- 如果视频是布料操作，也可以提供，但请注明它是系统能力展示还是尚未进入论文定量结果的后续实验。

### 2. UniForce + Diffusion Policy 在 Franka FR3 上推理

- 横屏 16:9，至少 1920×1080；固定机位，15–45 秒。
- 画面必须包含初始状态、连续机器人动作和最终接触结果。
- 至少提供 1–2 个成功 rollout；典型失败可额外提供 1 条，用于展示系统边界。
- 请确认视频使用的 checkpoint 条件：`UniForce + DP`，而不是 vision-only 或尚未进入论文结果的后续模型。
- 请注明该 rollout 是否属于论文统计的 34 次 UniForce 条件测试；若不是，页面会标为 illustrative deployment footage，不把它当作定量实验样本。

### 3. Vision-only Diffusion Policy 对照（如有）

- 最好与 UniForce 视频使用同一固定机位、任务布局和近似起始状态。
- 各提供一条成功与一条典型失败最有价值；没有也不影响第一版页面。
- 明确标注 `vision-only DP`、成功/失败、拍摄日期，以及是否属于论文统计的 34 次对照测试。

### 4. π0.5 路线（可选）

- 如果有 π0.5 在 Franka 上的推理片段，请按同样方式提供固定机位原视频，并标注 checkpoint、任务、成功/失败和日期。
- 该片段会作为额外 policy-interface 测试展示，与论文中的 `UniForce + DP` / vision-only 34 对 34 比较分开标注。

这组素材可让 Research 页面直接呈现“相同 policy interface，只增加 UniForce tactile branch”的实验逻辑。首页只使用克制的 UMI → Franka 视觉转场，不在循环视频里暗示统计显著性。

## P0 — 需要优先提供的照片

1. **便携式 UMI 系统全景**：手持 gripper、wrist RGB camera、Quest tracking 部件和工作区同时可见；横向 3:2 或 4:3，长边至少 2500 px。
2. **双指触觉细节**：左右 tactile imaging path / sensing surface 的正面和安装关系；至少一张无接触、一张接触状态。
3. **Franka FR3 部署全景**：机械臂、wrist camera、parallel-jaw end effector 和任务物体完整入镜。
4. **论文任务状态**：白色圆柱与白色圆盘的初始布局、发生接触的瞬间、结束状态各一张；如果该装置已拆除则不用重拍。

每个场景建议提供 3–5 张原图，以便同时适配桌面、手机裁切和文字留白。

## P1 — 同一 episode 的多模态证据

如果方便，请从同一条 UMI episode 导出：

- 一帧 wrist RGB 原图；
- 同一 policy 时刻所对应的 left tactile 与 right tactile 原图；
- 左右各自的 no-contact reference image；
- 对应 causal six-frame tactile window，最好保留六张独立图片；
- 可选：alignment / replay-buffer audit 截图或 Quest-to-camera trajectory 可视化。

不要提前拼图、裁切、上色或加字幕。只需给出 episode 名称和 frame/time 标识，网页端再完成对齐排版。

论文中的 policy architecture 已经是可复用的 TikZ 矢量图，因此这个结构图不需要重新提供；收到真实 sensor frames 后，可以与论文图组合成“输入 → UniForce → policy”的完整证据位。

## 每个文件都需要附带的信息

- 任务名称与拍摄日期；
- `UMI demonstration`、`UniForce + DP` 或 `vision-only DP`；
- 成功 / 失败，以及使用的成功判据；
- 是否属于 strict 06/19 对比或论文报告的 68 个 rollout；
- 是否允许公开；
- 是否需要遮挡人脸、屏幕、实验室标识或其他信息。

## 拍摄与交付建议

- 优先水平构图；手机拍摄请锁定横屏、曝光和焦点。
- 避免频繁移动、数字变焦、自动曝光跳变和强反光。
- 主体周围保留约 15%–20% 安全空间，方便响应式裁切。
- 请提供相机原文件，不要通过会自动压缩的视频或聊天渠道转存。
- 原速、原色、环境声即可；不要预加字幕、音乐、滤镜、水印或快慢放。

推荐命名：

```text
clothumi_umi_demo_<task>_<dataset-or-date>_take01.mp4
clothumi_franka_uniforce_dp_<task>_success01.mp4
clothumi_franka_vision_only_dp_<task>_failure01.mp4
clothumi_umi_system_wide_01.jpg
clothumi_dual_tactile_detail_01.jpg
clothumi_franka_system_wide_01.jpg
clothumi_wrist_rgb_<episode>_<frame>.png
clothumi_tactile_left_<episode>_<frame>.png
clothumi_tactile_right_<episode>_<frame>.png
```

## 收到素材后的页面落位

| 页面位置 | 首选素材 | 处理方式 |
|---|---|---|
| 首页 ClothUMI 主媒体 | UMI 示教 + UniForce/DP Franka rollout | 短而克制的 human → robot 转场；不叠加胜率结论 |
| Research / Demonstrate | 完整 UMI 示教视频 | 用户控制播放，注明任务与数据来源 |
| Research / Align | 系统全景 + 同时刻 RGB / 左右 tactile | 保持可追溯的多模态并置 |
| Research / Encode | 论文 architecture + causal window | 使用原有 TikZ 结构，不重新发明模型图 |
| Research / Compare | UniForce + DP 与 vision-only rollout | 相同条件尽量并排，明确模型和结果标签 |

收到并核对素材前，页面继续显示 `Source pending`。
