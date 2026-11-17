export type ActivityLink = {
  patternId: number | null;
  patternName: string | null;
  projectId: number | null;
  projectUsername: string | null;
  projectName: string | null;
};

export type PatternTitleCandidate = {
  id: number;
  name: string;
  designerName?: string | null;
};

const EMPTY_LINK: ActivityLink = {
  patternId: null,
  patternName: null,
  projectId: null,
  projectUsername: null,
  projectName: null,
};

function positiveId(value: unknown): number | null {
  const id = Number(value);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function text(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function record(value: unknown): Record<string, any> | null {
  return value != null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, any>
    : null;
}

function sameText(left: string, right: string): boolean {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

/** API path for `target_uri`, or null when it isn't a Ravelry path. */
export function activityTargetPath(uri: string | null | undefined): string | null {
  const trimmed = uri?.trim();
  if (!trimmed)
    return null;

  let path = trimmed;
  if (/^https?:\/\//i.test(path)) {
    try {
      const url = new URL(path);
      if (!url.hostname.endsWith('ravelry.com'))
        return null;
      path = url.pathname;
    }
    catch {
      return null;
    }
  }

  path = path.split('?')[0]?.split('#')[0]?.replace(/^\//, '') ?? '';
  if (!path || path.includes('..'))
    return null;
  return path.endsWith('.json') ? path : `${path}.json`;
}

/**
 * Ids encoded in an activity `target_uri`.
 * `/patterns/123.json` and `/projects/{username}/{id}.json` are the documented shapes.
 */
export function parseActivityTargetUri(uri: string | null | undefined): ActivityLink {
  const path = activityTargetPath(uri)?.replace(/\.json$/, '') ?? '';
  const pattern = path.match(/(?:^|\/)patterns\/(\d+)$/i);
  if (pattern) {
    return { ...EMPTY_LINK, patternId: positiveId(pattern[1]) };
  }
  const project = path.match(/(?:^|\/)projects\/([^/]+)\/(\d+)$/i);
  if (project) {
    return {
      ...EMPTY_LINK,
      projectId: positiveId(project[2]),
      projectUsername: decodeURIComponent(project[1] ?? '') || null,
    };
  }
  return { ...EMPTY_LINK };
}

function patternFrom(value: unknown): { id: number | null; name: string | null } {
  const pattern = record(value);
  return {
    id: positiveId(pattern?.id),
    name: text(pattern?.name),
  };
}

/** Pattern / project ids from a target show payload (pattern, project, or favorite). */
export function activityLinkFromPayload(data: unknown): ActivityLink {
  const root = record(data) ?? {};
  const bookmark = record(root.bookmark) ?? record(root.favorite);
  const favorited = record(bookmark?.favorited);
  const bookmarkType = text(bookmark?.type)?.toLowerCase() ?? '';
  const project = record(root.project)
    ?? (bookmarkType === 'project' ? favorited : null);
  const queued = record(root.queued_project);
  const directPattern = patternFrom(root.pattern);
  const nestedPattern = patternFrom(project?.pattern ?? queued?.pattern);
  const favoritedPattern = bookmarkType === 'pattern'
    ? patternFrom(favorited)
    : { id: null, name: null };
  const patternId = directPattern.id
    ?? favoritedPattern.id
    ?? (bookmarkType === 'pattern' ? positiveId(bookmark?.favorited_id) : null)
    ?? positiveId(project?.pattern_id)
    ?? nestedPattern.id
    ?? positiveId(queued?.pattern_id);
  const patternName = directPattern.name
    ?? favoritedPattern.name
    ?? nestedPattern.name
    ?? text(project?.pattern_name)
    ?? text(queued?.pattern_name);
  const user = record(project?.user) ?? record(project?.person);

  return {
    patternId,
    patternName,
    projectId: positiveId(project?.id),
    projectUsername: text(user?.username),
    projectName: text(project?.name),
  };
}

/** "Dreaming of Spring Shawl by Leela Frankcombe" → name + designer. */
export function patternHintFromTitle(title: string | null | undefined): {
  name: string;
  designer: string | null;
} | null {
  const trimmed = title?.trim();
  if (!trimmed)
    return null;
  const split = trimmed.match(/^(.*?)\s+by\s+(.+)$/i);
  const name = split?.[1]?.trim() || trimmed;
  const designer = split?.[2]?.trim() || null;
  if (!name)
    return null;
  return { name, designer };
}

/** Exact pattern-name match. With a designer in the title, require that too when known. */
export function matchPatternFromTitle(
  patterns: PatternTitleCandidate[],
  title: string,
): { id: number; name: string } | null {
  const hint = patternHintFromTitle(title);
  if (!hint)
    return null;
  const named = patterns.filter(
    pattern => pattern.id > 0 && sameText(pattern.name, hint.name),
  );
  if (hint.designer) {
    const designed = named.filter(pattern =>
      pattern.designerName != null && sameText(pattern.designerName, hint.designer ?? ''),
    );
    const pick = designed[0] ?? (named.length === 1 ? named[0] : null);
    return pick ? { id: pick.id, name: pick.name } : null;
  }
  if (named.length !== 1)
    return null;
  return { id: named[0].id, name: named[0].name };
}
