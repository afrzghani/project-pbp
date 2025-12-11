import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <img src="/images/logo.png" alt="Logo" className="size-6 object-contain" />
    );
}
