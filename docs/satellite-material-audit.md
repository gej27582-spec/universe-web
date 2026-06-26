# v0.3.5 卫星与行星材质真实度审计

本审计记录 v0.3.5 的真实材质校准结果。目标是科学观测感：低饱和、克制发光、可辨识纹理、稳定 fallback，不新增大型天体，不引入重后处理。

## 完成度结论

| 项目 | 状态 | 说明 |
| --- | --- | --- |
| 卫星材质体检表 | 已更新 | 覆盖 10 颗现有卫星，增加海卫一专属问题记录。 |
| 材质预设系统 | 已加固 | 保留原 6 类，并新增 `tritonFrost` 氮冰霜冻型。 |
| 海卫一修复 | 已完成代码侧校准 | 从通用冰面预设拆出，降低棕化风险，fallback 改为冷灰/淡粉/暗色条带。 |
| 行星材质档案 | 已建立 | 每颗太阳系天体增加 `materialProfile`，统一粗糙度、发光强度、色彩校准和视觉意图。 |
| 贴图加载与 fallback | 保持 | 彩色贴图继续使用 sRGB；卫星贴图继续按父系统/聚焦按需加载。 |
| 性能边界 | 保持 | 不增加新贴图、不增加后处理，不改变 High/Balanced/Low 结构。 |

## 材质预设

| 预设 | 中文 | 材质类型 | 核心参数 | 适用目标 |
| --- | --- | --- | --- | --- |
| `rockyCratered` | 岩石坑洼型 | `MeshStandardMaterial` | roughness 0.92, low emissive | 月球、木卫四 |
| `icyCracked` | 冰面裂纹型 | `MeshPhysicalMaterial` | roughness 0.58, clearcoat 0.38 | 欧罗巴、木卫三 |
| `volcanicSulfur` | 火山硫磺型 | `MeshStandardMaterial` | sulfur tint, local emissive | 木卫一 |
| `hazyAtmosphere` | 雾霾大气型 | `MeshStandardMaterial` + atmosphere shell | amber haze, high roughness | 泰坦 |
| `irregularRock` | 不规则小天体型 | `MeshStandardMaterial` | roughness 0.97, low fallback | 火卫一、火卫二 |
| `geyserIce` | 喷流冰面型 | `MeshPhysicalMaterial` + particles | ice clearcoat, sparse plume | 恩克拉多斯 |
| `tritonFrost` | 氮冰霜冻型 | `MeshPhysicalMaterial` | roughness 0.64, low clearcoat, cold tint | 海卫一 |

## 卫星单体审计

| 卫星 | 当前贴图路径 | 材质类型 | base texture | normal / roughness / emissive / atmosphere / particle | 当前视觉问题 | v0.3.5 优化 |
| --- | --- | --- | --- | --- | --- | --- |
| 月球 | `textures/satellites/moon.jpg` | `rockyCratered` | 有，按需加载 | normal 无；roughness 无；emissive 无；atmosphere 无；particle 无 | 远景不应首屏加载大贴图 | 保持高粗糙度和地球反照光，不新增资源。 |
| 火卫一 | `textures/satellites/phobos.jpg` | `irregularRock` | 有，按需加载 | normal 无；roughness 无；emissive 无；atmosphere 无；particle 无 | 近景容易暴露低多边形感 | 保留不规则几何、低反光和真实表面贴图。 |
| 火卫二 | `textures/satellites/deimos.jpg` | `irregularRock` | 有，按需加载 | normal 无；roughness 无；emissive 无；atmosphere 无；particle 无 | 细节弱于火卫一 | 保留暗淡碎石 fallback，避免完美球体。 |
| 木卫一 | `textures/moons/io.jpg` | `volcanicSulfur` | 有，按需加载 | normal 无；roughness 无；emissive 局部 sprite；atmosphere 无；particle 无 | 整体发光会削弱真实感 | 降低整体 emissive，只保留局部火山热点。 |
| 欧罗巴 | `textures/moons/europa.png` | `icyCracked` | 有，按需加载 | normal 无；roughness 无；emissive 无；atmosphere 无；particle 无 | 真实感依赖贴图，fallback 需保持冷色裂纹 | 降低清漆强度，保留白蓝冰面读法。 |
| 木卫三 | `textures/moons/ganymede.png` | `icyCracked` | 有，按需加载 | normal 无；roughness 无；emissive 无；atmosphere 无；particle 无 | 与欧罗巴共用冰面类，差异主要靠贴图 | 保持低饱和冰岩混合色。 |
| 木卫四 | `textures/moons/callisto.png` | `rockyCratered` | 有，按需加载 | normal 无；roughness 无；emissive 无；atmosphere 无；particle 无 | 偏暗但合理 | 保留暗色撞击面和高粗糙度。 |
| 泰坦 | `textures/satellites/titan.png` | `hazyAtmosphere` | 有，按需加载 | normal 无；roughness 无；emissive 无；atmosphere 双层；particle 无 | 容易像普通黄球 | 降低本体饱和度，继续用雾霾壳表达大气。 |
| 恩克拉多斯 | `textures/satellites/enceladus.jpg` | `geyserIce` | 有，按需加载 | normal 无；roughness 无；emissive 无；atmosphere 无；particle 南极喷流 | 喷流过亮会像魔法技能 | 保持低亮度、少粒子、Low 模式降密度。 |
| 海卫一 | `textures/satellites/triton.jpg` | `tritonFrost` | 有，按需加载 | normal 无；roughness 无；emissive 无；atmosphere 无；particle 无 | 旧版复用冰面预设，真实贴图在 High/Balanced 下仍容易呈现黄褐“巧克力球” | 新增氮冰霜冻型；真实贴图加载后进行冷灰/淡蓝/淡粉重映射；fallback 同样呈现冷灰、淡粉、暗色条带。 |

## 行星真实材质评分表

评分范围 1–3：1 表示仍偏原型；2 表示科学观测感可接受；3 表示近景辨识强且资源策略稳定。

| 天体 | 颜色可信度 | 纹理层次 | 粗糙度/高光 | 发光克制 | 远近景可读性 | 备注 |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| 太阳 | 2 | 2 | 2 | 2 | 2 | 保留高亮，但不扩大额外辉光。 |
| 水星 | 2 | 2 | 3 | 3 | 2 | 灰褐岩质和撞击坑优先。 |
| 金星 | 2 | 2 | 3 | 3 | 2 | 降低黄橙饱和度，靠大气壳读体积。 |
| 地球 | 3 | 3 | 2 | 3 | 3 | 云层独立，保持海陆识别。 |
| 火星 | 2 | 2 | 3 | 3 | 2 | 降低红色涂抹感，保留暗区/极冠对比。 |
| 木星 | 2 | 2 | 3 | 3 | 3 | 云带真实感依赖贴图，材质改为高粗糙低发光。 |
| 土星 | 2 | 2 | 3 | 3 | 3 | 环和本体分层保留。 |
| 天王星 | 2 | 1 | 3 | 3 | 2 | 低对比冰巨星，后续可补更细大气层次。 |
| 海王星 | 2 | 2 | 3 | 3 | 2 | 深蓝冰巨星低反光，薄大气增强球体深度。 |

## 资源策略

- 本版不新增或替换贴图，因此授权清单无需新增来源。
- 现有卫星贴图继续懒加载，Low 模式仍允许火卫一/火卫二关键小贴图例外。
- 海卫一真实感通过材质预设、真实贴图冷色重映射和 fallback 纹理共同完成；不新增外部资源。
- 后续如果替换海卫一或冰巨星贴图，必须继续使用公共领域、CC0 或 CC BY 资源，并更新 `public/textures/**/ATTRIBUTION.md`。

## 后续方向

- v0.3.6 可继续补行星 normal/roughness 派生图，但要先评估资源体积。
- v0.4 再进入冥王星、卡戎、谷神星、小行星带、彗星和深空观测模式。
