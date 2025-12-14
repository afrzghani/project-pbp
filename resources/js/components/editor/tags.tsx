import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Tag as TagIcon, X } from 'lucide-react';
import { type NoteTag } from '@/types';

export default function TagsPanel({
    selectedTags,
    toggleTag,
    newTag,
    setNewTag,
    handleAddCustomTag,
    availableTags,
}: {
    selectedTags: string[];
    toggleTag: (tagName: string) => void;
    newTag: string;
    setNewTag: (v: string) => void;
    handleAddCustomTag: () => void;
    availableTags: NoteTag[];
}) {
    return (
        <div className="space-y-4">
            {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                        <Badge
                            key={tag}
                            variant="secondary"
                            className="cursor-pointer gap-1 pr-1"
                            onClick={() => toggleTag(tag)}
                        >
                            {tag}
                            <X className="h-3 w-3" />
                        </Badge>
                    ))}
                </div>
            )}

            <div className="space-y-2">
                <Label>Tambah Tag Baru</Label>
                <div className="flex gap-2">
                    <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Contoh: AI"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddCustomTag();
                            }
                        }}
                    />
                    <Button type="button" variant="outline" size="icon" onClick={handleAddCustomTag}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {availableTags.length > 0 && (
                <div className="space-y-2">
                    <Label>Pilih dari Daftar</Label>
                    <div className="flex flex-wrap gap-2">
                        {availableTags.map((tag) => (
                            <Button
                                key={tag.id}
                                type="button"
                                variant={selectedTags.includes(tag.name) ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => toggleTag(tag.name)}
                            >
                                {tag.name}
                            </Button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
