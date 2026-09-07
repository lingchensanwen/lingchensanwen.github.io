# 项目页 GEO 加强：参考研究与实施记录

日期：2026-09-06。范围：主页公开列出的 8 项研究。这是上一轮基础优化的延伸；上一轮报告中的修改范围和检查结果是当时的记录。

## 搜索到的具体参考

| 参考 | 实际观察到的做法 | 本次采用的部分 |
| --- | --- | --- |
| [Pranjal Aggarwal，CMU Language Technologies 博士生](https://pranjal2041.github.io/) | 按研究主题组织项目；项目含作者、年份、研究说明和 Paper / Code / Website / BibTeX 入口。其主页自述研究方向，并链接独立项目网站。 | 新增研究总览；每项研究有独立项目页；身份、标题和引用信息一致。 |
| [ReAct，Shunyu Yao 等](https://react-lm.github.io/) | 页面直接提出研究问题；提供论文、代码、博客、示例和 BibTeX，还讨论失败案例。 | 每页解释研究问题、方法、具体例子和证据范围；所有示意例子都标明是为网页编写，避免伪装成论文实验结果。 |
| [Nerfies，University of Washington / Google Research](https://nerfies.github.io/) | 稳定项目页；作者与机构、简短解释、演示、Paper / Code / Data、多项相关研究和 BibTeX。 | 集中资源入口；保留 MQUD 现有网址与图例；连接相关项目。未复制其代码、图像、视频或视觉设计。 |
| [DSPy，起源于 Stanford NLP](https://dspy.ai/) | 将项目说明、安装入口、文档、教程和任务示例连接起来。 | 让项目页提供明确的复用入口，指向已有代码、数据、模型或 notebook；资源未公布时不放虚假的下载按钮。 |

这里观察的是公开页面的内容与组织方式，并不能据此声称这些研究者专门实施了某种 GEO 策略，或证明页面设计导致其论文引用增长。

更直接相关的是 [GEO 原始论文](https://arxiv.org/html/2311.09735v3)：第一作者 Pranjal Aggarwal 的身份也由其主页与论文作者列表交叉确认。论文在特定实验设置中测试来源引用、统计信息、文字表达等方法，并发现不同方法和任务的效果不同。本文不把这些历史实验数字当作用户网站或今天所有 AI 搜索平台的预期增幅。

[Google 的官方建议](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)仍以有用、可信、可访问的内容为基础，不要求特殊 GEO 标记；llms.txt 不是 Google 排名优化措施。具体示例和清楚的说明为读者提供新增价值，不能被“关键词越多越好”替代。

## 已实现

- `/research/`：按科学图表、agent memory、QUD discourse、生成文本评估和 speech 组织的研究总览。
- `/contextweaver/`、`/qudsim/`、`/qsalience/`、`/qudeval/`、`/elabqud/`、`/qud-parsing/`、`/bilingual-disfluencies/`：7 个独立新项目页。
- `/multimodal-qud/`：沿用现有专属设计与网址，新增复用说明、常见问题、相关项目和静态示例正文。
- 每个新项目页包含：完整论文标题、作者、年份与发表状态、独立 canonical、分享文字元数据、ScholarlyArticle 和 BreadcrumbList JSON-LD、论文级 citation_* 元数据、正文、来源、资源入口、可下载 BibTeX。
- 7 个新页的 BibTeX 提供渐进增强的复制功能。即使关闭 JavaScript，正文、引用、下载链接与页面导航也可用。
- 主页两个语言版本均添加项目页入口；站点地图现在列出 11 个 HTML 页面。
- MQUD 的 5 个例子直接写入静态 HTML。交互脚本先构建成功，再替换静态内容；数据加载失败时保留原有可读例子。

## 内容依据

本次逐项阅读的主要来源：

- MQUD：[论文 v3](https://arxiv.org/abs/2604.23733v3)、[数据卡](https://huggingface.co/datasets/lingchensanwen/mqud/blob/main/README.md)、仓库现有 `multimodal-qud/data.json`。
- ContextWeaver：[论文 v1](https://arxiv.org/html/2604.23069v1)，包括方法描述和附录 E 的实例入口。
- QUDsim：[COLM 论文](https://openreview.net/forum?id=zFz1BJu211)、[arXiv 版本](https://arxiv.org/abs/2504.09373)、[官方仓库](https://github.com/AlliteraryAlligator/QUDsim)。论文作为作者顺序和正式作者姓名的依据；仓库的作者列示与论文存在差异，不照搬仓库顺序。
- QSalience：[EMNLP 论文](https://aclanthology.org/2024.emnlp-main.1114/)、[官方仓库](https://github.com/ritikamangla/QSalience)。数据规模与奖项以论文记录为准；运行、模型入口指向维护中的资源。
- QUDeval：[EMNLP 论文](https://aclanthology.org/2023.emnlp-main.325/)、[官方仓库](https://github.com/lingchensanwen/QUDeval)。
- ElabQUD：[EMNLP 论文](https://aclanthology.org/2023.emnlp-main.336/)、[官方仓库](https://github.com/sheffwb/elabQUD)。保留与更早 elaboration 数据和 Newsela 的来源关系。
- QUD parsing：[Findings of ACL 论文](https://aclanthology.org/2023.findings-acl.710/)、[官方仓库](https://github.com/lingchensanwen/DCQA-QUD-parsing)。明确该工作是 parser 论文，不是最初发布 DCQA 数据集的论文。
- Bilingual disfluencies：[OpenReview workshop 记录](https://openreview.net/forum?id=rrNAqNYRLA)。保持 workshop 身份，未称为诊断工具或假设已经开放参与者数据。

## 本次没有声称完成的事情

这些网页的摘要性说明标为 Research summary；没有将新编说明冒充原文 abstract，也没有声称论文级元数据即可保证 Google Scholar 收录。完整论文仍由链接的学术平台提供。[Scholar 说明](https://scholar.google.com/intl/en/scholar/inclusion.html)

本次没有运行模型推理或复现实验。网页示例不是模型输出。没有修改 coauthor 的远程仓库、Hugging Face 数据卡、Cloudflare 账户配置；没有创建新的镜像域名、付费推广、自动发帖或索引提交。

研究地图 `constructing-questions/` 和原有图像素材保持不变。新页共享独立样式，不修改个人主页的原有 CSS。

## 维护与上线

内容源是 `research/projects.json`；正文示例保存在各项目的 example_html 字段中，仅用于本站可信作者内容。运行：

```sh
python3 scripts/build_research_pages.py
python3 scripts/build_mqud_gallery.py
```

验证生成结果是否最新：

```sh
python3 scripts/build_research_pages.py --check
python3 scripts/build_mqud_gallery.py --check
```

本地生成结果不依赖在线服务，GitHub Pages 可直接提供输出 HTML。MQUD 保留其独立页面，静态 gallery 的标记区由脚本生成。

上线后需再次检查线上页面、robots.txt、sitemap、canonical 和 CDN 对搜索爬虫的处理；随后在站长工具中提交或检查网址，并以真实流量与引用记录评估变化。网页优化、AI 回答中的链接、论文参考文献中的引用应分开计量。

## 检查结果

- 11 个页面和 sitemap 在本地 HTTP 预览中均返回 200。
- 新项目页面的标题、作者和论文级元数据与内容记录对应；JSON-LD 可解析；每页 canonical 唯一。
- 从英文主页只跟随静态 HTML 链接即可到达全部 8 个项目页；所有检查到的新增本地页面、资源和锚点均存在。
- MQUD 无 JavaScript 的源 HTML 含 5 个完整的可展开例子；脚本集成检查覆盖成功增强、按类型筛选、加载失败后保留静态内容。
- 两个生成脚本的 `--check`、JavaScript 语法检查、`git diff --check` 均通过。
- 研究地图、原有 MQUD 图片、原有主页与 MQUD 样式文件的哈希保持不变。

这些检查没有运行真实模型，也没有执行浏览器视觉审阅或证明线上收录。当前结果保留在本地，尚未公开部署。
