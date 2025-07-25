// import GitHub from '@auth/core/providers/github';
// import { defineConfig } from 'auth-astro';

// export default defineConfig({
//     providers: [
//         GitHub({
//             clientId: import.meta.env.GITHUB_CLIENT_ID,
//             clientSecret: import.meta.env.GITHUB_CLIENT_SECRET,
//         }),
//     ],
// });

import { defineConfig } from 'auth-astro';
import Google from '@auth/core/providers/google';



export default defineConfig({
    providers: [
        Google({
            clientId: import.meta.env.GOOGLE_CLIENT_ID,
            clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
});
    
// const request = new Request(origin)
// const response = await Auth(request, {
//     providers: [
//         Google({ clientId: GOOGLE_CLIENT_ID, clientSecret: GOOGLE_CLIENT_SECRET }),
//     ],
// })