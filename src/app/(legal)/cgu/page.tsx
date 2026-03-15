import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions G\u00e9n\u00e9rales d\u2019Utilisation",
  description:
    "Conditions g\u00e9n\u00e9rales d\u2019utilisation de la plateforme OGong.",
};

export default function CGUPage() {
  return (
    <article className="prose-legal">
      <h1 className="text-3xl font-bold text-foreground mb-2">
        Conditions G&eacute;n&eacute;rales d&rsquo;Utilisation
      </h1>
      <p className="text-sm text-muted mb-10">
        Date d&rsquo;entr&eacute;e en vigueur&nbsp;: 15 mars 2026
      </p>

      {/* Article 1 */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-foreground mb-3">
          Article 1 &mdash; Objet
        </h2>
        <p className="text-sm text-foreground/85 leading-relaxed mb-3">
          Les pr&eacute;sentes Conditions G&eacute;n&eacute;rales d&rsquo;Utilisation
          (ci-apr&egrave;s &laquo;&nbsp;CGU&nbsp;&raquo;) ont pour objet de
          d&eacute;finir les modalit&eacute;s et conditions d&rsquo;acc&egrave;s et
          d&rsquo;utilisation de la plateforme OGong, accessible &agrave; l&rsquo;adresse{" "}
          <strong>[&Agrave; COMPL&Eacute;TER]</strong>.
        </p>
        <p className="text-sm text-foreground/85 leading-relaxed">
          OGong est une plateforme SaaS de gestion d&rsquo;&eacute;v&eacute;nements de
          networking permettant d&rsquo;organiser des speed meetings, sessions de team
          building, job datings et autres rencontres professionnelles gr&acirc;ce &agrave;
          un algorithme de matching automatis&eacute;.
        </p>
      </section>

      {/* Article 2 */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-foreground mb-3">
          Article 2 &mdash; Inscription et compte
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-foreground/85 leading-relaxed">
          <li>
            L&rsquo;acc&egrave;s aux fonctionnalit&eacute;s de la plateforme
            n&eacute;cessite la cr&eacute;ation d&rsquo;un compte utilisateur.
            L&rsquo;inscription est gratuite.
          </li>
          <li>
            L&rsquo;utilisateur s&rsquo;engage &agrave; fournir des informations exactes
            et &agrave; jour lors de son inscription et &agrave; les maintenir
            actualis&eacute;es.
          </li>
          <li>
            Les identifiants de connexion sont personnels et confidentiels.
            L&rsquo;utilisateur est seul responsable de l&rsquo;utilisation faite de son
            compte et de la pr&eacute;servation de la confidentialit&eacute; de son mot de
            passe.
          </li>
          <li>
            Toute activit&eacute; r&eacute;alis&eacute;e depuis le compte de
            l&rsquo;utilisateur est r&eacute;put&eacute;e effectu&eacute;e par lui.
            L&rsquo;utilisateur s&rsquo;engage &agrave; informer imm&eacute;diatement
            OGong en cas d&rsquo;utilisation non autoris&eacute;e de son compte.
          </li>
        </ol>
      </section>

      {/* Article 3 */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-foreground mb-3">
          Article 3 &mdash; Description du service
        </h2>
        <p className="text-sm text-foreground/85 leading-relaxed mb-3">
          La plateforme OGong propose les fonctionnalit&eacute;s suivantes&nbsp;:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-sm text-foreground/85 leading-relaxed">
          <li>
            Cr&eacute;ation et gestion d&rsquo;&eacute;v&eacute;nements de networking
            (speed meetings, team building, job dating)
          </li>
          <li>
            Algorithme de matching automatis&eacute; pour la constitution de tours, tables
            et binomes
          </li>
          <li>
            Gestion en temps r&eacute;el des sessions&nbsp;: minuterie, rotation des
            participants, attribution des places
          </li>
          <li>
            Tableau de bord de suivi et statistiques d&rsquo;&eacute;v&eacute;nements
          </li>
          <li>Notifications par email aux participants</li>
          <li>Gestion des cr&eacute;dits et facturation</li>
        </ul>
      </section>

      {/* Article 4 */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-foreground mb-3">
          Article 4 &mdash; Cr&eacute;dits et paiement
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-foreground/85 leading-relaxed">
          <li>
            L&rsquo;utilisation de certaines fonctionnalit&eacute;s de la plateforme est
            soumise &agrave; un syst&egrave;me de cr&eacute;dits. Chaque
            &eacute;v&eacute;nement cr&eacute;&eacute; consomme un nombre de
            cr&eacute;dits variable selon le type et le nombre de participants.
          </li>
          <li>
            Les cr&eacute;dits peuvent &ecirc;tre acquis via les offres tarifaires
            propos&eacute;es sur la plateforme. Les prix sont indiqu&eacute;s en euros TTC.
          </li>
          <li>
            Les paiements sont trait&eacute;s de mani&egrave;re s&eacute;curis&eacute;e
            par Stripe. OGong ne stocke aucune donn&eacute;e bancaire.
          </li>
          <li>
            Les cr&eacute;dits achet&eacute;s ne sont ni remboursables ni
            transf&eacute;rables, sauf disposition l&eacute;gale contraire.
          </li>
        </ol>
      </section>

      {/* Article 5 */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-foreground mb-3">
          Article 5 &mdash; Obligations de l&rsquo;utilisateur
        </h2>
        <p className="text-sm text-foreground/85 leading-relaxed mb-3">
          L&rsquo;utilisateur s&rsquo;engage &agrave;&nbsp;:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-sm text-foreground/85 leading-relaxed">
          <li>
            Utiliser la plateforme de mani&egrave;re loyale et conform&eacute;ment &agrave;
            sa destination
          </li>
          <li>
            Ne pas diffuser de contenus illicites, diffamatoires, injurieux ou portant
            atteinte aux droits de tiers
          </li>
          <li>
            Ne pas tenter d&rsquo;acc&eacute;der de mani&egrave;re non autoris&eacute;e
            aux syst&egrave;mes, donn&eacute;es ou comptes d&rsquo;autres utilisateurs
          </li>
          <li>
            Ne pas utiliser de moyens automatis&eacute;s (bots, scraping) pour
            acc&eacute;der &agrave; la plateforme ou en extraire des donn&eacute;es
          </li>
          <li>
            Respecter les droits de propri&eacute;t&eacute; intellectuelle d&rsquo;OGong
            et des tiers
          </li>
        </ul>
      </section>

      {/* Article 6 */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-foreground mb-3">
          Article 6 &mdash; Propri&eacute;t&eacute; intellectuelle
        </h2>
        <p className="text-sm text-foreground/85 leading-relaxed mb-3">
          L&rsquo;ensemble des &eacute;l&eacute;ments composant la plateforme OGong
          (algorithmes, code source, interfaces, marque, logo, textes, visuels) sont la
          propri&eacute;t&eacute; exclusive d&rsquo;OGong ou de ses
          conc&eacute;dants de licence et sont prot&eacute;g&eacute;s par le droit de la
          propri&eacute;t&eacute; intellectuelle.
        </p>
        <p className="text-sm text-foreground/85 leading-relaxed">
          Toute reproduction, repr&eacute;sentation, modification ou exploitation non
          autoris&eacute;e de tout ou partie de ces &eacute;l&eacute;ments est interdite et
          constitue une contrefa&ccedil;on sanctionn&eacute;e par les articles L.335-2 et
          suivants du Code de la propri&eacute;t&eacute; intellectuelle.
        </p>
      </section>

      {/* Article 7 */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-foreground mb-3">
          Article 7 &mdash; Protection des donn&eacute;es personnelles
        </h2>
        <p className="text-sm text-foreground/85 leading-relaxed">
          OGong collecte et traite des donn&eacute;es personnelles dans le cadre de
          l&rsquo;utilisation de la plateforme, conform&eacute;ment au R&egrave;glement
          G&eacute;n&eacute;ral sur la Protection des Donn&eacute;es (RGPD) et &agrave; la
          loi Informatique et Libert&eacute;s. Pour plus d&rsquo;informations sur le
          traitement de vos donn&eacute;es, veuillez consulter notre{" "}
          <a
            href="/confidentialite"
            className="text-primary hover:text-primary-hover underline transition-colors"
          >
            Politique de confidentialit&eacute;
          </a>
          .
        </p>
      </section>

      {/* Article 8 */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-foreground mb-3">
          Article 8 &mdash; Responsabilit&eacute;
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-foreground/85 leading-relaxed">
          <li>
            OGong met en oeuvre les moyens raisonnables pour assurer la
            disponibilit&eacute; et le bon fonctionnement de la plateforme. Toutefois,
            OGong ne garantit pas un acc&egrave;s ininterrompu et ne saurait &ecirc;tre
            tenue responsable des interruptions temporaires li&eacute;es &agrave; la
            maintenance, aux mises &agrave; jour ou &agrave; des circonstances
            ind&eacute;pendantes de sa volont&eacute;.
          </li>
          <li>
            OGong ne saurait &ecirc;tre tenue responsable des dommages indirects
            r&eacute;sultant de l&rsquo;utilisation ou de l&rsquo;impossibilit&eacute;
            d&rsquo;utiliser la plateforme.
          </li>
          <li>
            La responsabilit&eacute; d&rsquo;OGong ne saurait exc&eacute;der, en tout
            &eacute;tat de cause, le montant des sommes effectivement vers&eacute;es par
            l&rsquo;utilisateur au cours des douze (12) derniers mois.
          </li>
        </ol>
      </section>

      {/* Article 9 */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-foreground mb-3">
          Article 9 &mdash; R&eacute;siliation
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-foreground/85 leading-relaxed">
          <li>
            L&rsquo;utilisateur peut &agrave; tout moment supprimer son compte depuis les
            param&egrave;tres de son profil ou en contactant le support.
          </li>
          <li>
            OGong se r&eacute;serve le droit de suspendre ou supprimer un compte en cas de
            violation des pr&eacute;sentes CGU, sans pr&eacute;avis ni
            indemnit&eacute;.
          </li>
          <li>
            En cas de r&eacute;siliation, les cr&eacute;dits non utilis&eacute;s ne
            donnent lieu &agrave; aucun remboursement, sauf disposition l&eacute;gale
            contraire.
          </li>
        </ol>
      </section>

      {/* Article 10 */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-foreground mb-3">
          Article 10 &mdash; Modification des CGU
        </h2>
        <p className="text-sm text-foreground/85 leading-relaxed">
          OGong se r&eacute;serve le droit de modifier les pr&eacute;sentes CGU &agrave;
          tout moment. Les utilisateurs seront inform&eacute;s de toute modification
          substantielle par email ou par notification sur la plateforme au moins trente (30)
          jours avant leur entr&eacute;e en vigueur. La poursuite de l&rsquo;utilisation de
          la plateforme apr&egrave;s cette date vaut acceptation des nouvelles conditions.
        </p>
      </section>

      {/* Article 11 */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-3">
          Article 11 &mdash; Droit applicable et juridiction comp&eacute;tente
        </h2>
        <p className="text-sm text-foreground/85 leading-relaxed mb-3">
          Les pr&eacute;sentes CGU sont r&eacute;gies par le droit fran&ccedil;ais.
        </p>
        <p className="text-sm text-foreground/85 leading-relaxed">
          En cas de litige relatif &agrave; l&rsquo;interpr&eacute;tation ou &agrave;
          l&rsquo;ex&eacute;cution des pr&eacute;sentes, les parties s&rsquo;efforceront de
          trouver une solution amiable. &Agrave; d&eacute;faut, le litige sera soumis aux
          tribunaux comp&eacute;tents de Paris.
        </p>
      </section>
    </article>
  );
}
