import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions l\u00e9gales",
  description: "Mentions l\u00e9gales du site OGong.",
};

export default function MentionsLegalesPage() {
  return (
    <article className="prose-legal">
      <h1 className="text-3xl font-bold text-foreground mb-2">
        Mentions l&eacute;gales
      </h1>
      <p className="text-sm text-muted mb-10">
        Derni&egrave;re mise &agrave; jour&nbsp;: 15 mars 2026
      </p>

      {/* 1. &Eacute;diteur */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-foreground mb-3">
          1. &Eacute;diteur du site
        </h2>
        <p className="text-sm text-foreground/85 leading-relaxed mb-3">
          Le site OGong est &eacute;dit&eacute; par&nbsp;:
        </p>
        <ul className="space-y-1 text-sm text-foreground/85 leading-relaxed list-none">
          <li>
            <strong>OGong SAS</strong>
          </li>
          <li>
            Capital social&nbsp;: <span className="text-muted">[&Agrave; COMPL&Eacute;TER]</span>
          </li>
          <li>
            SIRET&nbsp;: <span className="text-muted">[&Agrave; COMPL&Eacute;TER]</span>
          </li>
          <li>
            RCS&nbsp;: <span className="text-muted">[&Agrave; COMPL&Eacute;TER]</span>
          </li>
          <li>
            Si&egrave;ge social&nbsp;: <span className="text-muted">[&Agrave; COMPL&Eacute;TER]</span>
          </li>
          <li>
            Num&eacute;ro TVA intracommunautaire&nbsp;:{" "}
            <span className="text-muted">[&Agrave; COMPL&Eacute;TER]</span>
          </li>
        </ul>
      </section>

      {/* 2. Directeur de la publication */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-foreground mb-3">
          2. Directeur de la publication
        </h2>
        <p className="text-sm text-foreground/85 leading-relaxed">
          Le directeur de la publication est&nbsp;:{" "}
          <span className="text-muted">[&Agrave; COMPL&Eacute;TER &mdash; Nom et pr&eacute;nom]</span>,
          en qualit&eacute; de{" "}
          <span className="text-muted">[&Agrave; COMPL&Eacute;TER &mdash; Pr&eacute;sident / G&eacute;rant]</span>.
        </p>
      </section>

      {/* 3. H&eacute;bergeur */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-foreground mb-3">
          3. H&eacute;bergeur
        </h2>
        <p className="text-sm text-foreground/85 leading-relaxed mb-3">
          Le site est h&eacute;berg&eacute; par&nbsp;:
        </p>
        <ul className="space-y-1 text-sm text-foreground/85 leading-relaxed list-none">
          <li>
            <strong>Vercel Inc.</strong>
          </li>
          <li>440 N Barranca Ave #4133, Covina, CA 91723, &Eacute;tats-Unis</li>
          <li>
            Site web&nbsp;:{" "}
            <a
              href="https://vercel.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary-hover underline transition-colors"
            >
              vercel.com
            </a>
          </li>
        </ul>
      </section>

      {/* 4. Contact */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-foreground mb-3">
          4. Contact
        </h2>
        <ul className="space-y-1 text-sm text-foreground/85 leading-relaxed list-none">
          <li>
            Email&nbsp;:{" "}
            <span className="text-muted">[&Agrave; COMPL&Eacute;TER &mdash; ex. contact@ogong.fr]</span>
          </li>
          <li>
            T&eacute;l&eacute;phone&nbsp;:{" "}
            <span className="text-muted">[&Agrave; COMPL&Eacute;TER]</span>
          </li>
        </ul>
      </section>

      {/* 5. Propri&eacute;t&eacute; intellectuelle */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-foreground mb-3">
          5. Propri&eacute;t&eacute; intellectuelle
        </h2>
        <p className="text-sm text-foreground/85 leading-relaxed mb-3">
          L&rsquo;ensemble du contenu du site OGong (textes, images, graphismes, logo,
          ic&ocirc;nes, logiciels, base de donn&eacute;es) est la propri&eacute;t&eacute;
          exclusive d&rsquo;OGong SAS ou de ses partenaires et est
          prot&eacute;g&eacute; par les lois fran&ccedil;aises et internationales
          relatives &agrave; la propri&eacute;t&eacute; intellectuelle.
        </p>
        <p className="text-sm text-foreground/85 leading-relaxed">
          Toute reproduction, repr&eacute;sentation, modification, publication ou
          adaptation de tout ou partie des &eacute;l&eacute;ments du site, quel que soit le
          moyen ou le proc&eacute;d&eacute; utilis&eacute;, est interdite sans
          autorisation &eacute;crite pr&eacute;alable d&rsquo;OGong SAS.
        </p>
      </section>

      {/* 6. Cr&eacute;dits */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-3">
          6. Cr&eacute;dits
        </h2>
        <p className="text-sm text-foreground/85 leading-relaxed mb-3">
          Ce site a &eacute;t&eacute; d&eacute;velopp&eacute; avec les technologies
          suivantes&nbsp;:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-foreground/85 leading-relaxed">
          <li>
            <strong>Next.js</strong> &mdash; Framework React
          </li>
          <li>
            <strong>Prisma</strong> &mdash; ORM et gestion de base de donn&eacute;es
          </li>
          <li>
            <strong>Tailwind CSS</strong> &mdash; Framework CSS
          </li>
          <li>
            <strong>NextAuth.js</strong> &mdash; Authentification
          </li>
          <li>
            <strong>Stripe</strong> &mdash; Paiement en ligne
          </li>
          <li>
            <strong>Resend</strong> &mdash; Envoi d&rsquo;emails transactionnels
          </li>
          <li>
            <strong>Vercel</strong> &mdash; H&eacute;bergement et d&eacute;ploiement
          </li>
        </ul>
      </section>
    </article>
  );
}
