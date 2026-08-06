import type { WebsiteInfoMap } from '$lib/features/website-info/types';
import type { FooterThemeConfig, FooterThemeLink, FooterThemeSection } from './types';

const defaultFooterConfig: FooterThemeConfig = {
	sections: [
		{
			title: '这个空间',
			links: [
				{ name: '归档', href: '/posts' },
				{ name: 'RSS', href: '/feed' },
				{ name: '时间线', href: '/timeline' }
			]
		},
		{
			title: '联系',
			links: [{ name: '写留言', href: '/message' }]
		}
	],
	brandName: 'Yu的博客空间',
	brandTagline: '记录工作、生活和一路上的新发现',
	copyrightStartYear: 2022,
	copyrightOwner: 'Yu',
	beianText: '',
	beianUrl: 'https://beian.miit.gov.cn/',
	beianGongAnText: '',
	designedWithText: '由 Yu 维护',
	presenceConnectedText: '正在有 {count} 位小伙伴看着我的网站呐',
	presenceLoadingText: '正在同步在线状态...',
	siteStartTime: '2022-01-01T00:00:00+08:00',
	uptimeTextTemplate: '已运行 {days} 天 {hours} 小时 {minutes} 分 {seconds} 秒'
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null;

const toStringValue = (value: unknown): string | undefined => {
	if (typeof value !== 'string') {
		return undefined;
	}
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
};

const toPositiveInt = (value: unknown): number | undefined => {
	if (typeof value !== 'number' || !Number.isFinite(value)) {
		return undefined;
	}
	const parsed = Math.floor(value);
	return parsed > 0 ? parsed : undefined;
};

const parseLinks = (value: unknown): FooterThemeLink[] | undefined => {
	if (!Array.isArray(value)) {
		return undefined;
	}

	const links: FooterThemeLink[] = [];
	for (const item of value) {
		if (!isRecord(item)) {
			continue;
		}
		const name = toStringValue(item.name);
		const href = toStringValue(item.href);
		if (!name || !href) {
			continue;
		}
		links.push({ name, href });
	}

	return links.length > 0 ? links : undefined;
};

const parseSections = (value: unknown): FooterThemeSection[] | undefined => {
	if (!Array.isArray(value)) {
		return undefined;
	}

	const sections: FooterThemeSection[] = [];
	for (const item of value) {
		if (!isRecord(item)) {
			continue;
		}
		const title = toStringValue(item.title);
		const links = parseLinks(item.links);
		if (!title || !links) {
			continue;
		}
		sections.push({ title, links });
	}

	return sections.length > 0 ? sections : undefined;
};

export const resolveFooterThemeConfig = (
	websiteInfo: WebsiteInfoMap | null | undefined
): FooterThemeConfig => {
	const themeRaw = websiteInfo?.theme_extend_info;
	if (!isRecord(themeRaw)) {
		return defaultFooterConfig;
	}

	const footerRaw = isRecord(themeRaw.footer) ? themeRaw.footer : themeRaw;
	const brandRaw = isRecord(footerRaw.brand) ? footerRaw.brand : {};
	const copyrightRaw = isRecord(footerRaw.copyright) ? footerRaw.copyright : {};
	const presenceRaw = isRecord(footerRaw.presence) ? footerRaw.presence : {};
	const runtimeRaw = isRecord(footerRaw.runtime) ? footerRaw.runtime : {};

	return {
		sections: parseSections(footerRaw.sections) ?? defaultFooterConfig.sections,
		brandName:
			toStringValue(brandRaw.name) ??
			toStringValue(footerRaw.brandName) ??
			defaultFooterConfig.brandName,
		brandTagline:
			toStringValue(brandRaw.tagline) ??
			toStringValue(footerRaw.brandTagline) ??
			defaultFooterConfig.brandTagline,
		copyrightStartYear:
			toPositiveInt(copyrightRaw.startYear) ??
			toPositiveInt(footerRaw.copyrightStartYear) ??
			defaultFooterConfig.copyrightStartYear,
		copyrightOwner:
			toStringValue(copyrightRaw.owner) ??
			toStringValue(footerRaw.copyrightOwner) ??
			defaultFooterConfig.copyrightOwner,
		beianText:
			toStringValue(copyrightRaw.beianText) ??
			toStringValue(footerRaw.beianText) ??
			defaultFooterConfig.beianText,
		beianUrl:
			toStringValue(copyrightRaw.beianUrl) ??
			toStringValue(footerRaw.beianUrl) ??
			defaultFooterConfig.beianUrl,
		beianGongAnText:
			toStringValue(copyrightRaw.beianGongAnText) ??
			toStringValue(footerRaw.beianGongAnText) ??
			defaultFooterConfig.beianGongAnText,
		designedWithText:
			toStringValue(copyrightRaw.designedWithText) ??
			toStringValue(footerRaw.designedWithText) ??
			defaultFooterConfig.designedWithText,
		presenceConnectedText:
			toStringValue(presenceRaw.connectedText) ??
			toStringValue(footerRaw.presenceConnectedText) ??
			defaultFooterConfig.presenceConnectedText,
		presenceLoadingText:
			toStringValue(presenceRaw.loadingText) ??
			toStringValue(footerRaw.presenceLoadingText) ??
			defaultFooterConfig.presenceLoadingText,
		siteStartTime:
			toStringValue(runtimeRaw.siteStartTime) ??
			toStringValue(footerRaw.siteStartTime) ??
			defaultFooterConfig.siteStartTime,
		uptimeTextTemplate:
			toStringValue(runtimeRaw.uptimeTextTemplate) ??
			toStringValue(footerRaw.uptimeTextTemplate) ??
			defaultFooterConfig.uptimeTextTemplate
	};
};
