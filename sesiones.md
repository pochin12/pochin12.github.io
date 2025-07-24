Necesitas pasar las propiedades de la sesión a otras páginas o componentes?
A componentes .astro o frameworks UI (React, Vue, etc.): Si tienes componentes en la misma página que necesitan saber si hay una sesión activa o acceder a los datos del usuario, sí, debes pasar la session como una prop.

<Layoutmenu>
    <h1>Autenticar</h1>
    <SomeOtherComponent client:load session={session} />
</Layoutmenu>

En SomeOtherComponent.astro:

---
interface Props {
  session: { user?: { email: string } } | null;
}
const { session } = Astro.props;
---
{session && <p>Desde otro componente: {session.user?.email}</p>}
.

A páginas diferentes: Para que la sesión esté disponible en otras páginas de tu aplicación, cada página individual necesitará llamar a getSession(Astro.request) en su propio frontmatter. Es una buena práctica porque la sesión es parte del estado de la solicitud y no se "persiste" mágicamente entre rutas sin volver a verificarla.