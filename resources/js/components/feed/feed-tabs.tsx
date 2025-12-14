import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FeedTabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
    const tabs = [
        { id: 'for-you', label: 'Untuk Anda' },
        { id: 'trending', label: 'Trending' },
        { id: 'latest', label: 'Terbaru' },
    ];

    return (
        <div className="flex items-center justify-center gap-1 border-b border-border/50 pb-2">
            {tabs.map((tab) => (
                <Button
                    key={tab.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                        'relative h-9 rounded-full px-4 font-medium transition-all hover:bg-muted',
                        activeTab === tab.id
                            ? 'bg-muted text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                    )}
                >
                    {tab.label}
                    {activeTab === tab.id && (
                        <span className="absolute inset-x-0 -bottom-[9px] mx-auto h-[2px] w-[20px] rounded-full bg-primary" />
                    )}
                </Button>
            ))}
        </div>
    );
}