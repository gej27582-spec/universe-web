# v0.3.5 资源加载与分级清单

本清单用于记录当前最大资源、加载时机和后续压缩优先级。v0.3.5 不新增大型天体，不新增重后处理，重点在不增加资源体积的前提下校准真实材质。

## 资源策略结论

| 资源类别 | 当前策略 | 后续建议 |
| --- | --- | --- |
| 行星基础贴图 | 首屏随太阳系场景加载 | v0.4 前保持，后续可按外行星延迟加载 |
| 卫星贴图 | 进入对应父行星系统或聚焦卫星时按需加载 | 保持；Low 模式仅保留火卫一/二关键小贴图例外 |
| 音频 | 默认静音，用户点击后加载/播放 | 保持，不阻塞首屏 |
| 特殊现象 | 根据画质档位降低粒子和雾霾细节 | 保持，避免高亮特效堆叠 |
| 银河背景 | 首屏加载单张背景 | 下一轮优先做 2K/4K 分级或更小 WebP 派生 |

## 最大资源清单

| 文件 | 大小 | 当前用途 | 加载时机 | 建议 |
| --- | ---: | --- | --- | --- |
| `textures/solar-system-scope/8k_stars_milky_way.jpg` | 1.82 MB | 银河背景 | 首屏 | 高优先级：建立低/高两档背景 |
| `textures/satellites/moon.jpg` | 1.01 MB | 月球表面 | 地月系统按需 | 保持按需，后续可补低分辨率派生 |
| `textures/solar-system-scope/2k_earth_clouds.jpg` | 0.92 MB | 地球云层 | 首屏 | 中优先级：Low 可考虑静态低清云图 |
| `textures/moons/europa.png` | 0.87 MB | 欧罗巴冰面 | 木星系统按需 | 保持按需，后续可压缩为 WebP |
| `textures/satellites/enceladus.jpg` | 0.85 MB | 土卫二冰面 | 土星系统按需 | 保持按需 |
| `textures/solar-system-scope/2k_mercury.jpg` | 0.83 MB | 水星表面 | 首屏 | 低优先级，体积可接受 |
| `textures/satellites/titan.png` | 0.81 MB | 泰坦表面 | 土星系统按需 | 保持按需，重点保留雾霾壳可读性 |
| `textures/moons/ganymede.png` | 0.78 MB | 木卫三表面 | 木星系统按需 | 保持按需 |
| `textures/solar-system-scope/2k_sun.jpg` | 0.78 MB | 太阳表面 | 首屏 | 可接受 |
| `textures/solar-system-scope/2k_mars.jpg` | 0.72 MB | 火星表面 | 首屏 | 可接受 |

## 验收记录项

- 构建后记录 `index` 主包、`SolarSystemScene` 场景分包和 CSS 体积。
- 浏览器验证 High / Balanced / Low 下火卫一、火卫二贴图均可见。
- 阻断任一卫星贴图时，场景应保留程序 fallback，不出现空白或崩溃。
- 生产模式记录 FPS、draw calls、triangles、textures 和 loaded satellite textures。
