export const DEFS = {
    marker_standart:
        `<marker id="marker-standart" viewBox="-5 -5 10 10" refX="0" refY="0" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M-5,-5 L5,0 L-5,5"></path>
        </marker>`,
    marker_inhibitory:
        `<marker id="marker-inhibitory" viewBox="-5 -5 10 10" refX="0" refY="0" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <ellipse rx="4" ry="4"/>
        </marker>`,
    mark_0:
        `<pattern id="mark_0" width="100%" height="100%">
            <circle cx="40" cy="40" r="40" fill="white" fill-opacity="0.9" stroke="#C9DAE7"/>
        </pattern>`,

    mark_1:
        `<pattern id="mark_1" width="100%" height="100%">
            <circle cx="40" cy="40" r="40" fill="white" fill-opacity="0.9" stroke="#C9DAE7"/>
            <circle cx="40" cy="40" r="7.5" fill="url(#markGradient)"/>
            <defs>
                <radialGradient id="markGradient" gradientTransform="translate(0.1 -0.1)">
                    <stop stop-color="#275580"/>
                    <stop offset="1" stop-color="#161A1E"/>
                </radialGradient>
            </defs>
        </pattern>`,

    mark_2:
        `<pattern id="mark_2" width="100%" height="100%">
            <circle cx="40" cy="40" r="40" fill="white" fill-opacity="0.9" stroke="#C9DAE7"/>
            <circle cx="26.6666" cy="40" r="7.5" fill="url(#markGradient)"/>
            <circle cx="53.3333" cy="40" r="7.5" fill="url(#markGradient)"/>
            <defs>
                <radialGradient id="markGradient" gradientTransform="translate(0.1 -0.1)">
                    <stop stop-color="#275580"/>
                    <stop offset="1" stop-color="#161A1E"/>
                </radialGradient>
            </defs>
        </pattern>`,

    mark_3:
        `<pattern id="mark_3" width="100%" height="100%">
            <circle cx="40" cy="40" r="40" fill="white" fill-opacity="0.9" stroke="#C9DAE7"/>
            <circle cx="26.6666" cy="33.3333" r="7.5" fill="url(#markGradient)"/>
            <circle cx="53.3333" cy="33.3333" r="7.5" fill="url(#markGradient)"/>
            <circle cx="40.0000" cy="53.3333" r="7.5" fill="url(#markGradient)"/>
            <defs>
                <radialGradient id="markGradient" gradientTransform="translate(0.1 -0.1)">
                    <stop stop-color="#275580"/>
                    <stop offset="1" stop-color="#161A1E"/>
                </radialGradient>
            </defs>
        </pattern>`,

    mark_4:
        `<pattern id="mark_4" width="100%" height="100%">
            <circle cx="40" cy="40" r="40" fill="white" fill-opacity="0.9" stroke="#C9DAE7"/>
            <circle cx="26.6666" cy="26.6666" r="7.5" fill="url(#markGradient)"/>
            <circle cx="26.6666" cy="53.3333" r="7.5" fill="url(#markGradient)"/>
            <circle cx="53.3333" cy="26.6666" r="7.5" fill="url(#markGradient)"/>
            <circle cx="53.3333" cy="53.3333" r="7.5" fill="url(#markGradient)"/>
            <defs>
                <radialGradient id="markGradient" gradientTransform="translate(0.1 -0.1)">
                    <stop stop-color="#275580"/>
                    <stop offset="1" stop-color="#161A1E"/>
                </radialGradient>
            </defs>
        </pattern>`,

    mark_5:
        `<pattern id="mark_5" width="100%" height="100%">
            <circle cx="40" cy="40" r="40" fill="white" fill-opacity="0.9" stroke="#C9DAE7"/>
            <circle cx="25" cy="25" r="7.5" fill="url(#markGradient)"/>
            <circle cx="25" cy="55" r="7.5" fill="url(#markGradient)"/>
            <circle cx="55" cy="25" r="7.5" fill="url(#markGradient)"/>
            <circle cx="55" cy="55" r="7.5" fill="url(#markGradient)"/>
            <circle cx="40" cy="40" r="7.5" fill="url(#markGradient)"/>
            <defs>
                <radialGradient id="markGradient" gradientTransform="translate(0.1 -0.1)">
                    <stop stop-color="#275580"/>
                    <stop offset="1" stop-color="#161A1E"/>
                </radialGradient>
            </defs>
        </pattern>`,

    mark_custom:
        `<pattern id="mark_custom" width="100%" height="100%">
            <circle cx="40" cy="40" r="40" fill="white" fill-opacity="0.9" stroke="#C9DAE7"/>
            <circle cx="18.5" cy="40" r="7.5" fill="url(#markGradient)"/>
            <defs>
                <radialGradient id="markGradient" gradientTransform="translate(0.1 -0.1)">
                    <stop stop-color="#275580"/>
                    <stop offset="1" stop-color="#161A1E"/>
                </radialGradient>
            </defs>
        </pattern>`,
}
