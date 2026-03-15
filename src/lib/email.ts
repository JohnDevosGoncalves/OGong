import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("La variable d'environnement RESEND_API_KEY est requise");
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const FORMAT_LABELS: Record<string, string> = {
  speed_meeting: "Speed meeting",
  team: "Team",
  job_dating: "Job dating",
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function emailLayout(bodyContent: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:12px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color:#6366f1;padding:24px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">OGong</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${bodyContent}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #e4e4e7;text-align:center;">
              <p style="margin:0 0 8px;color:#a1a1aa;font-size:12px;">
                &copy; ${new Date().getFullYear()} OGong. Tous droits r&eacute;serv&eacute;s.
              </p>
              <p style="margin:0;color:#a1a1aa;font-size:11px;">
                Vous recevez cet email car vous participez &agrave; un &eacute;v&eacute;nement organis&eacute; via OGong.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${APP_URL}/reinitialiser-mot-de-passe?token=${token}`;

  await getResend().emails.send({
    from: "OGong <noreply@ogong.fr>",
    to: email,
    subject: "Réinitialisation de votre mot de passe — OGong",
    html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:12px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color:#6366f1;padding:24px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">OGong</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 16px;color:#18181b;font-size:20px;font-weight:600;">
                Réinitialisation de mot de passe
              </h2>
              <p style="margin:0 0 16px;color:#52525b;font-size:14px;line-height:1.6;">
                Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour en choisir un nouveau.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 24px;">
                    <a href="${resetLink}" style="display:inline-block;padding:12px 32px;background-color:#6366f1;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;border-radius:8px;">
                      Réinitialiser mon mot de passe
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;color:#71717a;font-size:13px;line-height:1.5;">
                Ce lien expire dans <strong>1 heure</strong>.
              </p>
              <p style="margin:0;color:#71717a;font-size:13px;line-height:1.5;">
                Si vous n'avez pas fait cette demande, vous pouvez ignorer cet email en toute sécurité.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #e4e4e7;text-align:center;">
              <p style="margin:0;color:#a1a1aa;font-size:12px;">
                &copy; ${new Date().getFullYear()} OGong. Tous droits réservés.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  });
}

// ─── Types pour les emails d'événements ──────────────────────

export interface EvenementEmailData {
  titre: string;
  date: Date;
  heureDebut: string;
  heureFin: string;
  format: string;
}

export interface EventResultsStats {
  nbTours: number;
  nbParticipants: number;
  nbRencontres: number;
}

// ─── Confirmation d'inscription ──────────────────────────────

export async function sendInscriptionConfirmation(
  email: string,
  prenom: string,
  evenement: EvenementEmailData & { numero: number }
) {
  const dateStr = formatDate(evenement.date);
  const formatLabel = FORMAT_LABELS[evenement.format] ?? evenement.format;

  const body = `
    <h2 style="margin:0 0 16px;color:#18181b;font-size:20px;font-weight:600;">
      Inscription confirm&eacute;e !
    </h2>
    <p style="margin:0 0 16px;color:#52525b;font-size:14px;line-height:1.6;">
      Bonjour <strong>${prenom}</strong>, votre inscription &agrave; l'&eacute;v&eacute;nement a bien &eacute;t&eacute; enregistr&eacute;e.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background-color:#f4f4f5;border-radius:8px;">
      <tr>
        <td style="padding:20px;">
          <p style="margin:0 0 4px;color:#18181b;font-size:16px;font-weight:600;">
            ${evenement.titre}
          </p>
          <p style="margin:0 0 4px;color:#52525b;font-size:13px;line-height:1.5;">
            ${dateStr}
          </p>
          <p style="margin:0 0 4px;color:#52525b;font-size:13px;line-height:1.5;">
            ${evenement.heureDebut} &mdash; ${evenement.heureFin}
          </p>
          <p style="margin:0;color:#52525b;font-size:13px;line-height:1.5;">
            Format : <strong>${formatLabel}</strong>
          </p>
        </td>
      </tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td align="center">
          <div style="display:inline-block;padding:12px 24px;background-color:#6366f1;border-radius:8px;">
            <p style="margin:0;color:#ffffff;font-size:13px;font-weight:500;">Votre num&eacute;ro de participant</p>
            <p style="margin:4px 0 0;color:#ffffff;font-size:28px;font-weight:700;">${evenement.numero}</p>
          </div>
        </td>
      </tr>
    </table>
    <p style="margin:0;color:#71717a;font-size:13px;line-height:1.5;">
      Conservez ce num&eacute;ro, il vous sera demand&eacute; le jour de l'&eacute;v&eacute;nement.
    </p>
  `;

  await getResend().emails.send({
    from: "OGong <noreply@ogong.fr>",
    to: email,
    subject: `Inscription confirmée — ${evenement.titre}`,
    html: emailLayout(body),
  });
}

// ─── Rappel avant l'événement ────────────────────────────────

export async function sendEventReminder(
  email: string,
  prenom: string,
  evenement: EvenementEmailData
) {
  const dateStr = formatDate(evenement.date);
  const formatLabel = FORMAT_LABELS[evenement.format] ?? evenement.format;

  const body = `
    <h2 style="margin:0 0 16px;color:#18181b;font-size:20px;font-weight:600;">
      Rappel : votre &eacute;v&eacute;nement approche !
    </h2>
    <p style="margin:0 0 16px;color:#52525b;font-size:14px;line-height:1.6;">
      Bonjour <strong>${prenom}</strong>, nous vous rappelons que vous &ecirc;tes inscrit(e) &agrave; l'&eacute;v&eacute;nement suivant :
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background-color:#f4f4f5;border-radius:8px;">
      <tr>
        <td style="padding:20px;">
          <p style="margin:0 0 4px;color:#18181b;font-size:16px;font-weight:600;">
            ${evenement.titre}
          </p>
          <p style="margin:0 0 4px;color:#52525b;font-size:13px;line-height:1.5;">
            ${dateStr}
          </p>
          <p style="margin:0 0 4px;color:#52525b;font-size:13px;line-height:1.5;">
            ${evenement.heureDebut} &mdash; ${evenement.heureFin}
          </p>
          <p style="margin:0;color:#52525b;font-size:13px;line-height:1.5;">
            Format : <strong>${formatLabel}</strong>
          </p>
        </td>
      </tr>
    </table>
    <p style="margin:0;color:#71717a;font-size:13px;line-height:1.5;">
      N'oubliez pas de vous pr&eacute;senter &agrave; l'heure indiqu&eacute;e. &Agrave; bient&ocirc;t !
    </p>
  `;

  await getResend().emails.send({
    from: "OGong <noreply@ogong.fr>",
    to: email,
    subject: `Rappel — ${evenement.titre}`,
    html: emailLayout(body),
  });
}

// ─── Notification de début d'événement ───────────────────────

export async function sendEventStartNotification(
  email: string,
  prenom: string,
  evenement: EvenementEmailData
) {
  const formatLabel = FORMAT_LABELS[evenement.format] ?? evenement.format;

  const body = `
    <h2 style="margin:0 0 16px;color:#18181b;font-size:20px;font-weight:600;">
      L'&eacute;v&eacute;nement a commenc&eacute; !
    </h2>
    <p style="margin:0 0 16px;color:#52525b;font-size:14px;line-height:1.6;">
      Bonjour <strong>${prenom}</strong>, l'&eacute;v&eacute;nement <strong>${evenement.titre}</strong> vient de d&eacute;marrer.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background-color:#f4f4f5;border-radius:8px;">
      <tr>
        <td style="padding:20px;">
          <p style="margin:0 0 4px;color:#18181b;font-size:16px;font-weight:600;">
            ${evenement.titre}
          </p>
          <p style="margin:0 0 4px;color:#52525b;font-size:13px;line-height:1.5;">
            Horaires : ${evenement.heureDebut} &mdash; ${evenement.heureFin}
          </p>
          <p style="margin:0;color:#52525b;font-size:13px;line-height:1.5;">
            Format : <strong>${formatLabel}</strong>
          </p>
        </td>
      </tr>
    </table>
    <p style="margin:0;color:#71717a;font-size:13px;line-height:1.5;">
      Rendez-vous sur place pour participer aux tours de rencontres.
    </p>
  `;

  await getResend().emails.send({
    from: "OGong <noreply@ogong.fr>",
    to: email,
    subject: `C'est parti — ${evenement.titre}`,
    html: emailLayout(body),
  });
}

// ─── Résultats de l'événement ────────────────────────────────

export async function sendEventResults(
  email: string,
  prenom: string,
  evenement: EvenementEmailData,
  stats: EventResultsStats
) {
  const dateStr = formatDate(evenement.date);

  const body = `
    <h2 style="margin:0 0 16px;color:#18181b;font-size:20px;font-weight:600;">
      R&eacute;sum&eacute; de l'&eacute;v&eacute;nement
    </h2>
    <p style="margin:0 0 16px;color:#52525b;font-size:14px;line-height:1.6;">
      Bonjour <strong>${prenom}</strong>, l'&eacute;v&eacute;nement <strong>${evenement.titre}</strong> est termin&eacute;. Voici un r&eacute;sum&eacute; :
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background-color:#f4f4f5;border-radius:8px;">
      <tr>
        <td style="padding:20px;">
          <p style="margin:0 0 4px;color:#18181b;font-size:16px;font-weight:600;">
            ${evenement.titre}
          </p>
          <p style="margin:0 0 12px;color:#52525b;font-size:13px;line-height:1.5;">
            ${dateStr}
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:8px 0;border-top:1px solid #e4e4e7;">
                <p style="margin:0;color:#52525b;font-size:13px;">Nombre de tours</p>
                <p style="margin:2px 0 0;color:#18181b;font-size:18px;font-weight:700;">${stats.nbTours}</p>
              </td>
              <td style="padding:8px 0;border-top:1px solid #e4e4e7;">
                <p style="margin:0;color:#52525b;font-size:13px;">Participants</p>
                <p style="margin:2px 0 0;color:#18181b;font-size:18px;font-weight:700;">${stats.nbParticipants}</p>
              </td>
              <td style="padding:8px 0;border-top:1px solid #e4e4e7;">
                <p style="margin:0;color:#52525b;font-size:13px;">Rencontres</p>
                <p style="margin:2px 0 0;color:#18181b;font-size:18px;font-weight:700;">${stats.nbRencontres}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 8px;color:#52525b;font-size:14px;line-height:1.6;">
      Merci d'avoir particip&eacute; ! Nous esp&eacute;rons que ces rencontres ont &eacute;t&eacute; enrichissantes.
    </p>
    <p style="margin:0;color:#71717a;font-size:13px;line-height:1.5;">
      &Agrave; bient&ocirc;t sur OGong !
    </p>
  `;

  await getResend().emails.send({
    from: "OGong <noreply@ogong.fr>",
    to: email,
    subject: `Résultats — ${evenement.titre}`,
    html: emailLayout(body),
  });
}

// ─── Utilitaire d'envoi par batch ────────────────────────────

export async function sendEmailsInBatches<T>(
  recipients: T[],
  sendFn: (recipient: T) => Promise<void>,
  batchSize = 10,
  delayMs = 1000
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);

    const results = await Promise.allSettled(
      batch.map((recipient) => sendFn(recipient))
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        sent++;
      } else {
        failed++;
        console.error("Erreur envoi email:", result.reason);
      }
    }

    // Pause entre les batches pour respecter les rate limits
    if (i + batchSize < recipients.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return { sent, failed };
}
