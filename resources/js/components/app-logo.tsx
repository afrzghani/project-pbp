import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-blue-500 dark:bg-blue-500 text-sidebar-primary-foreground">
                <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
            </div>
            <div className="ml-1 grid flex-1 items-center ext-left text-xl">
                <span className="mb-0.5 truncate leading-tight font-semibold ">
                    NoteStation
                </span>
            </div>
        </>
    );
}
