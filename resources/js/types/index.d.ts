import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    flash?: {
        banner?: string;
        bannerStyle?: 'success' | 'warning' | 'danger' | 'info';
        [key: string]: unknown;
    };

    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    avatar_url?: string | null;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    profile_completed?: boolean;
    profile_completed_at?: string | null;
    university_id?: number | null;
    program_study_id?: number | null;
    cohort_year?: string | null;
    student_number?: string | null;
    profile_meta?: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}


export interface NoteTag {
    id: number;
    name: string;
    slug: string;
    color?: string | null;
}

export interface NoteAttachment {
    id: number;
    file_name: string;
    file_type: string;
    url: string;
    mime_type: string;
    size: number;
}

export interface NoteResource {
    id: number;
    slug: string;
    title: string;
    excerpt?: string | null;
    content_html?: string | null;
    content_text?: string | null;
    status: string;
    visibility: string;
    tags: NoteTag[];
    file_original_name?: string | null;
    file_url?: string | null;
    source_type: string;

    sync_status?: string | null;
    ai_summary?: string | null;
    ai_status?: string | null;
    attachments?: NoteAttachment[];
    ai_completed_at?: string | null;
}

export interface LeaderboardProgramStudy {
    id: number;
    nama: string;
    university: { id: number; nama: string } | null;
}

export interface StatsPayload {
    streak: number;
    notes_this_week: number;
    leaderboard: {
        program_study: LeaderboardProgramStudy | null;
        top_users: Array<{
            id: number;
            name: string;
            avatar_url?: string | null;
            rank: number;
            total_points: number;
        }>;
    };
}

export interface FeedNote {
    id: number;
    slug: string;
    title: string;
    excerpt?: string | null;
    ai_summary?: string | null;
    ai_flashcards_count?: number;
    user: {
        id: number;
        name: string;
        program_study?: string | null;
        university?: string | null;
        university_short?: string | null;
    };
    tags: Array<{ id: number; name: string; slug: string }>;
    liked: boolean;
    likes_count: number;
    comments_count: number;
    bookmarked: boolean;
    bookmarks_count: number;
    published_at?: string | null;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface FeedPagination {
    data: FeedNote[];
    links: PaginationLink[];
}

export interface DashboardProps {
    stats: StatsPayload;
    feed: FeedPagination;
    filters: { search?: string };
}

export interface CommentPayload {
    id: number;
    body: string;
    user: { id: number; name: string };
    created_at: string;
}

export interface Badge {
    id: number;
    slug: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    tier: 1 | 2 | 3 | 4 | 5;
    requirement_type: string;
    requirement_value: number;
    earned?: boolean;
    awarded_at?: string;
}

export interface BadgeStats {
    earned: number;
    total: number;
}

