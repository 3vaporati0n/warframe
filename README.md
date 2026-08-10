# Warframe Mod 伤害计算器

面向主武器与近战的可验证配装计算器。目标是复现游戏军械库的横版 Mod 卡、槽位、极性、容量、赋能、战甲增伤和目标伤害，同时把计算器实际执行的公式、乘区和来源展示给玩家。

当前仓库提供第一个可运行纵向切片：

- Next.js 16 App Router 页面；
- 4×2 普通 Mod 槽；
- 横版 Serration 卡片与等级 0–10；
- 匹配、错配和无极性容量规则；
- 配装合法性与容量超限检查；
- 变量级 Wiki 来源和可执行公式轨迹；
- 未经游戏测试的伤害效果明确标记为不完整，且不进入最终伤害。

## 本地运行

需要 Node.js 20.9 或更高版本，推荐使用仓库 `.nvmrc` 中的 Node 22。

```bash
npm ci
npm run dev
```

打开 <http://localhost:3000>。

## 验证

```bash
npm run check
npm run build
```

`npm run check` 依次执行 Vitest、TypeScript 类型检查和 ESLint。

## 准确性边界

正式结果只采用同时具备结构化数据、Wiki 公式、游戏内观察和自动回归测试的规则。缺少任何证据时，效果状态为 `unverified` 或 `unsupported`，界面必须显示结果不完整，不使用推测值或静默零值。

当前 Serration 等级、容量、极性与 Wiki 修订已经进入回归测试；伤害加成仍缺少保存到仓库的游戏内观察样本，因此暂不计入最终伤害。卡面使用中性占位视觉，直到准确图片映射与资源使用条件核对完成。

## 当前直接来源

- [Serration 永久修订 2699779](https://wiki.warframe.com/w/Serration?oldid=2699779)
- [Polarity 永久修订 2793391](https://wiki.warframe.com/w/Polarity?oldid=2793391)
- [WARFRAME Wiki Mod 数据模块](https://wiki.warframe.com/w/Module%3AMods/data)
- [WFCD/warframe-items](https://github.com/WFCD/warframe-items)
- [Next.js 安装文档](https://nextjs.org/docs/app/getting-started/installation)

完整产品边界与实施记录位于 `docs/superpowers/`。

本项目是社区工具，与 Digital Extremes 没有隶属或官方合作关系。Warframe 相关名称和素材归其各自权利人所有。
