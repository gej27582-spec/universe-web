# v0.3.2 卫星材质体检表

本表记录 v0.3.2 对 10 颗已存在卫星的材质、贴图、视觉问题和优化方向。项目不新增卫星，不引入重后处理；目标是让材质配置可维护、可降级、可审计。

## 完成度结论

| 项目 | 状态 | 说明 |
| --- | --- | --- |
| 卫星材质体检表 | 已建立 | 本文档覆盖所有卫星。 |
| 材质预设系统 | 已建立 | `src/lib/satelliteMaterials.ts` 提供 6 类预设。 |
| 四颗代表卫星差异 | 已优化 | 木卫一、欧罗巴、泰坦、恩克拉多斯使用不同材质预设和克制特效。 |
| 小卫星非球体 | 已完成 | 火卫一、火卫二走 `irregularRock`，使用不规则几何、真实表面贴图和低反光材质。 |
| 贴图加载与 fallback | 已完成 | 彩色贴图设置 `SRGBColorSpace`，失败保留 procedural fallback；卫星贴图按父系统/聚焦懒加载。 |
| 视觉统一 | 已完成 | 深空观测站风格、低饱和、少量科学观测感特效。 |

## 材质预设

| 预设 | 中文 | 材质类型 | 核心参数 | 适用目标 |
| --- | --- | --- | --- | --- |
| `rockyCratered` | 岩石坑洼型 | `MeshStandardMaterial` | roughness 0.9, low emissive | 月球、木卫四 |
| `icyCracked` | 冰面裂纹型 | `MeshPhysicalMaterial` | clearcoat 0.52, cool fallback | 欧罗巴、木卫三、海卫一 |
| `volcanicSulfur` | 火山硫磺型 | `MeshStandardMaterial` | sulfur color, local emissive | 木卫一 |
| `hazyAtmosphere` | 雾霾大气型 | `MeshStandardMaterial` + atmosphere shell | amber haze, high roughness | 泰坦 |
| `irregularRock` | 不规则小天体型 | `MeshStandardMaterial` | roughness 0.96, lazy texture, low fallback | 火卫一、火卫二 |
| `geyserIce` | 喷流冰面型 | `MeshPhysicalMaterial` + particles | ice clearcoat, sparse plume | 恩克拉多斯 |

## 单体审计

| 卫星 | 当前贴图路径 | 材质类型 | 当前材质参数 | base texture | normal / roughness / emissive / atmosphere / particle | 当前视觉问题 | 优化建议 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 月球 | `textures/satellites/moon.jpg` | `rockyCratered` / `MeshStandardMaterial` | roughness 0.9, metalness 0, low emissive | 有，按需加载 | normal 无；roughness 无；emissive 无；atmosphere 无；particle 无 | 贴图较大，远景不应首屏加载 | 保留 fallback 月面纹理，聚焦地月系统再加载图片 |
| 火卫一 | `textures/satellites/phobos.jpg` | `irregularRock` / `MeshStandardMaterial` | roughness 0.96, low emissive | 有，按需加载 | normal 无；roughness 无；emissive 无；atmosphere 无；particle 无 | v0.3.3 初版只有程序 fallback，近景像低多边形色块 | 保持不规则几何和低反光，高/均衡模式加载 NASA 表面贴图，低配 fallback |
| 火卫二 | `textures/satellites/deimos.jpg` | `irregularRock` / `MeshStandardMaterial` | roughness 0.96, low emissive | 有，按需加载 | normal 无；roughness 无；emissive 无；atmosphere 无；particle 无 | v0.3.3 初版只有程序 fallback，近景缺少真实坑洼细节 | 使用 NASA 表面贴图区分火卫一，保留不规则几何和低配 fallback |
| 木卫一 | `textures/moons/io.jpg` | `volcanicSulfur` / `MeshStandardMaterial` | roughness 0.76, local emissive | 有，按需加载 | normal 无；roughness 无；emissive 局部 sprite；atmosphere 无；particle 无 | v0.3 整体辉光偏大，容易像整颗球发光 | 改成 3 个小型火山热点，降低整体 emissive |
| 欧罗巴 | `textures/moons/europa.png` | `icyCracked` / `MeshPhysicalMaterial` | roughness 0.52, clearcoat 0.52 | 有，按需加载 | normal 无；roughness 无；emissive 无；atmosphere 无；particle 无 | 贴图较大，低配不宜默认加载 | 低配使用冷色裂纹 fallback，高/均衡聚焦加载贴图 |
| 木卫三 | `textures/moons/ganymede.png` | `icyCracked` / `MeshPhysicalMaterial` | roughness 0.52, clearcoat 0.52 | 有，按需加载 | normal 无；roughness 无；emissive 无；atmosphere 无；particle 无 | 文件偏大，远景收益有限 | 按父系统加载，低配 fallback |
| 木卫四 | `textures/moons/callisto.png` | `rockyCratered` / `MeshStandardMaterial` | roughness 0.9 | 有，按需加载 | normal 无；roughness 无；emissive 无；atmosphere 无；particle 无 | 视觉较暗但合理 | 保留高粗糙度，聚焦加载 |
| 泰坦 | `textures/satellites/titan.png` | `hazyAtmosphere` / `MeshStandardMaterial` | roughness 0.88, amber haze | 有，按需加载 | normal 无；roughness 无；emissive 无；atmosphere 双层；particle 无 | 如果只看本体会像黄球 | 保持半透明雾霾壳，本体降低饱和并按需加载 |
| 恩克拉多斯 | `textures/satellites/enceladus.jpg` | `geyserIce` / `MeshPhysicalMaterial` | roughness 0.46, clearcoat 0.38 | 有，按需加载 | normal 无；roughness 无；emissive 无；atmosphere 无；particle 南极喷流 | 喷流必须克制，避免魔法技能感 | Low 模式降低粒子数和亮度，使用普通混合 |
| 海卫一 | `textures/satellites/triton.jpg` | `icyCracked` / `MeshPhysicalMaterial` | roughness 0.52, clearcoat 0.52 | 有，按需加载 | normal 无；roughness 无；emissive 无；atmosphere 无；particle 无 | 逆行轨道已表达，材质可继续偏冷 | 保留冷粉冰霜 fallback 和逆行轨道色 |

## 资源策略

- 彩色贴图统一设置 `texture.colorSpace = THREE.SRGBColorSpace`。
- fallback 纹理使用 canvas 生成，避免贴图失败导致空白。
- 卫星贴图不在首屏统一加载，只在进入对应父行星系统或聚焦卫星时加载。
- Low 模式跳过高成本卫星图片贴图；火卫一、火卫二因贴图较小且近景识别依赖坑洼细节，仍按需加载。
- 火卫一、火卫二使用小尺寸 NASA 表面贴图；即使 Low 模式也只在进入火星卫星系统后按需加载。
