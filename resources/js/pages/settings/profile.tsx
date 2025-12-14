import { useMemo, useState, useRef } from 'react';

import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { send } from '@/routes/verification';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage, router } from '@inertiajs/react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import { AlertTriangle, Camera, Trash2 } from 'lucide-react';
import { ImageCropper } from '@/components/image-cropper';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

type AcademicOptions = {
    universities: Array<{
        id: number;
        nama: string;
        slug: string;
        singkatan?: string | null;
    }>;
    programStudies: Array<{
        id: number;
        university_id: number;
        nama: string;
        slug: string;
        jenjang?: string | null;
    }>;
};

export default function Profile({
    mustVerifyEmail,
    status,
    academicOptions,
}: {
    mustVerifyEmail: boolean;
    status?: string;
    academicOptions: AcademicOptions;
}) {
    const { auth, integrations } = usePage<SharedData>().props;
    const [selectedProgramStudyId, setSelectedProgramStudyId] = useState<string>(
        auth.user.program_study_id ? String(auth.user.program_study_id) : ''
    );
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [showCropper, setShowCropper] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedImage(reader.result as string);
            setShowCropper(true);
        };
        reader.readAsDataURL(file);

        e.target.value = '';
    };

    const handleCropComplete = (croppedBlob: Blob) => {
        const previewUrl = URL.createObjectURL(croppedBlob);
        setAvatarPreview(previewUrl);

        setIsUploadingAvatar(true);
        const formData = new FormData();
        formData.append('avatar', croppedBlob, 'avatar.jpg');

        router.post('/settings/profile/avatar', formData, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => {
                setIsUploadingAvatar(false);
                setAvatarPreview(null);
                setSelectedImage(null);
            },
        });
    };

    const handleDeleteAvatar = () => {
        router.delete('/settings/profile/avatar', {
            preserveScroll: true,
        });
    };



    const universitiesById = useMemo(() => {
        return new Map(
            academicOptions.universities.map((university) => [
                university.id,
                university,
            ])
        );
    }, [academicOptions.universities]);

    const isUnesaUniversity = (universityId?: number | null) => {
        if (!universityId) return false;

        const university = universitiesById.get(universityId);

        if (!university) return false;

        const normalizedName = university.nama.toLowerCase();

        return (
            normalizedName === 'universitas negeri surabaya' ||
            university.slug === 'universitas-negeri-surabaya' ||
            university.singkatan?.toLowerCase() === 'unesa'
        );
    };

    const groupedPrograms = useMemo(() => {
        const groups = new Map<number, { universityId: number; programs: AcademicOptions['programStudies'] }>();

        academicOptions.universities.forEach((university) => {
            groups.set(university.id, {
                universityId: university.id,
                programs: [],
            });
        });

        academicOptions.programStudies.forEach((program) => {
            const group = groups.get(program.university_id);

            if (group) {
                group.programs = [...group.programs, program];
            }
        });

        return Array.from(groups.values()).filter(
            (group) => group.programs.length > 0
        );
    }, [academicOptions.programStudies, academicOptions.universities]);

    const selectedProgram = useMemo(() => {
        return academicOptions.programStudies.find(
            (program) => String(program.id) === selectedProgramStudyId
        );
    }, [academicOptions.programStudies, selectedProgramStudyId]);

    const inferredUniversity =
        selectedProgram?.university_id ?? auth.user.university_id ?? null;
    const inferredUniversityName = inferredUniversity
        ? universitiesById.get(inferredUniversity)?.nama
        : null;
    const isUnesaContext = isUnesaUniversity(inferredUniversity);
    const unesaPrograms = useMemo(() => {
        if (!isUnesaContext || !inferredUniversity) {
            return [];
        }

        return academicOptions.programStudies.filter(
            (program) => program.university_id === inferredUniversity
        );
    }, [academicOptions.programStudies, inferredUniversity, isUnesaContext]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    {!auth.user.profile_completed && (
                        <Alert className="border-amber-200 bg-amber-50 text-amber-900">
                            <AlertTriangle className="text-amber-500" />
                            <AlertTitle>Lengkapi profil akademik</AlertTitle>
                            <AlertDescription>
                                Isi data program studi dan informasi akademik
                                untuk membuka seluruh fitur, termasuk dashboard
                                dan upload catatan.
                            </AlertDescription>
                        </Alert>
                    )}

                    <HeadingSmall
                        title="Informasi profil"
                        description="Perbarui nama, email kampus, dan detail akademik Anda."
                    />

                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="h-24 w-24 overflow-hidden rounded-full bg-muted">
                                {avatarPreview || auth.user.avatar_url ? (
                                    <img
                                        src={avatarPreview || auth.user.avatar_url || ''}
                                        alt="Avatar"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-primary/10 text-2xl font-semibold text-primary">
                                        {auth.user.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            {isUploadingAvatar && (
                                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploadingAvatar}
                            >
                                <Camera className="mr-2 h-4 w-4" />
                                {auth.user.avatar_url ? 'Ganti foto' : 'Upload foto'}
                            </Button>
                            {auth.user.avatar_url && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleDeleteAvatar}
                                    className="text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Hapus foto
                                </Button>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Foto JPG atau PNG
                            </p>
                        </div>
                    </div>

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nama</Label>

                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.name}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder="Full name"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Alamat email</Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.email}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder="Email address"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.email}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label>
                                        Program studi
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>

                                    <input
                                        type="hidden"
                                        name="program_study_id"
                                        value={selectedProgramStudyId}
                                    />

                                    <Select
                                        value={
                                            selectedProgramStudyId || undefined
                                        }
                                        onValueChange={
                                            setSelectedProgramStudyId
                                        }
                                    >
                                        <SelectTrigger
                                            aria-invalid={
                                                Boolean(
                                                    errors.program_study_id
                                                ) || undefined
                                            }
                                        >
                                            <SelectValue
                                                placeholder="Pilih program studi"
                                                aria-label="Program studi yang dipilih"
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {isUnesaContext
                                                ? unesaPrograms.map(
                                                    (program) => (
                                                        <SelectItem
                                                            key={program.id}
                                                            value={String(
                                                                program.id
                                                            )}
                                                        >
                                                            {
                                                                program.nama
                                                            }
                                                        </SelectItem>
                                                    )
                                                )
                                                : groupedPrograms.map(
                                                    (group) => {
                                                        const university =
                                                            universitiesById.get(
                                                                group.universityId
                                                            );

                                                        if (!university) {
                                                            return null;
                                                        }

                                                        return (
                                                            <SelectGroup
                                                                key={
                                                                    university.id
                                                                }
                                                            >
                                                                <SelectLabel>
                                                                    {
                                                                        university.nama
                                                                    }
                                                                </SelectLabel>

                                                                {group.programs.map(
                                                                    (
                                                                        program
                                                                    ) => (
                                                                        <SelectItem
                                                                            key={
                                                                                program.id
                                                                            }
                                                                            value={String(
                                                                                program.id
                                                                            )}
                                                                        >
                                                                            <span className="flex flex-col text-start">
                                                                                {
                                                                                    program.nama
                                                                                }
                                                                                {program.jenjang && (
                                                                                    <small className="text-xs text-muted-foreground">
                                                                                        {
                                                                                            program.jenjang
                                                                                        }
                                                                                    </small>
                                                                                )}
                                                                            </span>
                                                                        </SelectItem>
                                                                    )
                                                                )}
                                                            </SelectGroup>
                                                        );
                                                    }
                                                )}
                                        </SelectContent>
                                    </Select>

                                    <InputError
                                        className="mt-2"
                                        message={errors.program_study_id}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="cohort_year">
                                        Tahun angkatan
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>

                                    <Input
                                        id="cohort_year"
                                        name="cohort_year"
                                        type="text"
                                        inputMode="numeric"
                                        pattern="\d{4}"
                                        placeholder="contoh: 2022"
                                        defaultValue={auth.user.cohort_year ?? ''}
                                        aria-invalid={
                                            Boolean(errors.cohort_year) ||
                                            undefined
                                        }
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.cohort_year}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="student_number">
                                        NIM / Student ID
                                    </Label>

                                    <Input
                                        id="student_number"
                                        name="student_number"
                                        type="text"
                                        placeholder="Masukkan Nomor Induk Mahasiswa (opsional)"
                                        defaultValue={
                                            auth.user.student_number ?? ''
                                        }
                                        aria-invalid={
                                            Boolean(errors.student_number) ||
                                            undefined
                                        }
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.student_number}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label>Universitas terdeteksi</Label>
                                    <Input
                                        value={
                                            inferredUniversityName ??
                                            'Belum terdeteksi (pilih program studi)'
                                        }
                                        disabled
                                    />
                                </div>

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <div>
                                            <p className="-mt-4 text-sm text-muted-foreground">
                                                Your email address is
                                                unverified.{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                >
                                                    Click here to resend the
                                                    verification email.
                                                </Link>
                                            </p>

                                            {status ===
                                                'verification-link-sent' && (
                                                    <div className="mt-2 text-sm font-medium text-green-600">
                                                        A new verification link has
                                                        been sent to your email
                                                        address.
                                                    </div>
                                                )}
                                        </div>
                                    )}

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                    >
                                        Simpan
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">
                                            Tersimpan
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>



                <DeleteUser />
            </SettingsLayout>
            
            {selectedImage && (
                <ImageCropper
                    imageSrc={selectedImage}
                    open={showCropper}
                    onClose={() => {
                        setShowCropper(false);
                        setSelectedImage(null);
                    }}
                    onCropComplete={handleCropComplete}
                />
            )}
        </AppLayout>
    );
}
