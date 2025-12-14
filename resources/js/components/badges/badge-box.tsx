import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { BadgeModal } from '@/components/badges/badge-modal';
import type { Badge } from '@/types';

interface BadgeCelebrationContextType {
    celebrateBadge: (badge: Badge) => void;
}

const BadgeCelebrationContext = createContext<BadgeCelebrationContextType | null>(null);

export function useBadgeCelebration() {
    const context = useContext(BadgeCelebrationContext);
    if (!context) {
        throw new Error('useBadgeCelebration must be used within BadgeCelebrationProvider');
    }
    return context;
}

interface BadgeCelebrationProviderProps {
    children: ReactNode;
}

const getCsrfToken = () => {
    const metaToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
    if (metaToken) return metaToken;

    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'XSRF-TOKEN') {
            return decodeURIComponent(value);
        }
    }
    return '';
};

export function BadgeCelebrationProvider({ children }: BadgeCelebrationProviderProps) {
    const [currentBadge, setCurrentBadge] = useState<Badge | null>(null);
    const [currentNotificationId, setCurrentNotificationId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [celebratedIds, setCelebratedIds] = useState<Set<number>>(() => {
        try {
            const stored = sessionStorage.getItem('celebratedBadgeIds');
            return stored ? new Set(JSON.parse(stored)) : new Set();
        } catch {
            return new Set();
        }
    });

    useEffect(() => {
        const checkForNewBadges = async () => {
            try {
                const response = await fetch('/api/notifications?limit=5', {
                    headers: { 'Accept': 'application/json' },
                });
                const data = await response.json();

                const unreadBadges = data.notifications?.filter(
                    (n: any) => n.type === 'badge' && !n.read_at && n.badge && !celebratedIds.has(n.id)
                );

                if (unreadBadges && unreadBadges.length > 0) {
                    const notification = unreadBadges[0];
                    const badge: Badge = {
                        id: notification.badge.id,
                        slug: notification.badge.slug,
                        name: notification.badge.name,
                        description: notification.badge.description,
                        icon: notification.badge.icon,
                        tier: notification.badge.tier as 1 | 2 | 3 | 4 | 5,
                        category: 'content_creator',
                        requirement_type: '',
                        requirement_value: 0,
                        earned: true,
                    };

                    setCurrentBadge(badge);
                    setCurrentNotificationId(notification.id);
                    setShowModal(true);

                    const newSet = new Set([...celebratedIds, notification.id]);
                    setCelebratedIds(newSet);
                    try {
                        sessionStorage.setItem('celebratedBadgeIds', JSON.stringify([...newSet]));
                    } catch { }
                }
            } catch (error) {
                console.error('Error checking for badge notifications:', error);
            }
        };

        checkForNewBadges();

        const handleNavigate = () => {
            setTimeout(checkForNewBadges, 1000);
        };

        document.addEventListener('inertia:finish', handleNavigate);

        return () => {
            document.removeEventListener('inertia:finish', handleNavigate);
        };
    }, [celebratedIds]);

    const celebrateBadge = (badge: Badge) => {
        setCurrentBadge(badge);
        setShowModal(true);
    };

    const handleCloseModal = async () => {
        if (currentNotificationId) {
            try {
                await fetch(`/notifications/${currentNotificationId}/read`, {
                    method: 'POST',
                    headers: {
                        'X-XSRF-TOKEN': getCsrfToken(),
                        'Accept': 'application/json',
                    },
                });
            } catch (error) {
                console.error('Failed to mark notification as read:', error);
            }
        }

        setShowModal(false);
        setCurrentBadge(null);
        setCurrentNotificationId(null);
    };

    return (
        <BadgeCelebrationContext.Provider value={{ celebrateBadge }}>
            {children}
            <BadgeModal
                badge={currentBadge}
                open={showModal}
                onClose={handleCloseModal}
            />
        </BadgeCelebrationContext.Provider>
    );
}
