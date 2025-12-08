import { useMemo, useState } from 'react';

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
import { AlertTriangle } from 'lucide-react';

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
                        title="Profile information"
                        description="Update nama, email kampus, dan detail akademik Anda."
                    />

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
                                    <Label htmlFor="name">Name</Label>

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
                                    <Label htmlFor="email">Email address</Label>

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
                                        Save
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">
                                            Saved
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>



                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
