import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialit\u00e9",
  description:
    "Politique de confidentialit\u00e9 et de protection des donn\u00e9es personnelles d\u2019OGong.",
};

export default function ConfidentialitePage() {
  return (
    <article className="prose-legal">
      <h1 className="text-3xl font-bold text-foreground mb-2">
        Politique de confidentialit&eacute;
      </h1>
      <p className="text-sm text-muted mb-10">
        Derni&egrave;re mise &agrave; jour&nbsp;: 15 mars 2026
      </p>

      {/* 1. Responsable du traitement */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-foreground mb-3">
          1. Responsable du traitement
        </h2>
        <p className="text-sm text-foreground/85 leading-relaxed">
          Le responsable du traitement des donn&eacute;es personnelles collect&eacute;es
          sur la plateforme OGong est&nbsp;:
        </p>
        <ul className="mt-3 space-y-1 text-sm text-foreground/85 leading-relaxed list-none">
          <li>
            <strong>OGong SAS</strong> <span className="text-muted">[&Agrave; COMPL&Eacute;TER]</span>
          </li>
          <li>SIRET&nbsp;: <span className="text-muted">[&Agrave; COMPL&Eacute;TER]</span></li>
          <li>
            Si&egrave;ge social&nbsp;: <span className="text-muted">[&Agrave; COMPL&Eacute;TER]</span>
          </li>
          <li>
            Email&nbsp;:{" "}
            <span className="text-muted">[&Agrave; COMPL&Eacute;TER &mdash; ex. dpo@ogong.fr]</span>
          </li>
        </ul>
      </section>

      {/* 2. Donn&eacute;es collect&eacute;es */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-foreground mb-3">
          2. Donn&eacute;es collect&eacute;es
        </h2>
        <p className="text-sm text-foreground/85 leading-relaxed mb-3">
          Dans le cadre de l&rsquo;utilisation de la plateforme, OGong collecte les
          donn&eacute;es personnelles suivantes&nbsp;:
        </p>
        <h3 className="text-base font-medium text-foreground mt-4 mb-2">
          Donn&eacute;es d&rsquo;identification
        </h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-foreground/85 leading-relaxed">
          <li>Nom et pr&eacute;nom</li>
          <li>Adresse email</li>
          <li>Num&eacute;ro de t&eacute;l&eacute;phone (facultatif)</li>
          <li>Mot de passe (stock&eacute; sous forme de hash s&eacute;curis&eacute;)</li>
        </ul>
        <h3 className="text-base font-medium text-foreground mt-4 mb-2">
          Donn&eacute;es li&eacute;es aux &eacute;v&eacute;nements
        </h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-foreground/85 leading-relaxed">
          <li>
            Informations relatives aux &eacute;v&eacute;nements cr&eacute;&eacute;s (titre,
            date, lieu, configuration)
          </li>
          <li>Listes de participants et donn&eacute;es de matching</li>
          <li>Historique des sessions et tours</li>
        </ul>
        <h3 className="text-base font-medium text-foreground mt-4 mb-2">
          Donn&eacute;es techniques
        </h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-foreground/85 leading-relaxed">
          <li>Adresse IP</li>
          <li>Type de navigateur et syst&egrave;me d&rsquo;exploitation</li>
          <li>Donn&eacute;es de journalisation (logs)</li>
        </ul>
      </section>

      {/* 3. Finalit&eacute;s */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-foreground mb-3">
          3. Finalit&eacute;s du traitement
        </h2>
        <p className="text-sm text-foreground/85 leading-relaxed mb-3">
          Vos donn&eacute;es personnelles sont trait&eacute;es pour les finalit&eacute;s
          suivantes&nbsp;:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-sm text-foreground/85 leading-relaxed">
          <li>Cr&eacute;ation et gestion de votre compte utilisateur</li>
          <li>Organisation et gestion des &eacute;v&eacute;nements de networking</li>
          <li>
            Fonctionnement de l&rsquo;algorithme de matching pour la constitution des tours
            et binomes
          </li>
          <li>Envoi de notifications par email (confirmations, rappels, invitations)</li>
          <li>Gestion des paiements et de la facturation</li>
          <li>Am&eacute;lioration de la plateforme et analyse d&rsquo;usage</li>
          <li>S&eacute;curit&eacute; et pr&eacute;vention des fraudes</li>
        </ul>
      </section>

      {/* 4. Base l&eacute;gale */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-foreground mb-3">
          4. Base l&eacute;gale du traitement
        </h2>
        <ul className="list-disc list-inside space-y-1.5 text-sm text-foreground/85 leading-relaxed">
          <li>
            <strong>Ex&eacute;cution contractuelle</strong> (art. 6.1.b RGPD)&nbsp;: gestion
            du compte, des &eacute;v&eacute;nements, du matching et des paiements
          </li>
          <li>
            <strong>Consentement</strong> (art. 6.1.a RGPD)&nbsp;: envoi de communications
            marketing
          </li>
          <li>
            <strong>Int&eacute;r&ecirc;t l&eacute;gitime</strong> (art. 6.1.f RGPD)&nbsp;:
            am&eacute;lioration du service, s&eacute;curit&eacute;, pr&eacute;vention des
            fraudes
          </li>
          <li>
            <strong>Obligation l&eacute;gale</strong> (art. 6.1.c RGPD)&nbsp;: conservation
            des donn&eacute;es de facturation
          </li>
        </ul>
      </section>

      {/* 5. Destinataires */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-foreground mb-3">
          5. Destinataires des donn&eacute;es
        </h2>
        <p className="text-sm text-foreground/85 leading-relaxed mb-3">
          Vos donn&eacute;es personnelles peuvent &ecirc;tre communiqu&eacute;es aux
          sous-traitants suivants, dans le strict cadre de leurs prestations&nbsp;:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-sm text-foreground/85 leading-relaxed">
          <li>
            <strong>Stripe</strong> (paiement s&eacute;curis&eacute;)&nbsp;: donn&eacute;es
            de transaction
          </li>
          <li>
            <strong>Resend</strong> (envoi d&rsquo;emails transactionnels)&nbsp;: adresse
            email, nom
          </li>
          <li>
            <strong>Vercel</strong> (h&eacute;bergement de la plateforme)&nbsp;:
            donn&eacute;es techniques
          </li>
        </ul>
        <p className="text-sm text-foreground/85 leading-relaxed mt-3">
          OGong ne vend ni ne loue vos donn&eacute;es personnelles &agrave; des tiers.
        </p>
      </section>

      {/* 6. Dur&eacute;e de conservation */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-foreground mb-3">
          6. Dur&eacute;e de conservation
        </h2>
        <ul className="list-disc list-inside space-y-1.5 text-sm text-foreground/85 leading-relaxed">
          <li>
            <strong>Donn&eacute;es de compte</strong>&nbsp;: conserv&eacute;es pendant la
            dur&eacute;e de votre inscription, puis supprim&eacute;es dans un d&eacute;lai
            de 30 jours apr&egrave;s la cl&ocirc;ture de votre compte
          </li>
          <li>
            <strong>Donn&eacute;es d&rsquo;&eacute;v&eacute;nements</strong>&nbsp;:
            conserv&eacute;es pendant 3 ans apr&egrave;s la date de
            l&rsquo;&eacute;v&eacute;nement
          </li>
          <li>
            <strong>Donn&eacute;es de facturation</strong>&nbsp;: conserv&eacute;es pendant
            10 ans conform&eacute;ment aux obligations comptables
          </li>
          <li>
            <strong>Logs techniques</strong>&nbsp;: conserv&eacute;s pendant 12 mois
          </li>
        </ul>
      </section>

      {/* 7. Transferts hors UE */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-foreground mb-3">
          7. Transferts de donn&eacute;es hors Union europ&eacute;enne
        </h2>
        <p className="text-sm text-foreground/85 leading-relaxed mb-3">
          Certains de nos sous-traitants sont situ&eacute;s aux &Eacute;tats-Unis&nbsp;:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-sm text-foreground/85 leading-relaxed">
          <li>
            <strong>Vercel Inc.</strong> &mdash; h&eacute;bergement (certifi&eacute; EU-US
            Data Privacy Framework)
          </li>
          <li>
            <strong>Stripe Inc.</strong> &mdash; paiement (certifi&eacute; EU-US Data
            Privacy Framework)
          </li>
        </ul>
        <p className="text-sm text-foreground/85 leading-relaxed mt-3">
          Ces transferts sont encadr&eacute;s par des m&eacute;canismes de protection
          conformes au RGPD (clauses contractuelles types, d&eacute;cision
          d&rsquo;ad&eacute;quation ou certification DPF).
        </p>
      </section>

      {/* 8. Droits des personnes */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-foreground mb-3">
          8. Vos droits
        </h2>
        <p className="text-sm text-foreground/85 leading-relaxed mb-3">
          Conform&eacute;ment au RGPD, vous disposez des droits suivants sur vos
          donn&eacute;es personnelles&nbsp;:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-sm text-foreground/85 leading-relaxed">
          <li>
            <strong>Droit d&rsquo;acc&egrave;s</strong>&nbsp;: obtenir une copie de vos
            donn&eacute;es personnelles
          </li>
          <li>
            <strong>Droit de rectification</strong>&nbsp;: corriger des donn&eacute;es
            inexactes ou incompl&egrave;tes
          </li>
          <li>
            <strong>Droit &agrave; l&rsquo;effacement</strong>&nbsp;: demander la
            suppression de vos donn&eacute;es
          </li>
          <li>
            <strong>Droit &agrave; la portabilit&eacute;</strong>&nbsp;: recevoir vos
            donn&eacute;es dans un format structur&eacute; et lisible par machine
          </li>
          <li>
            <strong>Droit d&rsquo;opposition</strong>&nbsp;: vous opposer au traitement de
            vos donn&eacute;es pour des motifs l&eacute;gitimes
          </li>
          <li>
            <strong>Droit &agrave; la limitation</strong>&nbsp;: demander la suspension du
            traitement de vos donn&eacute;es
          </li>
        </ul>
        <p className="text-sm text-foreground/85 leading-relaxed mt-3">
          Pour exercer vos droits, contactez-nous &agrave; l&rsquo;adresse&nbsp;:{" "}
          <span className="text-muted">[&Agrave; COMPL&Eacute;TER &mdash; ex. dpo@ogong.fr]</span>.
          Nous nous engageons &agrave; r&eacute;pondre dans un d&eacute;lai d&rsquo;un mois.
        </p>
        <p className="text-sm text-foreground/85 leading-relaxed mt-2">
          Vous disposez &eacute;galement du droit d&rsquo;introduire une r&eacute;clamation
          aupr&egrave;s de la CNIL (
          <a
            href="https://www.cnil.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary-hover underline transition-colors"
          >
            www.cnil.fr
          </a>
          ).
        </p>
      </section>

      {/* 9. Cookies */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-foreground mb-3">
          9. Cookies
        </h2>
        <p className="text-sm text-foreground/85 leading-relaxed mb-3">
          La plateforme OGong utilise exclusivement des cookies techniques strictement
          n&eacute;cessaires au fonctionnement du service&nbsp;:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-sm text-foreground/85 leading-relaxed">
          <li>
            <strong>Cookie de session</strong>&nbsp;: maintien de votre authentification
          </li>
          <li>
            <strong>Cookie de pr&eacute;f&eacute;rences</strong>&nbsp;: th&egrave;me
            d&rsquo;affichage, langue
          </li>
        </ul>
        <p className="text-sm text-foreground/85 leading-relaxed mt-3">
          Aucun cookie publicitaire ou de tra&ccedil;age n&rsquo;est utilis&eacute;. Ces
          cookies techniques &eacute;tant indispensables au fonctionnement du service, ils
          ne n&eacute;cessitent pas votre consentement pr&eacute;alable
          (art. 82 de la loi Informatique et Libert&eacute;s).
        </p>
      </section>

      {/* 10. S&eacute;curit&eacute; */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-foreground mb-3">
          10. S&eacute;curit&eacute; des donn&eacute;es
        </h2>
        <p className="text-sm text-foreground/85 leading-relaxed mb-3">
          OGong met en oeuvre des mesures techniques et organisationnelles
          appropri&eacute;es pour assurer la s&eacute;curit&eacute; de vos
          donn&eacute;es&nbsp;:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-sm text-foreground/85 leading-relaxed">
          <li>Chiffrement des communications (HTTPS/TLS)</li>
          <li>Hachage des mots de passe avec bcrypt</li>
          <li>Contr&ocirc;le d&rsquo;acc&egrave;s strict aux bases de donn&eacute;es</li>
          <li>Sauvegardes r&eacute;guli&egrave;res</li>
          <li>Surveillance et journalisation des acc&egrave;s</li>
        </ul>
      </section>

      {/* 11. Contact DPO */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-foreground mb-3">
          11. D&eacute;l&eacute;gu&eacute; &agrave; la protection des donn&eacute;es
        </h2>
        <p className="text-sm text-foreground/85 leading-relaxed">
          Pour toute question relative &agrave; la protection de vos donn&eacute;es
          personnelles, vous pouvez contacter notre
          D&eacute;l&eacute;gu&eacute; &agrave; la Protection des Donn&eacute;es
          (DPO)&nbsp;:
        </p>
        <ul className="mt-3 space-y-1 text-sm text-foreground/85 leading-relaxed list-none">
          <li>
            Email&nbsp;:{" "}
            <span className="text-muted">[&Agrave; COMPL&Eacute;TER &mdash; ex. dpo@ogong.fr]</span>
          </li>
          <li>
            Adresse postale&nbsp;:{" "}
            <span className="text-muted">[&Agrave; COMPL&Eacute;TER]</span>
          </li>
        </ul>
      </section>

      {/* 12. Modification */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-3">
          12. Modification de la politique de confidentialit&eacute;
        </h2>
        <p className="text-sm text-foreground/85 leading-relaxed">
          OGong se r&eacute;serve le droit de modifier la pr&eacute;sente politique de
          confidentialit&eacute; &agrave; tout moment. En cas de modification substantielle,
          les utilisateurs seront inform&eacute;s par email ou par notification sur la
          plateforme. La date de derni&egrave;re mise &agrave; jour est indiqu&eacute;e en
          haut de cette page.
        </p>
      </section>
    </article>
  );
}
