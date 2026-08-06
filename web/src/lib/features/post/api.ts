import { getApi, fetchOrNull } from '$lib/shared/clients/api';
import type {
	PostDetail,
	PostLatestCheckResponse,
	PostListResponse,
	PostRelatedMoment,
	PostSummary
} from '$lib/features/post/types';

type PostListOptions = {
	page?: number;
	pageSize?: number;
};

export const getPostList = async (
	fetcher?: typeof fetch,
	{ page = 1, pageSize = 10 }: PostListOptions = {}
): Promise<PostListResponse> => {
	const api = getApi(fetcher);
	const query = new URLSearchParams({
		page: String(page),
		pageSize: String(pageSize)
	});
	const result = await api<PostListResponse>(`/articles?${query.toString()}`).catch(() => null);
	const mockArticles: PostSummary[] = [
		{
			id: 1,
			title: '静态优先与实时注水：构建现代化博客的架构思考',
			shortUrl: 'welcome',
			summary:
				'探讨如何兼顾静态分发的极致首屏速度与 Web 实时交互体验。本文详细拆解了自研 ISR 与渐进式注水（Rehydration）的技术落地。',
			createdAt: '2026-08-02T12:00:00Z',
			updatedAt: '2026-08-02T12:00:00Z',
			contentUpdatedAt: '2026-08-02T12:00:00Z',
			categoryName: '架构设计',
			categoryShortUrl: 'architecture',
			tags: ['Go', 'SvelteKit', 'ISR'],
			views: 1280,
			likes: 96,
			comments: 12,
			isTop: true,
			isHot: true,
			isOriginal: true
		},
		{
			id: 2,
			title: 'AI 驱动与智能体协同：探索下一代 Web 交互范式',
			shortUrl: 'agentic-web-era',
			summary:
				'从简单的对话交互到复杂多 Agent 自主协作，Web 界面正在经历全新的美学与能力重构。本文分享在 Agentic Coding 中的工程实践。',
			createdAt: '2026-08-01T16:30:00Z',
			updatedAt: '2026-08-01T16:30:00Z',
			contentUpdatedAt: '2026-08-01T16:30:00Z',
			categoryName: '前沿探索',
			categoryShortUrl: 'ai',
			tags: ['AI Agent', '前端美学'],
			views: 860,
			likes: 72,
			comments: 8,
			isTop: false,
			isHot: false,
			isOriginal: true
		}
	];

	return (
		result ?? {
			items: mockArticles,
			total: mockArticles.length,
			page,
			size: pageSize
		}
	);
};

export const getPostDetail = async (
	fetcher: typeof fetch | undefined,
	shortUrl: string
): Promise<PostDetail | null> => {
	const api = getApi(fetcher);
	const res = await fetchOrNull(() => api<PostDetail>(`/articles/short/${shortUrl}`));
	if (res) return res;

	if (shortUrl === 'welcome' || shortUrl === '1') {
		return {
			id: 1,
			title: '静态优先与实时注水：构建现代化博客的架构思考',
			shortUrl: 'welcome',
			summary:
				'探讨如何兼顾静态分发的极致首屏速度与 Web 实时交互体验。本文详细拆解了自研 ISR 与渐进式注水（Rehydration）的技术落地。',
			content: `> **写在前面**：在个人网站演进的漫长岁月里，创作者始终在“追求极致首屏加载”与“丰富动态交互”之间做权衡。本博客系统通过静态先行（Static-First）、自研增量再生（ISR）与 WebSocket 动态注水，打通了这一屏障。

---

## 1. 为什么选择“静态先行”？

对于个人博客而言，**速度即体验**。在网络条件受限或移动端访问时，轻量的 HTML 能够实现小于 0.5 秒的秒开效果：

1. **0 CPU 实时开销**：绝大多数读请求直接命中 Nginx 静态文件分发层，对服务端计算资源零消耗；
2. **容灾降级机制**：即便 Go 后端应用短暂停机维护，静态网页网关依旧能够顺畅提供只读服务。

---

## 2. 核心架构三元素

为了让静态站点不再是僵硬的数据死水，我们设计了三平面解耦模型：

| 平面 | 组件 | 关键职责 |
| :--- | :--- | :--- |
| **控制平面** | Go (Fiber) | 业务 API、ISR 调度计算、WebSocket Hub、联合社交协议 |
| **渲染平面** | SvelteKit | 无头 SSR 渲染工厂，高效输出语义化 HTML |
| **数据平面** | Nginx Gateway | 静态文件极速托管，反向代理与优雅降级 |

### 2.1 自研增量再生 (ISR) 引擎代码示例

当我们在管理后台发布或编辑一篇文章时，Go 服务会自动推算受影响的路由并触发异步刷新：

\`\`\`go
// Calculate & Enqueue Dirty Routes
func (s *ISRService) OnArticleUpdated(ctx context.Context, articleID uint) error {
    paths := []string{
        fmt.Sprintf("/posts/%d", articleID),
        "/posts",
        "/",
        "/feed.xml",
    }
    return s.Queue.Enqueue(ctx, paths)
}
\`\`\`

---

## 3. 实时注水 (Realtime Rehydration) 体验

当在线读者静置浏览页面时，如果创作者发布了修正补丁或新动态，前端组件会自动建立 WebSocket 通道：

\`\`\`typescript
// Client-side Rehydration Store
export function subscribePostEvents(articleId: number) {
    const ws = new WebSocket(\`wss://\${location.host}/api/v2/ws/articles/\${articleId}\`);
    ws.onmessage = (event) => {
        const payload = JSON.parse(event.data);
        if (payload.type === 'CONTENT_UPDATE') {
            updateArticleDOM(payload.data);
        }
    };
}
\`\`\`

> 💡 **总结**：静态保障了基础设施的强壮与高速，注水让数据生命力在客户端绵延不绝。

---

		感谢阅读，欢迎在下方发表评论或与 Yu 互动！`,
			contentHash: 'mock-welcome-v1',
			authorId: 0,
			categoryName: '架构设计',
			categoryShortUrl: 'architecture',
			tags: [
				{ id: 1, name: 'Go' },
				{ id: 2, name: 'SvelteKit' },
				{ id: 3, name: 'ISR' }
			],
			metrics: { views: 1280, likes: 96, comments: 12 },
			isPublished: true,
			isTop: true,
			isHot: true,
			isOriginal: true,
			contentUpdatedAt: '2026-08-02T12:00:00Z',
			createdAt: '2026-08-02T12:00:00Z',
			updatedAt: '2026-08-02T12:00:00Z'
		};
	}

	if (shortUrl === 'agentic-web-era' || shortUrl === '2') {
		return {
			id: 2,
			title: 'AI 驱动与智能体协同：探索下一代 Web 交互范式',
			shortUrl: 'agentic-web-era',
			summary:
				'从简单的对话交互到复杂多 Agent 自主协作，Web 界面正在经历全新的美学与能力重构。本文分享在 Agentic Coding 中的工程实践。',
			content: `> **引言**：代码不仅是指令的集合，更是人机意图共鸣的艺术。随着大模型从“单次问答”走向“自主任务完成”，Web 交互正在步入全新的 Agent 协同时代。

---

## 1. 人机对弈到结伴双飞

传统软件开发依赖高度手动编码与硬编码逻辑，而现代 **Agentic AI Assistant** 则具备了感知、规划与执行的全栈能力。

### 关键转变维度：
- **从被动响应到主动推进**：Agent 不仅回答问题，更能自动诊断环境、定位 Log Traceback 并提交修复。
- **从单体上下文到上下文上下文管理**：通过 Agent 子进程（Subagents）解耦复杂检索与代码重构。

---

## 2. 界面设计美学的重定义

美观且直观的界面能够极大消除人机协同中的认知疲劳：

\`\`\`css
/* Modern Cyberpunk Glassmorphic Card */
.glass-panel {
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
}
\`\`\`

---

## 3. 展望未来的博客与数字花园

未来的个人数字空间不仅仅是静态记录本，它更是：
1. **思考的沙盒**：随时与 AI 助手结对打磨创意；
2. **知识的连接网**：通过去中心化协议与全局节点自动联通。

*感谢您的阅读！*`,
			contentHash: 'mock-agentic-web-era-v1',
			authorId: 0,
			categoryName: '前沿探索',
			categoryShortUrl: 'ai',
			tags: [
				{ id: 4, name: 'AI Agent' },
				{ id: 5, name: '前端美学' }
			],
			metrics: { views: 860, likes: 72, comments: 8 },
			isPublished: true,
			isTop: false,
			isHot: false,
			isOriginal: true,
			contentUpdatedAt: '2026-08-01T16:30:00Z',
			createdAt: '2026-08-01T16:30:00Z',
			updatedAt: '2026-08-01T16:30:00Z'
		};
	}

	return null;
};

export const checkPostLatest = async (
	fetcher: typeof fetch | undefined,
	id: number,
	hash: string
): Promise<PostLatestCheckResponse | null> => {
	const api = getApi(fetcher);
	const result = await api<PostLatestCheckResponse>(`/articles/${id}/latest`, {
		method: 'POST',
		body: { hash }
	}).catch(() => null);
	return result ?? null;
};

export const getRecentPosts = async (fetcher?: typeof fetch): Promise<PostListResponse> => {
	const api = getApi(fetcher);
	const result = await api<PostListResponse>('/public/articles/recent').catch(() => null);
	const mockArticles: PostSummary[] = [
		{
			id: 1,
			title: '静态优先与实时注水：构建现代化博客的架构思考',
			shortUrl: 'welcome',
			summary:
				'探讨如何兼顾静态分发的极致首屏速度与 Web 实时交互体验。本文详细拆解了自研 ISR 与渐进式注水（Rehydration）的技术落地。',
			createdAt: '2026-08-02T12:00:00Z',
			updatedAt: '2026-08-02T12:00:00Z',
			contentUpdatedAt: '2026-08-02T12:00:00Z',
			categoryName: '架构设计',
			categoryShortUrl: 'architecture',
			tags: ['Go', 'SvelteKit', 'ISR'],
			views: 1280,
			likes: 96,
			comments: 12,
			isTop: true,
			isHot: true,
			isOriginal: true
		},
		{
			id: 2,
			title: 'AI 驱动与智能体协同：探索下一代 Web 交互范式',
			shortUrl: 'agentic-web-era',
			summary:
				'从简单的对话交互到复杂多 Agent 自主协作，Web 界面正在经历全新的美学与能力重构。本文分享在 Agentic Coding 中的工程实践。',
			createdAt: '2026-08-01T16:30:00Z',
			updatedAt: '2026-08-01T16:30:00Z',
			contentUpdatedAt: '2026-08-01T16:30:00Z',
			categoryName: '前沿探索',
			categoryShortUrl: 'ai',
			tags: ['AI Agent', '前端美学'],
			views: 860,
			likes: 72,
			comments: 8,
			isTop: false,
			isHot: false,
			isOriginal: true
		}
	];
	return (
		result ?? {
			items: mockArticles,
			total: mockArticles.length,
			page: 1,
			size: 5
		}
	);
};

export const getPostListByCategory = async (
	fetcher?: typeof fetch,
	categorySlug: string = '',
	{ page = 1, pageSize = 10 }: PostListOptions = {}
): Promise<PostListResponse> => {
	const api = getApi(fetcher);
	const query = new URLSearchParams({
		page: String(page),
		pageSize: String(pageSize)
	});
	const result = await api<PostListResponse>(
		`/categories/short/${encodeURIComponent(categorySlug)}/articles?${query.toString()}`
	).catch(() => null);
	return result ?? { items: [], total: 0, page, size: pageSize };
};

type PostRelatedMomentsResponse = {
	items: PostRelatedMoment[];
};

export const getPostRelatedMoments = async (
	fetcher: typeof fetch | undefined,
	id: number
): Promise<PostRelatedMoment[]> => {
	const api = getApi(fetcher);
	const result = await api<PostRelatedMomentsResponse>(`/articles/${id}/same-period-moments`).catch(
		() => null
	);
	return result?.items ?? [];
};
